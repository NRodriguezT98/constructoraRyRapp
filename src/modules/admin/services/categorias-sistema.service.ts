/**
 * Servicio para gestión de categorías de sistema
 */

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

export interface CategoriasSistemaResult {
  categoria_id: string
  categoria_nombre: string
  accion: string
}

/**
 * Verifica y crea categorías por módulo específico
 */
export async function verificarCategoriasPorModulo(modulo: 'clientes' | 'proyectos' | 'viviendas'): Promise<{
  success: boolean
  categorias: CategoriasSistemaResult[]
  mensaje: string
  error?: string
}> {
  try {
    const functionName = `verificar_categorias_${modulo}`
    const { data, error } = await supabase.rpc(functionName as any)

    if (error) {
      logger.error(`❌ Error verificando categorías de ${modulo}:`, error)
      return {
        success: false,
        categorias: [],
        mensaje: `Error al verificar categorías de ${modulo}`,
        error: error.message,
      }
    }

    return {
      success: true,
      categorias: data || [],
      mensaje: `${data?.length || 0} categorías de ${modulo} verificadas correctamente`,
    }
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido'
    logger.error(`❌ Error en verificarCategoriasPorModulo(${modulo}):`, mensaje)
    return {
      success: false,
      categorias: [],
      mensaje: `Error inesperado al verificar categorías de ${modulo}`,
      error: mensaje,
    }
  }
}

/**
 * Obtiene el estado actual de categorías por módulo
 */
export async function obtenerEstadoCategoriasPorModulo(modulo: 'clientes' | 'proyectos' | 'viviendas'): Promise<{
  total: number
  activas: number
}> {
  try {
    const { data, error } = await supabase
      .from('categorias_documento')
      .select('id, nombre')
      .contains('modulos_permitidos', [modulo])

    if (error) {
      logger.error(`❌ Error obteniendo categorías de ${modulo}:`, error)
      return { total: 0, activas: 0 }
    }

    return {
      total: data?.length || 0,
      activas: data?.length || 0,
    }
  } catch (error) {
    logger.error(`❌ Error en obtenerEstadoCategoriasPorModulo(${modulo}):`, error)
    return { total: 0, activas: 0 }
  }
}
