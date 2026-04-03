// ============================================
// SERVICE: Documentos - Estados de VersiÃ³n
// ============================================

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { auditService } from '@/services/audit.service'

import {
  type TipoEntidad,
  obtenerConfiguracionEntidad,
} from '../types/entidad.types'

/**
 * Servicio de gestión de estados de versión (GENÉRICO)
 * Responsabilidades: marcar errónea, marcar obsoleta, restaurar estado
 */
export class DocumentosEstadosService {
  /**
   * âœ… GENÃ‰RICO: MARCAR VERSIÃ“N COMO ERRÃ“NEA
   */
  static async marcarVersionComoErronea(
    documentoId: string,
    motivo: string,
    versionCorrectaId?: string,
    tipoEntidad: TipoEntidad = 'proyecto'
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from(config.tabla as 'documentos_proyecto')
      .select('id, titulo, version, estado_version')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      logger.error('âŒ Error al buscar documento:', {
        documentoId,
        error: fetchError,
      })
      throw new Error(
        `Documento no encontrado: ${fetchError?.message || 'ID invÃ¡lido'}`
      )
    }

    // 2. Validar que la versiÃ³n correcta existe (si se proporciona)
    if (versionCorrectaId) {
      const { data: versionCorrecta, error: correctaError } = await supabase
        .from(config.tabla as 'documentos_proyecto')
        .select('id, titulo, version')
        .eq('id', versionCorrectaId)
        .single()

      if (correctaError || !versionCorrecta) {
        throw new Error('La versiÃ³n correcta especificada no existe')
      }
    }

    // 3. Actualizar estado de la versiÃ³n
    const { error: updateError } = await supabase
      .from(config.tabla as 'documentos_proyecto')
      .update({
        estado_version: 'erronea',
        motivo_estado: motivo,
        version_corrige_a: versionCorrectaId || null,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', documentoId)

    if (updateError) {
      logger.error('âŒ Error al marcar versiÃ³n como errÃ³nea:', updateError)
      throw new Error(`Error al actualizar estado: ${updateError.message}`)
    }

    // 4. Si hay versiÃ³n correcta, vincularla
    if (versionCorrectaId) {
      const { error: linkError } = await supabase
        .from(config.tabla as 'documentos_proyecto')
        .update({
          metadata: {
            corrige_version_erronea: documentoId,
            fecha_correccion: new Date().toISOString(),
          },
        })
        .eq('id', versionCorrectaId)

      if (linkError) {
        logger.warn('âš ï¸ No se pudo vincular versiÃ³n correcta:', linkError)
      }
    }

    // 5. Registrar en auditorÃ­a
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: docCompleto } = await supabase
        .from(config.tabla as 'documentos_proyecto')
        .select('*, categorias_documento(nombre)')
        .eq('id', documentoId)
        .single()

      await auditService.registrarAccion({
        tabla: config.tabla,
        accion: 'UPDATE',
        registroId: documentoId,
        datosAnteriores: {
          estado_version: documento.estado_version || 'valida',
          motivo_estado: null,
          version_corrige_a: null,
        },
        datosNuevos: {
          estado_version: 'erronea',
          motivo_estado: motivo,
          version_corrige_a: versionCorrectaId || null,
        },
        metadata: {
          tipo_operacion: 'MARCAR_VERSION_ERRONEA',
          motivo_cambio: motivo,
          documento: {
            id: documentoId,
            titulo: docCompleto?.titulo,
            version: docCompleto?.version,
            categoria:
              docCompleto?.categorias_documento?.nombre || 'Sin categorÃ­a',
            estado_anterior: documento.estado_version || 'valida',
            estado_nuevo: 'erronea',
            es_version_actual: docCompleto?.es_version_actual,
          },
          version_correcta: versionCorrectaId
            ? {
                id: versionCorrectaId,
                vinculacion:
                  'Esta versiÃ³n errÃ³nea es corregida por la versiÃ³n indicada',
              }
            : null,
          fecha_marcado: new Date().toISOString(),
          usuario: {
            usuario_id: user?.id || 'desconocido',
            email: user?.email || 'desconocido',
          },
          contexto: {
            [config.campoEntidad]:
              docCompleto?.[config.campoEntidad as keyof typeof docCompleto],
            tipo_archivo: docCompleto?.tipo_mime,
            tamano_bytes: docCompleto?.tamano_bytes,
          },
        },
        modulo: 'documentos',
      })
    } catch (auditError) {
      logger.error('âŒ Error al registrar auditorÃ­a:', auditError)
    }
  }

  /**
   * âœ… GENÃ‰RICO: MARCAR VERSIÃ“N COMO OBSOLETA
   */
  static async marcarVersionComoObsoleta(
    documentoId: string,
    motivo: string,
    tipoEntidad: TipoEntidad = 'proyecto'
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from(config.tabla as 'documentos_proyecto')
      .select('id, titulo, version, estado_version')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      logger.error('âŒ Error al buscar documento:', {
        documentoId,
        error: fetchError,
      })
      throw new Error(
        `Documento no encontrado: ${fetchError?.message || 'ID invÃ¡lido'}`
      )
    }

    // 2. Actualizar estado
    const { error: updateError } = await supabase
      .from(config.tabla as 'documentos_proyecto')
      .update({
        estado_version: 'obsoleta',
        motivo_estado: motivo,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', documentoId)

    if (updateError) {
      logger.error('âŒ Error al marcar versiÃ³n como obsoleta:', updateError)
      throw new Error(`Error al actualizar estado: ${updateError.message}`)
    }

    // 3. Registrar en auditorÃ­a
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: docCompleto } = await supabase
        .from(config.tabla as 'documentos_proyecto')
        .select('*, categorias_documento(nombre)')
        .eq('id', documentoId)
        .single()

      await auditService.registrarAccion({
        tabla: config.tabla,
        accion: 'UPDATE',
        registroId: documentoId,
        datosAnteriores: {
          estado_version: documento.estado_version || 'valida',
          motivo_estado: null,
        },
        datosNuevos: {
          estado_version: 'obsoleta',
          motivo_estado: motivo,
        },
        metadata: {
          tipo_operacion: 'MARCAR_VERSION_OBSOLETA',
          motivo_cambio: motivo,
          documento: {
            id: documentoId,
            titulo: docCompleto?.titulo,
            version: docCompleto?.version,
            categoria:
              docCompleto?.categorias_documento?.nombre || 'Sin categorÃ­a',
            estado_anterior: documento.estado_version || 'valida',
            estado_nuevo: 'obsoleta',
            es_version_actual: docCompleto?.es_version_actual,
          },
          razon_obsolescencia: motivo,
          fecha_marcado: new Date().toISOString(),
          usuario: {
            usuario_id: user?.id || 'desconocido',
            email: user?.email || 'desconocido',
          },
          contexto: {
            [config.campoEntidad]:
              docCompleto?.[config.campoEntidad as keyof typeof docCompleto],
            tipo_archivo: docCompleto?.tipo_mime,
          },
        },
        modulo: 'documentos',
      })
    } catch (auditError) {
      logger.error('âš ï¸ Error al registrar auditorÃ­a:', auditError)
    }
  }

  /**
   * âœ… GENÃ‰RICO: RESTAURAR ESTADO DE VERSIÃ“N A "VÃLIDA"
   */
  static async restaurarEstadoVersion(
    documentoId: string,
    tipoEntidad: TipoEntidad = 'proyecto'
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from(config.tabla as 'documentos_proyecto')
      .select('id, titulo, version, estado_version, motivo_estado')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      logger.error('âŒ Error al buscar documento:', {
        documentoId,
        error: fetchError,
      })
      throw new Error(
        `Documento no encontrado: ${fetchError?.message || 'ID invÃ¡lido'}`
      )
    }

    // 2. Restaurar a estado vÃ¡lido
    const { error: updateError } = await supabase
      .from(config.tabla as 'documentos_proyecto')
      .update({
        estado_version: 'valida',
        motivo_estado: null,
        version_corrige_a: null,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', documentoId)

    if (updateError) {
      logger.error('âŒ Error al restaurar estado:', updateError)
      throw new Error(`Error al restaurar estado: ${updateError.message}`)
    }

    // 3. Registrar en auditorÃ­a
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: docCompleto } = await supabase
        .from(config.tabla as 'documentos_proyecto')
        .select('*, categorias_documento(nombre)')
        .eq('id', documentoId)
        .single()

      await auditService.registrarAccion({
        tabla: config.tabla,
        accion: 'UPDATE',
        registroId: documentoId,
        datosAnteriores: {
          estado_version: documento.estado_version,
          motivo_estado: documento.motivo_estado,
          version_corrige_a: null,
        },
        datosNuevos: {
          estado_version: 'valida',
          motivo_estado: null,
          version_corrige_a: null,
        },
        metadata: {
          tipo_operacion: 'RESTAURAR_ESTADO_VERSION',
          documento: {
            id: documentoId,
            titulo: docCompleto?.titulo,
            version: docCompleto?.version,
            categoria:
              docCompleto?.categorias_documento?.nombre || 'Sin categorÃ­a',
            estado_anterior: documento.estado_version,
            estado_nuevo: 'valida',
            motivo_anterior: documento.motivo_estado,
            es_version_actual: docCompleto?.es_version_actual,
          },
          restauracion: {
            desde_estado: documento.estado_version,
            motivo_original: documento.motivo_estado,
            fecha_restauracion: new Date().toISOString(),
            razon: 'RestauraciÃ³n manual de estado a vÃ¡lido',
          },
          usuario: {
            usuario_id: user?.id || 'desconocido',
            email: user?.email || 'desconocido',
          },
          contexto: {
            [config.campoEntidad]:
              docCompleto?.[config.campoEntidad as keyof typeof docCompleto],
            tipo_archivo: docCompleto?.tipo_mime,
          },
        },
        modulo: 'documentos',
      })
    } catch (auditError) {
      logger.error('âš ï¸ Error al registrar auditorÃ­a:', auditError)
    }
  }
}
