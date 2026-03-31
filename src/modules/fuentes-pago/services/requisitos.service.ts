/**
 * ============================================
 * SERVICE: Validación de Requisitos de Fuentes de Pago
 * ============================================
 *
 * Maneja las llamadas a funciones de PostgreSQL para validar
 * requisitos de documentación antes de permitir desembolsos.
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 * - Solo lógica de API/DB
 * - Tipado estricto
 * - Manejo de errores robusto
 *
 * @version 1.0.0 - 2025-12-12
 */
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

// ============================================
// TYPES
// ============================================

export interface RequisitoDocumento {
  tipo_documento: string
  es_obligatorio: boolean
  orden: number
  descripcion: string
  icono: string
}

export interface DocumentoCompletado {
  tipo_documento: string
  es_obligatorio: boolean
  orden: number
  documento: {
    id: string
    titulo: string
    fecha_documento: string
    url_storage: string
  }
}

export interface ValidacionRequisitos {
  cumple_requisitos: boolean
  puede_continuar: boolean
  total_requisitos: number
  requisitos_completados: number
  obligatorios_faltantes: number
  opcionales_faltantes: number
  documentos_faltantes: RequisitoDocumento[]
  documentos_completados: DocumentoCompletado[]
}

export interface EstadoDocumentacionFuente {
  fuente_pago_id: string
  tipo_fuente: string
  entidad: string
  estado_general: 'completo' | 'advertencia' | 'bloqueado'
  progreso_porcentaje: number
  validacion: ValidacionRequisitos
}

export interface RequisitoConfig {
  id: string
  tipo_fuente: string
  tipo_documento: string
  es_obligatorio: boolean
  orden: number
  se_valida_en: 'creacion' | 'desembolso'
  descripcion: string
  icono: string
  created_at: string
  updated_at: string
}

// ============================================
// SERVICE CLASS
// ============================================

export class FuentesPagoRequisitosService {
  /**
   * Valida si una fuente cumple requisitos para desembolso
   */
  static async validarRequisitosDesembolso(
    fuentePagoId: string
  ): Promise<ValidacionRequisitos> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)(
        'validar_requisitos_desembolso',
        {
          p_fuente_pago_id: fuentePagoId,
        }
      )

      if (error) {
        logger.error('❌ Error validando requisitos:', error)
        throw new Error(`Error al validar requisitos: ${error.message}`)
      }

      // La función RPC retorna un array con un solo elemento
      const resultado = data?.[0] || this.getDefaultValidacion()

      return {
        ...resultado,
        documentos_faltantes: (resultado.documentos_faltantes ||
          []) as unknown as RequisitoDocumento[],
        documentos_completados: (resultado.documentos_completados ||
          []) as unknown as DocumentoCompletado[],
      }
    } catch (error) {
      logger.error('❌ Error en validarRequisitosDesembolso:', error)
      throw error
    }
  }

  /**
   * Obtiene el estado general de documentación de una fuente
   */
  static async obtenerEstadoDocumentacionFuente(
    fuentePagoId: string
  ): Promise<EstadoDocumentacionFuente> {
    try {
      const { data, error } = await supabase.rpc(
        'obtener_estado_documentacion_fuente',
        {
          p_fuente_pago_id: fuentePagoId,
        }
      )

      if (error) {
        logger.error('❌ Error obteniendo estado:', error)
        throw new Error(`Error al obtener estado: ${error.message}`)
      }

      const resultado = data?.[0]

      if (!resultado) {
        throw new Error('No se encontró información de la fuente de pago')
      }

      return {
        fuente_pago_id: resultado.fuente_pago_id,
        tipo_fuente: resultado.tipo_fuente,
        entidad: resultado.entidad,
        estado_general: resultado.estado_general as
          | 'completo'
          | 'advertencia'
          | 'bloqueado',
        progreso_porcentaje: resultado.progreso_porcentaje,
        validacion: resultado.validacion as unknown as ValidacionRequisitos,
      }
    } catch (error) {
      logger.error('❌ Error en obtenerEstadoDocumentacionFuente:', error)
      throw error
    }
  }

  /**
   * Obtiene la configuración de requisitos por tipo de fuente
   */
  static async obtenerRequisitosConfig(
    tipoFuente: string
  ): Promise<RequisitoConfig[]> {
    try {
      const { data, error } = await supabase
        .from('fuentes_pago_requisitos_config')
        .select('*')
        .eq('tipo_fuente', tipoFuente)
        .order('orden', { ascending: true })

      if (error) {
        logger.error('❌ Error obteniendo configuración:', error)
        throw new Error(`Error al obtener configuración: ${error.message}`)
      }

      return (data || []) as unknown as RequisitoConfig[]
    } catch (error) {
      logger.error('❌ Error en obtenerRequisitosConfig:', error)
      throw error
    }
  }

  /**
   * Obtiene todos los requisitos configurados (para admin)
   */
  static async obtenerTodosLosRequisitos(): Promise<RequisitoConfig[]> {
    try {
      const { data, error } = await supabase
        .from('fuentes_pago_requisitos_config')
        .select('*')
        .order('tipo_fuente', { ascending: true })
        .order('orden', { ascending: true })

      if (error) {
        logger.error('❌ Error obteniendo requisitos:', error)
        throw new Error(`Error al obtener requisitos: ${error.message}`)
      }

      return (data || []) as unknown as RequisitoConfig[]
    } catch (error) {
      logger.error('❌ Error en obtenerTodosLosRequisitos:', error)
      throw error
    }
  }

  /**
   * Validación optimista para múltiples fuentes
   */
  static async validarMultiplesFuentes(
    fuentesIds: string[]
  ): Promise<Map<string, EstadoDocumentacionFuente>> {
    try {
      const resultados = await Promise.allSettled(
        fuentesIds.map(id => this.obtenerEstadoDocumentacionFuente(id))
      )

      const mapa = new Map<string, EstadoDocumentacionFuente>()

      resultados.forEach((resultado, index) => {
        const fuenteId = fuentesIds[index]
        if (resultado.status === 'fulfilled') {
          mapa.set(fuenteId, resultado.value)
        } else {
          logger.warn(
            `⚠️ Error validando fuente ${fuenteId}:`,
            resultado.reason
          )
          // Agregar estado por defecto en caso de error
          mapa.set(fuenteId, this.getDefaultEstado(fuenteId))
        }
      })

      return mapa
    } catch (error) {
      logger.error('❌ Error en validarMultiplesFuentes:', error)
      throw error
    }
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  private static getDefaultValidacion(): ValidacionRequisitos {
    return {
      cumple_requisitos: false,
      puede_continuar: false,
      total_requisitos: 0,
      requisitos_completados: 0,
      obligatorios_faltantes: 0,
      opcionales_faltantes: 0,
      documentos_faltantes: [],
      documentos_completados: [],
    }
  }

  private static getDefaultEstado(
    fuentePagoId: string
  ): EstadoDocumentacionFuente {
    return {
      fuente_pago_id: fuentePagoId,
      tipo_fuente: 'Desconocido',
      entidad: 'N/A',
      estado_general: 'bloqueado',
      progreso_porcentaje: 0,
      validacion: this.getDefaultValidacion(),
    }
  }
}
