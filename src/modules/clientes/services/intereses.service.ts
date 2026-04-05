/**
 * Servicio de Intereses de Clientes
 * Gestión de intereses en proyectos/viviendas
 */

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type {
  ActualizarInteresDTO,
  ClienteInteres,
  CrearInteresDTO,
  EstadoInteres,
} from '../types'

class InteresesService {
  /**
   * Obtener intereses de un cliente (con datos relacionados)
   */
  async obtenerInteresesCliente(
    clienteId: string,
    soloActivos = false
  ): Promise<ClienteInteres[]> {
    try {
      let query = supabase
        .from('intereses_completos')
        .select(
          `
          id, cliente_id, proyecto_id, vivienda_id, estado, origen,
          notas, motivo_descarte, fecha_interes, fecha_actualizacion,
          usuario_creacion, proyecto_nombre, proyecto_estado,
          vivienda_numero, vivienda_valor, vivienda_estado, manzana_nombre
        `
        )
        .eq('cliente_id', clienteId)

      if (soloActivos) {
        query = query.eq('estado', 'Activo')
      }

      const { data, error } = await query.order('fecha_interes', {
        ascending: false,
      })

      if (error) throw error

      // Mapear vista a interface
      return (data?.map(row => ({
        id: row.id,
        cliente_id: row.cliente_id,
        proyecto_id: row.proyecto_id,
        vivienda_id: row.vivienda_id,
        notas: row.notas,
        estado: row.estado as EstadoInteres,
        motivo_descarte: row.motivo_descarte,
        fecha_interes: row.fecha_interes,
        fecha_actualizacion: row.fecha_actualizacion,
        usuario_creacion: row.usuario_creacion,
        proyecto_nombre: row.proyecto_nombre,
        proyecto_estado: row.proyecto_estado,
        vivienda_numero: row.vivienda_numero,
        vivienda_valor: row.vivienda_valor,
        vivienda_estado: row.vivienda_estado,
        manzana_nombre: row.manzana_nombre,
      })) || []) as unknown as ClienteInteres[]
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '[CLIENTES] Error obteniendo intereses del cliente:',
        mensaje,
        error
      )
      throw error
    }
  }

  /**
   * Obtener intereses de un proyecto
   */
  async obtenerInteresesProyecto(
    proyectoId: string,
    soloActivos = false
  ): Promise<ClienteInteres[]> {
    try {
      let query = supabase
        .from('intereses_completos')
        .select(
          `
          id, cliente_id, proyecto_id, vivienda_id, estado, origen,
          notas, motivo_descarte, fecha_interes, fecha_actualizacion,
          usuario_creacion, proyecto_nombre, proyecto_estado,
          vivienda_numero, vivienda_valor, vivienda_estado, manzana_nombre
        `
        )
        .eq('proyecto_id', proyectoId)

      if (soloActivos) {
        query = query.eq('estado', 'Activo')
      }

      const { data, error } = await query.order('fecha_interes', {
        ascending: false,
      })

      if (error) throw error

      return (data?.map(row => ({
        id: row.id,
        cliente_id: row.cliente_id,
        proyecto_id: row.proyecto_id,
        vivienda_id: row.vivienda_id,
        notas: row.notas,
        estado: row.estado as EstadoInteres,
        motivo_descarte: row.motivo_descarte,
        fecha_interes: row.fecha_interes,
        fecha_actualizacion: row.fecha_actualizacion,
        usuario_creacion: row.usuario_creacion,
        proyecto_nombre: row.proyecto_nombre,
        proyecto_estado: row.proyecto_estado,
        vivienda_numero: row.vivienda_numero,
        vivienda_valor: row.vivienda_valor,
        vivienda_estado: row.vivienda_estado,
        manzana_nombre: row.manzana_nombre,
      })) || []) as unknown as ClienteInteres[]
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '[CLIENTES] Error obteniendo intereses del proyecto:',
        mensaje,
        error
      )
      throw error
    }
  }

  /**
   * Crear un nuevo interés
   */
  async crearInteres(datos: CrearInteresDTO): Promise<ClienteInteres> {
    try {
      const { data, error } = await supabase
        .from('cliente_intereses')
        .insert({
          cliente_id: datos.cliente_id,
          proyecto_id: datos.proyecto_id,
          vivienda_id: datos.vivienda_id,
          notas: datos.notas,
          estado: 'Activo',
        })
        .select()
        .single()

      if (error) throw error
      return data as ClienteInteres
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('[CLIENTES] Error creando interés:', mensaje, error)
      throw error
    }
  }

  /**
   * Actualizar estado de un interés
   */
  async actualizarInteres(
    id: string,
    datos: ActualizarInteresDTO
  ): Promise<ClienteInteres> {
    try {
      const { data, error } = await supabase
        .from('cliente_intereses')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ClienteInteres
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('[CLIENTES] Error actualizando interés:', mensaje, error)
      throw error
    }
  }

  /**
   * Descartar un interés (cambiar estado a Descartado)
   */
  async descartarInteres(id: string, motivo?: string): Promise<ClienteInteres> {
    try {
      return await this.actualizarInteres(id, {
        estado: 'Descartado',
        motivo_descarte: motivo,
      })
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('[CLIENTES] Error descartando interés:', mensaje, error)
      throw error
    }
  }

  /**
   * Marcar interés como convertido (cuando se concreta la venta)
   * Esta función se llama automáticamente cuando se crea una negociación
   */
  async marcarInteresConvertido(
    clienteId: string,
    viviendaId: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('marcar_interes_convertido', {
        p_cliente_id: clienteId,
        p_vivienda_id: viviendaId,
      })

      if (error) throw error
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '[CLIENTES] Error marcando interés como convertido:',
        mensaje,
        error
      )
      throw error
    }
  }

  /**
   * Eliminar un interés (hard delete)
   */
  async eliminarInteres(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cliente_intereses')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('[CLIENTES] Error eliminando interés:', mensaje, error)
      throw error
    }
  }

  /**
   * Verificar si ya existe un interés activo para esa combinación
   */
  async existeInteresActivo(
    clienteId: string,
    proyectoId: string,
    viviendaId?: string
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('cliente_intereses')
        .select('id', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('proyecto_id', proyectoId)
        .eq('estado', 'Activo')

      if (viviendaId) {
        query = query.eq('vivienda_id', viviendaId)
      }

      const { count, error } = await query

      if (error) throw error
      return (count ?? 0) > 0
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '[CLIENTES] Error verificando interés activo:',
        mensaje,
        error
      )
      return false
    }
  }

  /**
   * Obtener resumen de intereses por estado
   */
  async obtenerResumenIntereses(clienteId: string) {
    try {
      const { data, error } = await supabase
        .from('cliente_intereses')
        .select('estado')
        .eq('cliente_id', clienteId)

      if (error) throw error

      const resumen = {
        activos: 0,
        descartados: 0,
        convertidos: 0,
      }

      data?.forEach(row => {
        if (row.estado === 'Activo') resumen.activos++
        if (row.estado === 'Descartado') resumen.descartados++
        if (row.estado === 'Convertido') resumen.convertidos++
      })

      return resumen
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '[CLIENTES] Error obteniendo resumen de intereses:',
        mensaje,
        error
      )
      return { activos: 0, descartados: 0, convertidos: 0 }
    }
  }
}

export const interesesService = new InteresesService()

// =====================================================
// TIPOS PARA INTERESES SIMPLES (vista de card cliente)
// =====================================================

export interface InteresClienteSimple {
  id: string
  proyecto_id: string
  proyecto_nombre: string
  proyecto_ubicacion: string
  vivienda_id: string | null
  vivienda_numero: string | null
  manzana_nombre: string | null
  fecha_interes: string
  notas: string | null
}

interface InteresRow {
  id: string
  proyecto_id: string
  vivienda_id: string | null
  fecha_interes: string
  notas: string | null
  proyectos: { nombre: string; ubicacion: string } | null
  viviendas: { numero: string; manzanas: { nombre: string } | null } | null
}

/**
 * Obtiene intereses de un cliente en formato simplificado
 * (para cards de detalle, sin estado ni origen)
 */
export async function obtenerInteresesSimples(
  clienteId: string
): Promise<InteresClienteSimple[]> {
  const { data, error } = await supabase
    .from('cliente_intereses')
    .select(
      `
      id,
      proyecto_id,
      vivienda_id,
      fecha_interes,
      notas,
      proyectos!cliente_intereses_proyecto_id_fkey (
        nombre,
        ubicacion
      ),
      viviendas!cliente_intereses_vivienda_id_fkey (
        numero,
        manzanas!viviendas_manzana_id_fkey (
          nombre
        )
      )
    `
    )
    .eq('cliente_id', clienteId)
    .order('fecha_interes', { ascending: false })

  if (error) {
    logger.error('❌ Error cargando intereses simples del cliente:', error)
    throw new Error(`Error al cargar intereses: ${error.message}`)
  }

  return (data || []).map((interes: InteresRow) => ({
    id: interes.id,
    proyecto_id: interes.proyecto_id,
    proyecto_nombre: interes.proyectos?.nombre ?? 'Proyecto no especificado',
    proyecto_ubicacion: interes.proyectos?.ubicacion ?? 'No especifica',
    vivienda_id: interes.vivienda_id,
    vivienda_numero: interes.viviendas?.numero ?? null,
    manzana_nombre: interes.viviendas?.manzanas?.nombre ?? null,
    fecha_interes: interes.fecha_interes,
    notas: interes.notas,
  }))
}

// =====================================================
// TIPOS Y FUNCIONES PARA FORMULARIO DE INTERÉS
// =====================================================

export interface ProyectoParaInteres {
  id: string
  nombre: string
  ubicacion: string
}

export interface ViviendaParaInteres {
  id: string
  numero: string
  manzana_nombre: string
  valor_total: number | null
  estado: string
}

interface ViviendaInteresRow {
  id: string
  numero: string
  valor_total: number | null
  estado: string
  manzanas: { nombre: string; proyecto_id?: string } | null
}

/**
 * Obtiene proyectos activos para el selector del formulario de interés
 */
export async function obtenerProyectosParaInteres(): Promise<
  ProyectoParaInteres[]
> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('id, nombre, ubicacion')
    .in('estado', ['en_planificacion', 'en_construccion'])
    .eq('archivado', false)
    .order('nombre')

  if (error) {
    logger.error('Error cargando proyectos para interés:', error)
    throw new Error(`Error al cargar proyectos: ${error.message}`)
  }

  return (data ?? []) as ProyectoParaInteres[]
}

/**
 * Obtiene viviendas disponibles de un proyecto para el selector del formulario de interés
 */
export async function obtenerViviendasParaInteres(
  proyectoId: string
): Promise<ViviendaParaInteres[]> {
  const { data, error } = await supabase
    .from('viviendas')
    .select(
      `
      id,
      numero,
      valor_total,
      estado,
      manzanas!inner(
        nombre,
        proyecto_id
      )
    `
    )
    .eq('manzanas.proyecto_id', proyectoId)
    .eq('estado', 'Disponible')
    .order('numero')

  if (error) {
    logger.error('Error cargando viviendas para interés:', error)
    throw new Error(`Error al cargar viviendas: ${error.message}`)
  }

  return (data ?? []).map((v: ViviendaInteresRow) => ({
    id: v.id,
    numero: v.numero,
    manzana_nombre: v.manzanas?.nombre ?? '',
    valor_total: v.valor_total,
    estado: v.estado,
  }))
}
