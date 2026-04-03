/**
 * ============================================
 * SERVICE: Permisos
 * ============================================
 *
 * Servicio para gestionar permisos desde base de datos.
 * Reemplaza el sistema hardcodeado de PERMISOS_POR_ROL.
 */

import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { logger } from '@/lib/utils/logger'

export type PermisoRol = Database['public']['Tables']['permisos_rol']['Row']

/**
 * Obtener todos los permisos de un rol específico
 */
export async function obtenerPermisosPorRol(
  rol: string
): Promise<PermisoRol[]> {
  const { data, error } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', rol)
    .eq('permitido', true) // Solo permisos activos
    .order('modulo', { ascending: true })
    .order('accion', { ascending: true })

  if (error) {
    logger.error('❌ [SERVICE] Error obteniendo permisos:', error)
    throw new Error(`Error al obtener permisos: ${error.message}`)
  }

  return data || []
}

/**
 * Obtener todos los permisos del sistema (para matriz de configuración)
 */
export async function obtenerTodosLosPermisos(): Promise<PermisoRol[]> {
  const { data, error } = await supabase
    .from('permisos_rol')
    .select('*')
    .order('rol', { ascending: true })
    .order('modulo', { ascending: true })
    .order('accion', { ascending: true })

  if (error) {
    logger.error('❌ [SERVICE] Error obteniendo permisos:', error)
    throw new Error(`Error al obtener permisos: ${error.message}`)
  }

  return data || []
}

/**
 * Verificar si un usuario tiene un permiso específico
 *
 * NOTA: Administrador tiene bypass automático (se verifica en hook)
 */
export async function verificarPermiso(
  rol: string,
  modulo: string,
  accion: string
): Promise<boolean> {
  // Bypass para Administrador
  if (rol === 'Administrador') {
    return true
  }

  const { data, error } = await supabase
    .from('permisos_rol')
    .select('permitido')
    .eq('rol', rol)
    .eq('modulo', modulo)
    .eq('accion', accion)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found - permiso no existe
      return false
    }
    logger.error('❌ [SERVICE] Error verificando permiso:', error)
    return false
  }

  const resultado = data?.permitido || false
  return resultado
}

/**
 * Actualizar un permiso específico
 *
 * SOLO para administradores. RLS policy verificará automáticamente.
 */
export async function actualizarPermiso(
  id: string,
  permitido: boolean
): Promise<PermisoRol> {
  const { data, error } = await supabase
    .from('permisos_rol')
    .update({ permitido })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logger.error('❌ [SERVICE] Error actualizando permiso:', error)
    throw new Error(`Error al actualizar permiso: ${error.message}`)
  }

  return data
}

/**
 * Actualizar múltiples permisos a la vez
 *
 * Útil para cambios masivos en matriz de permisos.
 */
export async function actualizarPermisosEnLote(
  actualizaciones: Array<{ id: string; permitido: boolean }>
): Promise<void> {
  const promesas = actualizaciones.map(({ id, permitido }) =>
    supabase.from('permisos_rol').update({ permitido }).eq('id', id)
  )

  const resultados = await Promise.all(promesas)

  const errores = resultados.filter(r => r.error)
  if (errores.length > 0) {
    logger.error('❌ [SERVICE] Errores en actualización en lote:', errores)
    throw new Error(`${errores.length} permisos fallaron al actualizar`)
  }
}

/**
 * Obtener módulos únicos del sistema
 */
export async function obtenerModulos(): Promise<string[]> {
  const { data, error } = await supabase
    .from('permisos_rol')
    .select('modulo')
    .limit(1000)

  if (error) {
    logger.error('❌ [SERVICE] Error obteniendo módulos:', error)
    return []
  }

  const modulosUnicos = [...new Set(data?.map(p => p.modulo) || [])]
  return modulosUnicos.sort()
}

/**
 * Obtener acciones únicas del sistema
 */
export async function obtenerAcciones(): Promise<string[]> {
  const { data, error } = await supabase
    .from('permisos_rol')
    .select('accion')
    .limit(1000)

  if (error) {
    logger.error('❌ [SERVICE] Error obteniendo acciones:', error)
    return []
  }

  const accionesUnicas = [...new Set(data?.map(p => p.accion) || [])]
  return accionesUnicas.sort()
}
