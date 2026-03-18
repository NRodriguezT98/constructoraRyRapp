/**
 * Service: Tipos de Fuentes de Pago (Catálogo)
 *
 * Carga fuentes de pago desde tabla tipos_fuentes_pago
 * NO más hardcodeadas - Fuentes dinámicas desde BD
 */

import { supabase } from '@/lib/supabase/client'

/**
 * Feature flags de lógica de negocio del tipo de fuente
 */
export interface LogicaNegocioTipo {
  genera_cuotas: boolean
  capital_para_cierre: boolean
  permite_mora: boolean
  formula_interes: 'simple'
}

/**
 * Tipo de fuente de pago desde catálogo
 */
export interface TipoFuentePagoCatalogo {
  id: string
  nombre: string
  descripcion: string | null
  activo: boolean
  orden: number
  icono: string | null
  color: string | null
  requiere_entidad: boolean
  permite_multiples_abonos: boolean
  /** Feature flags: genera_cuotas, capital_para_cierre, permite_mora, etc. */
  logica_negocio: LogicaNegocioTipo | null
}

/**
 * Resultado de consulta de tipos de fuentes
 */
interface ConsultaTiposFuentesResult {
  data: TipoFuentePagoCatalogo[] | null
  error: Error | null
}

/**
 * 🔥 Cargar tipos de fuentes de pago ACTIVAS desde BD
 *
 * @returns Array de tipos de fuentes activos, ordenados
 */
export async function cargarTiposFuentesPagoActivas(): Promise<ConsultaTiposFuentesResult> {
  try {
    const { data, error } = await supabase
      .from('tipos_fuentes_pago')
      .select('id,nombre,descripcion,activo,orden,icono,color,requiere_entidad,permite_multiples_abonos,logica_negocio')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) {
      console.error('❌ Error al cargar tipos de fuentes de pago:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as unknown as TipoFuentePagoCatalogo[], error: null }
  } catch (err) {
    console.error('❌ Error inesperado al cargar tipos de fuentes:', err)
    return { data: null, error: err as Error }
  }
}

/**
 * 🔥 Cargar TODOS los tipos (activos e inactivos) para admin
 *
 * @returns Array completo de tipos de fuentes
 */
export async function cargarTodosTiposFuentesPago(): Promise<ConsultaTiposFuentesResult> {
  try {
    const { data, error } = await supabase
      .from('tipos_fuentes_pago')
      .select('id,nombre,descripcion,activo,orden,icono,color,requiere_entidad,permite_multiples_abonos')
      .order('orden', { ascending: true })

    if (error) {
      console.error('❌ Error al cargar todos los tipos de fuentes:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as unknown as TipoFuentePagoCatalogo[], error: null }
  } catch (err) {
    console.error('❌ Error inesperado al cargar tipos de fuentes:', err)
    return { data: null, error: err as Error }
  }
}

/**
 * 🔥 Obtener configuración de una fuente específica por nombre
 *
 * @param nombre - Nombre exacto de la fuente (ej: "Cuota Inicial")
 * @returns Configuración de la fuente o null
 */
export async function obtenerTipoFuentePorNombre(
  nombre: string
): Promise<TipoFuentePagoCatalogo | null> {
  try {
    const { data, error } = await supabase
      .from('tipos_fuentes_pago')
      .select('id,nombre,descripcion,activo,orden,icono,color,requiere_entidad,permite_multiples_abonos')
      .eq('nombre', nombre)
      .eq('activo', true)
      .single()

    if (error) {
      console.error(`❌ Error al buscar fuente "${nombre}":`, error)
      return null
    }

    return data as unknown as TipoFuentePagoCatalogo
  } catch (err) {
    console.error(`❌ Error inesperado al buscar fuente "${nombre}":`, err)
    return null
  }
}
