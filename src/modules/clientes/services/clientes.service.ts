/**
 * Servicio de Clientes
 * Gestión completa del módulo de clientes
 */

import { supabase } from '@/lib/supabase/client'
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'
import { auditService } from '@/services/audit.service'

import type {
    ActualizarClienteDTO,
    Cliente,
    ClienteResumen,
    CrearClienteDTO,
    FiltrosClientes,
} from '../types'

class ClientesService {
  /**
   * Obtener todos los clientes con estadísticas, negociaciones e intereses
   * ✅ Incluye datos de viviendas, proyectos y manzanas para la tabla
   */
  async obtenerClientes(filtros?: FiltrosClientes): Promise<ClienteResumen[]> {
    // 1. Obtener datos básicos de clientes desde la vista
    let query = supabase.from('vista_clientes_resumen').select('*')

    // Aplicar filtros
    if (filtros?.estado && filtros.estado.length > 0) {
      query = query.in('estado', filtros.estado)
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

    // ⚡ EJECUTAR TODAS LAS CONSULTAS EN PARALELO (Promise.all)
    const [
      { data, error },
      { data: negociaciones },
      { data: intereses }
    ] = await Promise.all([
      // 1. Datos básicos de clientes
      query.order('fecha_creacion', { ascending: false }),

      // 2. Negociaciones activas (en paralelo)
      supabase
        .from('negociaciones')
        .select(`
          id,
          cliente_id,
          estado,
          valor_total,
          total_abonado,
          saldo_pendiente,
          viviendas!negociaciones_vivienda_id_fkey (
            id,
            numero,
            manzanas!viviendas_manzana_id_fkey (
              nombre,
              proyectos!manzanas_proyecto_id_fkey (
                nombre,
                ubicacion
              )
            )
          )
        `)
        .eq('estado', 'Activa'),

      // 3. Intereses activos (en paralelo)
      supabase
        .from('cliente_intereses')
        .select(`
          id,
          cliente_id,
          estado,
          vivienda_id,
          proyectos!cliente_intereses_proyecto_id_fkey (
            nombre
          ),
          viviendas!cliente_intereses_vivienda_id_fkey (
            numero,
            manzanas!viviendas_manzana_id_fkey (
              nombre
            )
          )
        `)
        .eq('estado', 'Activo')
    ])

    if (error) throw error

    // ⚡ CREAR MAPAS DE BÚSQUEDA RÁPIDA (O(1) lookup)
    const negociacionesMap = new Map(
      negociaciones?.map((neg: any) => [
        neg.cliente_id,
        {
          nombre_proyecto: neg.viviendas?.manzanas?.proyectos?.nombre,
          ubicacion_proyecto: neg.viviendas?.manzanas?.proyectos?.ubicacion,
          nombre_manzana: neg.viviendas?.manzanas?.nombre,
          numero_vivienda: neg.viviendas?.numero,
          valor_total: neg.valor_total,
          total_abonado: neg.total_abonado,
          saldo_pendiente: neg.saldo_pendiente,
        }
      ]) || []
    )

    const interesesMap = new Map(
      intereses
        ?.filter((int: any) => !negociacionesMap.has(int.cliente_id)) // Solo si no tiene negociación
        .map((int: any) => [
          int.cliente_id,
          {
            nombre_proyecto: int.proyectos?.nombre,
            nombre_manzana: int.viviendas?.manzanas?.nombre,
            numero_vivienda: int.viviendas?.numero,
          }
        ]) || []
    )

    // ⚡ TRANSFORMAR Y ENRIQUECER DATOS (O(n) single pass)
    return (data || []).map((item) => {
      const negociacion = negociacionesMap.get(item.id)
      const interes = interesesMap.get(item.id)

      // Parsear nombre una sola vez
      const nombreParts = item.nombre_completo?.split(' ') || ['']
      const nombres = nombreParts[0] || ''
      const apellidos = nombreParts.slice(1).join(' ') || ''

      return {
        id: item.id || '',
        tipo_documento: (item.tipo_documento as any) || 'CC',
        numero_documento: item.numero_documento || '',
        nombres,
        apellidos,
        nombre_completo: item.nombre_completo || '',
        telefono: item.telefono || '',
        email: item.email || '',
        estado_civil: item.estado_civil || undefined,
        fecha_nacimiento: item.fecha_nacimiento || undefined,
        estado: (item.estado as any) || 'Interesado',
        fecha_creacion: item.fecha_creacion || formatDateForDB(getTodayDateString()),
        fecha_actualizacion: item.fecha_creacion || formatDateForDB(getTodayDateString()),
        tiene_documento_identidad: item.tiene_documento_identidad || false,
        estadisticas: {
          total_negociaciones: item.total_negociaciones || 0,
          negociaciones_activas: item.negociaciones_activas || 0,
          negociaciones_completadas: item.negociaciones_completadas || 0,
          ultima_negociacion: item.ultima_negociacion || undefined,
        },
        // ⭐ Datos de vivienda para clientes Activos (pre-calculados)
        vivienda: negociacion || undefined,
        // ⭐ Datos de interés para clientes Interesados (pre-calculados)
        interes: interes || undefined,
      } as ClienteResumen
    })
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
                nombre,
                ubicacion
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
      proyecto_estado: interes.proyecto_estado,
      vivienda_numero: interes.vivienda_numero,
      vivienda_estado: interes.vivienda_estado,
      vivienda_valor: interes.vivienda_valor,
      manzana_nombre: interes.manzana_nombre,
      notas: interes.notas,
      estado: interes.estado,
      motivo_descarte: interes.motivo_descarte,
      fecha_interes: interes.fecha_interes,
      fecha_actualizacion: interes.fecha_actualizacion,
    }))

    // 5. Retornar cliente completo con intereses y estadísticas
    return {
      ...clienteData,
      intereses,
      estadisticas,
    } as unknown as Cliente
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

    // 🔍 Auditar creación de cliente
    try {
      await auditService.auditarCreacionCliente(data)
    } catch (auditError) {
      console.error('⚠️ Error auditando creación de cliente:', auditError)
      // No bloqueamos la operación si falla la auditoría
    }

    return data as Cliente
  }

  /**
   * Actualizar un cliente
   */
  async actualizarCliente(
    id: string,
    datos: ActualizarClienteDTO
  ): Promise<Cliente> {
    // 1. Obtener datos anteriores para auditoría
    const { data: datosAnteriores } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()

    // 2. Actualizar cliente
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

    // 3. 🔍 Auditar actualización
    if (datosAnteriores) {
      try {
        await auditService.auditarActualizacion(
          'clientes',
          id,
          datosAnteriores,
          data,
          {
            campos_modificados: Object.keys(datosLimpios),
            cliente_nombre: `${data.nombres} ${data.apellidos}`
          },
          'clientes'
        )
      } catch (auditError) {
        console.error('⚠️ Error auditando actualización:', auditError)
      }
    }

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

    // 4. Obtener datos del cliente para auditoría
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()

    // 5. Si pasa todas las validaciones, eliminar
    const { error } = await supabase.from('clientes').delete().eq('id', id)

    if (error) throw error

    // 6. 🔍 Auditar eliminación
    if (clienteData) {
      try {
        await auditService.auditarEliminacion(
          'clientes',
          id,
          clienteData,
          {
            motivo: 'Cliente sin historial de negociaciones',
            cliente_nombre: `${clienteData.nombres} ${clienteData.apellidos}`,
            cliente_documento: `${clienteData.tipo_documento} ${clienteData.numero_documento}`
          },
          'clientes'
        )
      } catch (auditError) {
        console.error('⚠️ Error auditando eliminación:', auditError)
      }
    }
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
