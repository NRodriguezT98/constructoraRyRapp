/**
 * ============================================
 * SERVICE: Plantillas de Requisitos
 * ============================================
 *
 * Maneja la gestión de plantillas de requisitos de documentación
 * y su asignación a tipos de fuente de pago.
 *
 * @version 1.0.0 - 2025-12-12
 */

import { supabase } from '@/lib/supabase/client'

// ============================================
// TYPES
// ============================================

export interface PlantillaRequisito {
  id: string
  nombre: string
  tipo_documento: string
  es_obligatorio: boolean
  orden: number
  se_valida_en: string // 'creacion' | 'desembolso'
  descripcion: string
  icono: string
  es_sistema: boolean
  created_at: string
  updated_at: string
}

export interface RequisitoTipoFuente {
  tipo_fuente: string
  tipo_documento: string
  es_obligatorio: boolean
  orden: number
  se_valida_en: string // 'creacion' | 'desembolso'
  descripcion: string
  icono: string
}

// ============================================
// SERVICE CLASS
// ============================================

export class PlantillasRequisitosService {
  /**
   * Obtiene todas las plantillas disponibles
   */
  static async obtenerPlantillas(): Promise<PlantillaRequisito[]> {
    try {
      const { data, error } = await supabase
        .from('plantillas_requisitos_documentos')
        .select('*')
        .order('orden', { ascending: true })

      if (error) {
        console.error('❌ Error obteniendo plantillas:', error)
        throw new Error(`Error al obtener plantillas: ${error.message}`)
      }

      return (data || []) as PlantillaRequisito[]
    } catch (error) {
      console.error('❌ Error en obtenerPlantillas:', error)
      throw error
    }
  }

  /**
   * Obtiene requisitos configurados para un tipo de fuente
   */
  static async obtenerRequisitosPorTipo(tipoFuente: string): Promise<RequisitoTipoFuente[]> {
    try {
      const { data, error } = await supabase
        .from('fuentes_pago_requisitos_config')
        .select('*')
        .eq('tipo_fuente', tipoFuente)
        .order('orden', { ascending: true })

      if (error) {
        console.error('❌ Error obteniendo requisitos:', error)
        throw new Error(`Error al obtener requisitos: ${error.message}`)
      }

      return (data || []) as RequisitoTipoFuente[]
    } catch (error) {
      console.error('❌ Error en obtenerRequisitosPorTipo:', error)
      throw error
    }
  }

  /**
   * Configura requisitos para un tipo de fuente
   */
  static async configurarRequisitos(
    tipoFuente: string,
    plantillasSeleccionadas: string[]
  ): Promise<void> {
    try {
      // 1. Eliminar requisitos existentes
      const { error: deleteError } = await supabase
        .from('fuentes_pago_requisitos_config')
        .delete()
        .eq('tipo_fuente', tipoFuente)

      if (deleteError) {
        console.error('❌ Error eliminando requisitos previos:', deleteError)
        throw new Error(`Error al eliminar requisitos: ${deleteError.message}`)
      }

      // 2. Si no hay plantillas seleccionadas, terminar
      if (plantillasSeleccionadas.length === 0) {
        return
      }

      // 3. Obtener plantillas completas
      const { data: plantillas, error: plantillasError } = await supabase
        .from('plantillas_requisitos_documentos')
        .select('*')
        .in('id', plantillasSeleccionadas)

      if (plantillasError) {
        console.error('❌ Error obteniendo plantillas:', plantillasError)
        throw new Error(`Error al obtener plantillas: ${plantillasError.message}`)
      }

      if (!plantillas || plantillas.length === 0) {
        return
      }

      // 4. Insertar nuevos requisitos
      const requisitos = plantillas.map((p) => ({
        tipo_fuente: tipoFuente,
        tipo_documento: p.tipo_documento,
        es_obligatorio: p.es_obligatorio,
        orden: p.orden,
        se_valida_en: p.se_valida_en,
        descripcion: p.descripcion,
        icono: p.icono,
      }))

      const { error: insertError } = await supabase
        .from('fuentes_pago_requisitos_config')
        .insert(requisitos)

      if (insertError) {
        console.error('❌ Error insertando requisitos:', insertError)
        throw new Error(`Error al insertar requisitos: ${insertError.message}`)
      }
    } catch (error) {
      console.error('❌ Error en configurarRequisitos:', error)
      throw error
    }
  }

  /**
   * Obtiene IDs de plantillas configuradas para un tipo
   */
  static async obtenerPlantillasConfiguradas(tipoFuente: string): Promise<string[]> {
    try {
      // Obtener requisitos actuales
      const requisitos = await this.obtenerRequisitosPorTipo(tipoFuente)

      if (requisitos.length === 0) {
        return []
      }

      // Buscar plantillas que coincidan con esos requisitos
      const tiposDocumento = requisitos.map((r) => r.tipo_documento)

      const { data: plantillas, error } = await supabase
        .from('plantillas_requisitos_documentos')
        .select('id, tipo_documento')
        .in('tipo_documento', tiposDocumento)

      if (error) {
        console.error('❌ Error obteniendo plantillas configuradas:', error)
        return []
      }

      return plantillas?.map((p) => p.id) || []
    } catch (error) {
      console.error('❌ Error en obtenerPlantillasConfiguradas:', error)
      return []
    }
  }
}
