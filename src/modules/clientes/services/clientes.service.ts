/**
 * Servicio de Clientes
 * Gestión completa del módulo de clientes
 */

import { supabase } from '@/lib/supabase/client'
import type {
    ActualizarClienteDTO,
    Cliente,
    ClienteResumen,
    CrearClienteDTO,
    FiltrosClientes,
} from '../types'

class ClientesService {
  /**
   * Obtener todos los clientes con estadísticas
   */
  async obtenerClientes(filtros?: FiltrosClientes): Promise<ClienteResumen[]> {
    let query = supabase.from('vista_clientes_resumen').select('*')

    // Aplicar filtros
    if (filtros?.estado && filtros.estado.length > 0) {
      query = query.in('estado', filtros.estado)
    }

    if (filtros?.origen && filtros.origen.length > 0) {
      query = query.in('origen', filtros.origen)
    }

    if (filtros?.busqueda) {
      query = query.or(
        `nombre_completo.ilike.%${filtros.busqueda}%,numero_documento.ilike.%${filtros.busqueda}%,telefono.ilike.%${filtros.busqueda}%,email.ilike.%${filtros.busqueda}%`
      )
    }

    if (filtros?.fecha_desde) {
      query = query.gte('fecha_creacion', filtros.fecha_desde)
    }

    if (filtros?.fecha_hasta) {
      query = query.lte('fecha_creacion', filtros.fecha_hasta)
    }

    const { data, error } = await query.order('fecha_creacion', {
      ascending: false,
    })

    if (error) throw error
    return (data || []) as ClienteResumen[]
  }

  /**
   * Obtener un cliente por ID con sus negociaciones, intereses y estadísticas
   */
  async obtenerCliente(id: string): Promise<Cliente | null> {
    // 1. Obtener datos del cliente con negociaciones
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .select(
        `
        *,
        negociaciones!negociaciones_cliente_id_fkey (
          id,
          estado,
          valor_total,
          total_abonado,
          saldo_pendiente,
          porcentaje_pagado,
          fecha_negociacion,
          fecha_completada,
          viviendas!negociaciones_vivienda_id_fkey (
            numero,
            tipo_vivienda,
            manzanas!viviendas_manzana_id_fkey (
              nombre,
              proyectos!manzanas_proyecto_id_fkey (
                nombre
              )
            )
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (clienteError) throw clienteError
    if (!clienteData) return null

    // 2. Obtener intereses del cliente usando la vista intereses_completos
    const { data: interesesData, error: interesesError } = await supabase
      .from('intereses_completos')
      .select('*')
      .eq('cliente_id', id)
      .order('fecha_interes', { ascending: false })

    if (interesesError) {
      console.error('Error cargando intereses:', interesesError)
      // No lanzamos error, continuamos sin intereses
    }

    // 3. Calcular estadísticas comerciales
    const negociaciones = clienteData.negociaciones || []
    const estadisticas = {
      total_negociaciones: negociaciones.length,
      negociaciones_activas: negociaciones.filter((n: any) =>
        ['Activa', 'En Proceso'].includes(n.estado)
      ).length,
      negociaciones_completadas: negociaciones.filter((n: any) =>
        n.estado === 'Completada'
      ).length,
      ultima_negociacion: negociaciones.length > 0
        ? negociaciones[0].fecha_negociacion
        : null,
    }

    // 4. Mapear intereses al formato ClienteInteres
    const intereses = (interesesData || []).map((interes: any) => ({
      id: interes.id,
      cliente_id: interes.cliente_id,
      proyecto_id: interes.proyecto_id,
      vivienda_id: interes.vivienda_id,
      proyecto_nombre: interes.proyecto_nombre,
      proyecto_ubicacion: interes.proyecto_ubicacion,
      vivienda_numero: interes.vivienda_numero,
      vivienda_estado: interes.vivienda_estado,
      vivienda_precio: interes.vivienda_precio,
      manzana_nombre: interes.manzana_nombre,
      notas: interes.notas,
      estado: interes.estado_interes,
      motivo_descarte: interes.motivo_descarte,
      fecha_interes: interes.fecha_interes,
      fecha_actualizacion: interes.fecha_actualizacion,
    }))

    // 5. Retornar cliente completo con intereses y estadísticas
    return {
      ...clienteData,
      intereses,
      estadisticas,
    } as Cliente
  }

  /**
   * Buscar cliente por número de documento
   */
  async buscarPorDocumento(
    tipo_documento: string,
    numero_documento: string
  ): Promise<Cliente | null> {
    console.log('🔍 Buscando cliente duplicado:', { tipo_documento, numero_documento })

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('tipo_documento', tipo_documento)
      .eq('numero_documento', numero_documento)
      .maybeSingle()

    if (error) {
      // Si es error de "no encontrado", está bien (no hay duplicado)
      // Si es otro error, lanzarlo
      console.error('Error buscando cliente por documento:', error)
      throw error
    }

    if (data) {
      console.log('⚠️ Cliente duplicado encontrado:', data.id)
    } else {
      console.log('✅ No hay cliente duplicado')
    }

    return data as Cliente | null
  }

  /**
   * Crear un nuevo cliente
   */
  async crearCliente(datos: CrearClienteDTO): Promise<Cliente> {
    console.log('📝 Iniciando creación de cliente:', {
      tipo_documento: datos.tipo_documento,
      numero_documento: datos.numero_documento,
      nombres: datos.nombres
    })

    // Verificar que no exista cliente con el mismo documento
    const clienteExistente = await this.buscarPorDocumento(
      datos.tipo_documento,
      datos.numero_documento
    )

    if (clienteExistente) {
      const error = `Ya existe un cliente registrado con ${datos.tipo_documento} ${datos.numero_documento}.\n\nCliente existente: ${clienteExistente.nombres} ${clienteExistente.apellidos}`
      console.error('❌ Cliente duplicado:', error)
      throw new Error(error)
    }

    console.log('✅ Validación de duplicados OK, procediendo a crear...')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Excluir interes_inicial (no es un campo de la tabla clientes)
    const { interes_inicial, ...datosCliente } = datos

    // 🔧 Sanitizar campos de fecha: convertir strings vacíos a null
    const datosLimpios = {
      ...datosCliente,
      fecha_nacimiento: datosCliente.fecha_nacimiento || null,
      usuario_creacion: user?.id,
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert(datosLimpios)
      .select()
      .single()

    if (error) {
      console.error('❌ Error insertando en DB:', error)
      throw error
    }

    console.log('✅ Cliente creado exitosamente:', data.id)
    return data as Cliente
  }

  /**
   * Actualizar un cliente
   */
  async actualizarCliente(
    id: string,
    datos: ActualizarClienteDTO
  ): Promise<Cliente> {
    // 🔧 Sanitizar campos de fecha: convertir strings vacíos a null
    const datosLimpios = {
      ...datos,
      fecha_nacimiento: datos.fecha_nacimiento || null,
    }

    const { data, error } = await supabase
      .from('clientes')
      .update(datosLimpios)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Cliente
  }

  /**
   * Eliminar un cliente
   *
   * Restricciones:
   * - NO se puede eliminar si tiene negociaciones (activas o históricas)
   * - NO se puede eliminar si tiene viviendas asignadas
   * - Solo se permite eliminar clientes "Interesado" sin historial
   *
   * Para clientes con datos, usar estado "Inactivo" en lugar de eliminar
   */
  async eliminarCliente(id: string): Promise<void> {
    // 1. Verificar que NO tenga negociaciones (ninguna, ni activas ni históricas)
    const { data: negociaciones } = await supabase
      .from('negociaciones')
      .select('id, estado')
      .eq('cliente_id', id)
      .limit(1)

    if (negociaciones && negociaciones.length > 0) {
      throw new Error(
        'No se puede eliminar un cliente con historial de negociaciones. ' +
        'Use el estado "Inactivo" en su lugar para mantener la trazabilidad.'
      )
    }

    // 2. Verificar que NO tenga viviendas asignadas
    const { data: viviendas } = await supabase
      .from('viviendas')
      .select('id, numero')
      .eq('cliente_id', id)
      .limit(1)

    if (viviendas && viviendas.length > 0) {
      throw new Error(
        'No se puede eliminar un cliente con viviendas asignadas. ' +
        'Primero desasigne las viviendas o use el estado "Inactivo".'
      )
    }

    // 3. Solo permitir eliminar clientes en estado "Interesado" sin datos críticos
    const { data: cliente } = await supabase
      .from('clientes')
      .select('estado')
      .eq('id', id)
      .single()

    if (cliente?.estado !== 'Interesado') {
      throw new Error(
        'Solo se pueden eliminar clientes en estado "Interesado". ' +
        'Para clientes con historial, use el estado "Inactivo".'
      )
    }

    // 4. Si pasa todas las validaciones, eliminar
    const { error } = await supabase.from('clientes').delete().eq('id', id)

    if (error) throw error
  }

  /**
   * Cambiar estado de un cliente
   */
  async cambiarEstado(
    id: string,
    nuevoEstado: 'Interesado' | 'Activo' | 'Inactivo'
  ): Promise<Cliente> {
    return this.actualizarCliente(id, { estado: nuevoEstado })
  }

  /**
   * Obtener estadísticas generales de clientes
   */
  async obtenerEstadisticas() {
    const { data, error } = await supabase.from('clientes').select('estado')

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      interesados: data?.filter((c) => c.estado === 'Interesado').length || 0,
      activos: data?.filter((c) => c.estado === 'Activo').length || 0,
      inactivos: data?.filter((c) => c.estado === 'Inactivo').length || 0,
    }

    return stats
  }

  /**
   * Subir documento de identidad
   */
  async subirDocumentoIdentidad(
    clienteId: string,
    archivo: File
  ): Promise<string> {
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${clienteId}/documento-identidad.${extension}`

    const { data, error } = await supabase.storage
      .from('documentos-clientes')
      .upload(nombreArchivo, archivo, {
        upsert: true,
      })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage
      .from('documentos-clientes')
      .getPublicUrl(nombreArchivo)

    // Actualizar URL en el cliente
    await this.actualizarCliente(clienteId, {
      documento_identidad_url: publicUrl,
    })

    return publicUrl
  }
}

export const clientesService = new ClientesService()
