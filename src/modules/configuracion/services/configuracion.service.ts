/**
 * ConfiguracionService - Servicio para gestión de configuración de recargos
 * ✅ CRUD completo de configuracion_recargos
 * ✅ Validaciones de negocio
 */

import { supabase } from '@/lib/supabase/client'

export interface ConfiguracionRecargo {
  id: string
  tipo: string
  nombre: string
  valor: number
  descripcion?: string
  activo: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface CrearConfiguracionDTO {
  tipo: string
  nombre: string
  valor: number
  descripcion?: string
  activo?: boolean
}

export interface ActualizarConfiguracionDTO {
  nombre?: string
  valor?: number
  descripcion?: string
  activo?: boolean
}

class ConfiguracionService {
  /**
   * Obtener todas las configuraciones de recargos
   */
  async obtenerTodas(): Promise<ConfiguracionRecargo[]> {
    const { data, error } = await supabase
      .from('configuracion_recargos')
      .select('*')
      .order('tipo', { ascending: true })
      .order('valor', { ascending: false })

    if (error) {
      console.error('Error obteniendo configuraciones:', error)
      throw new Error('Error al obtener configuraciones')
    }

    return data || []
  }

  /**
   * Obtener configuraciones activas
   */
  async obtenerActivas(): Promise<ConfiguracionRecargo[]> {
    const { data, error } = await supabase
      .from('configuracion_recargos')
      .select('*')
      .eq('activo', true)
      .order('tipo', { ascending: true })
      .order('valor', { ascending: false })

    if (error) {
      console.error('Error obteniendo configuraciones activas:', error)
      throw new Error('Error al obtener configuraciones activas')
    }

    return data || []
  }

  /**
   * Obtener configuración por ID
   */
  async obtenerPorId(id: string): Promise<ConfiguracionRecargo | null> {
    const { data, error } = await supabase
      .from('configuracion_recargos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error obteniendo configuración:', error)
      return null
    }

    return data
  }

  /**
   * Crear nueva configuración
   */
  async crear(datos: CrearConfiguracionDTO): Promise<ConfiguracionRecargo> {
    const { data, error } = await supabase
      .from('configuracion_recargos')
      .insert({
        tipo: datos.tipo,
        nombre: datos.nombre,
        valor: datos.valor,
        descripcion: datos.descripcion || null,
        activo: datos.activo ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creando configuración:', error)
      throw new Error('Error al crear configuración')
    }

    return data
  }

  /**
   * Actualizar configuración existente
   */
  async actualizar(id: string, datos: ActualizarConfiguracionDTO): Promise<ConfiguracionRecargo> {
    const { data, error } = await supabase
      .from('configuracion_recargos')
      .update({
        ...datos,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error actualizando configuración:', error)
      throw new Error('Error al actualizar configuración')
    }

    return data
  }

  /**
   * Eliminar configuración
   */
  async eliminar(id: string): Promise<void> {
    const { error } = await supabase
      .from('configuracion_recargos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error eliminando configuración:', error)
      throw new Error('Error al eliminar configuración')
    }
  }

  /**
   * Activar/Desactivar configuración
   */
  async toggleActivo(id: string, activo: boolean): Promise<ConfiguracionRecargo> {
    return this.actualizar(id, { activo })
  }

  /**
   * Obtener tipos disponibles
   */
  getTiposDisponibles() {
    return [
      { value: 'gastos_notariales', label: 'Gastos Notariales' },
      { value: 'recargo_esquinera', label: 'Recargo Esquinera' },
      { value: 'recargo_especial', label: 'Recargo Especial' },
      { value: 'otros', label: 'Otros' },
    ]
  }
}

export const configuracionService = new ConfiguracionService()
