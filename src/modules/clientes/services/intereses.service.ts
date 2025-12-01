/**
 * Servicio de Intereses de Clientes
 * Gestión de intereses en proyectos/viviendas
 *
 * NOTA: Este servicio usa tablas/vistas que NO existen aún en database.types.ts
 * Ejecutar supabase/cliente-intereses-schema.sql PRIMERO, luego regenerar tipos.
 * Los @ts-ignore son temporales hasta que se ejecute el SQL.
 */

// @ts-nocheck
import { supabase } from '@/lib/supabase/client'

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
      // @ts-ignore - Tabla cliente_intereses no existe aún en database.types (ejecutar SQL primero)
      let query = supabase
        .from('intereses_completos')
        .select('*')
        .eq('cliente_id', clienteId)

      if (soloActivos) {
        query = query.eq('estado', 'Activo')
      }

      const { data, error } = await query.order('fecha_interes', {
        ascending: false,
      })

      if (error) throw error

      // Mapear vista a interface
      return (
        data?.map((row: any) => ({
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
        })) || []
      )
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[CLIENTES] Error obteniendo intereses del cliente:', mensaje, error)
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
        .select('*')
        .eq('proyecto_id', proyectoId)

      if (soloActivos) {
        query = query.eq('estado', 'Activo')
      }

      const { data, error } = await query.order('fecha_interes', {
        ascending: false,
      })

      if (error) throw error

      return (
        data?.map((row) => ({
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
        })) || []
      )
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[CLIENTES] Error obteniendo intereses del proyecto:', mensaje, error)
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
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[CLIENTES] Error creando interés:', mensaje, error)
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
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[CLIENTES] Error actualizando interés:', mensaje, error)
      throw error
    }
  }

  /**
   * Descartar un interés (cambiar estado a Descartado)
   */
  async descartarInteres(
    id: string,
    motivo?: string
  ): Promise<ClienteInteres> {
    try {
      return await this.actualizarInteres(id, {
        estado: 'Descartado',
        motivo_descarte: motivo,
      })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[CLIENTES] Error descartando interés:', mensaje, error)
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
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[CLIENTES] Error marcando interés como convertido:', mensaje, error)
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
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[CLIENTES] Error eliminando interés:', mensaje, error)
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
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[CLIENTES] Error verificando interés activo:', mensaje, error)
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

      data?.forEach((row) => {
        if (row.estado === 'Activo') resumen.activos++
        if (row.estado === 'Descartado') resumen.descartados++
        if (row.estado === 'Convertido') resumen.convertidos++
      })

      return resumen
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[CLIENTES] Error obteniendo resumen de intereses:', mensaje, error)
      return { activos: 0, descartados: 0, convertidos: 0 }
    }
  }
}

export const interesesService = new InteresesService()
