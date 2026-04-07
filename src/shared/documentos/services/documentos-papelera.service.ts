// ============================================
// SERVICE: Documentos - Papelera
// ============================================
// Responsabilidad: Soft-delete, restauración desde papelera, hard-delete

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { auditService } from '@/services/audit.service'

import type {
  DocumentoProyecto,
  DocumentoRegistroComun,
} from '../types/documento.types'
import {
  type TipoEntidad,
  obtenerConfiguracionEntidad,
} from '../types/entidad.types'

export class DocumentosPapeleraService {
  /** Eliminar documento (soft delete) — elimina el padre y TODAS sus versiones */
  static async eliminarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data: documentoResult, error: getError } = await supabase
      .from(tabla)
      .select('id, documento_padre_id, version, es_version_actual')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult as unknown as DocumentoRegistroComun

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { data: versiones, error: versionesError } = await supabase
      .from(tabla)
      .select('id, version, es_version_actual')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .eq('estado', 'activo')
      .order('version', { ascending: false })

    if (versionesError) throw versionesError

    if (versiones && versiones.length > 0) {
      const versionMasAlta = (versiones as { id: string }[])[0]
      const idsAEliminar = (versiones as { id: string }[]).map(v => v.id)

      const { error: updateError } = await supabase
        .from(tabla)
        .update({ estado: 'eliminado' })
        .in('id', idsAEliminar)

      if (updateError) throw updateError

      const { error: flagError } = await supabase
        .from(tabla)
        .update({ es_version_actual: true })
        .eq('id', versionMasAlta.id)

      if (flagError) throw flagError
    }

    if (tipoEntidad === 'cliente') {
      try {
        const { data: docCompleto } = await supabase
          .from(tabla as 'documentos_cliente')
          .select('id, titulo, cliente_id')
          .eq('id', documentoPadreId)
          .single()

        if (docCompleto) {
          await auditService.registrarAccion({
            tabla: 'documentos_cliente',
            accion: 'DELETE',
            registroId: documentoPadreId,
            metadata: {
              cliente_id: (docCompleto as unknown as Record<string, unknown>)
                .cliente_id,
              titulo: (docCompleto as unknown as Record<string, unknown>)
                .titulo,
              tipo_operacion: 'ELIMINAR_DOCUMENTO',
            },
            modulo: 'clientes',
          })
        }
      } catch {
        // No bloquear el flujo principal si falla la auditoría
      }
    }
  }

  /**
   * Obtener documentos en papelera (eliminados)
   * @param tipoEntidad - Opcional: si no se provee, fallback a 'proyecto'
   */
  static async obtenerDocumentosEliminados(
    tipoEntidad?: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = tipoEntidad
      ? obtenerConfiguracionEntidad(tipoEntidad)
      : obtenerConfiguracionEntidad('proyecto')

    const tabla = config.tabla
    const fk = config.fkSubidoPor

    const { data, error } = await supabase
      .from(tabla)
      .select(
        `
        *,
        usuario:usuarios!${fk} (nombres, apellidos, email)
      `
      )
      .eq('estado', 'eliminado')
      .eq('es_version_actual', true)
      .order('fecha_actualizacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /** Obtener versiones eliminadas de un documento */
  static async obtenerVersionesEliminadas(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data: documentoResult, error: getError } = await supabase
      .from(tabla)
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult as unknown as DocumentoRegistroComun

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { data, error } = await supabase
      .from(tabla)
      .select(
        `
        *,
        usuario:usuarios!${config.fkSubidoPor} (
          nombres,
          apellidos,
          email
        )
      `
      )
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .eq('estado', 'eliminado')
      .order('version', { ascending: true })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /** Restaurar versiones seleccionadas desde papelera */
  static async restaurarVersionesSeleccionadas(
    versionIds: string[],
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    if (versionIds.length === 0) {
      throw new Error('Debe seleccionar al menos una versión para restaurar')
    }

    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { error } = await supabase
      .from(tabla)
      .update({ estado: 'activo' })
      .in('id', versionIds)

    if (error) throw error
  }

  /** Restaurar documento eliminado (con todas sus versiones) */
  static async restaurarDocumentoEliminado(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data: documentoResult, error: getError } = await supabase
      .from(tabla)
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult as unknown as DocumentoRegistroComun

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    let documentosARestaurar: string[] = []

    if (documento.documento_padre_id) {
      const { data: padreResult } = await supabase
        .from(tabla)
        .select('id')
        .eq('id', documento.documento_padre_id)
        .single()
      const padre = padreResult as unknown as { id: string } | null

      if (padre) {
        const { data: versiones } = await supabase
          .from(tabla)
          .select('id')
          .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
          .eq('estado', 'eliminado')

        if (versiones) {
          documentosARestaurar = (versiones as { id: string }[]).map(v => v.id)
        }
      }
    } else {
      const { data: versiones } = await supabase
        .from(tabla)
        .select('id')
        .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        documentosARestaurar = (versiones as { id: string }[]).map(v => v.id)
      }
    }

    if (documentosARestaurar.length > 0) {
      const { error: updateError } = await supabase
        .from(tabla)
        .update({ estado: 'activo' })
        .in('id', documentosARestaurar)

      if (updateError) throw updateError
    } else {
      const { error } = await supabase
        .from(tabla)
        .update({ estado: 'activo' })
        .eq('id', documentoId)

      if (error) throw error
    }
  }

  /** Eliminar definitivamente (hard delete — NO reversible) */
  static async eliminarDefinitivo(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla
    const bucket = config.bucket

    const { data: documentoResult, error: getError } = await supabase
      .from(tabla)
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult as unknown as DocumentoRegistroComun

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    let documentosAEliminar: string[] = []

    if (documento.documento_padre_id) {
      const { data: padreResult } = await supabase
        .from(tabla)
        .select('id')
        .eq('id', documento.documento_padre_id)
        .single()
      const padre = padreResult as unknown as { id: string } | null

      if (padre) {
        const { data: versiones } = await supabase
          .from(tabla)
          .select('id, url_storage')
          .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
          .eq('estado', 'eliminado')

        if (versiones) {
          for (const version of versiones as {
            id: string
            url_storage: string
          }[]) {
            try {
              await supabase.storage.from(bucket).remove([version.url_storage])
            } catch (err) {
              logger.warn('⚠️ Error al eliminar archivo de Storage:', err)
            }
          }
          documentosAEliminar = (versiones as { id: string }[]).map(v => v.id)
        }
      }
    } else {
      const { data: versiones } = await supabase
        .from(tabla)
        .select('id, url_storage')
        .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        for (const version of versiones as {
          id: string
          url_storage: string
        }[]) {
          try {
            await supabase.storage.from(bucket).remove([version.url_storage])
          } catch (err) {
            logger.warn('⚠️ Error al eliminar archivo de Storage:', err)
          }
        }
        documentosAEliminar = (versiones as { id: string }[]).map(v => v.id)
      }
    }

    if (documentosAEliminar.length > 0) {
      const { error: deleteError } = await supabase
        .from(tabla)
        .delete()
        .in('id', documentosAEliminar)

      if (deleteError) throw deleteError
    }
  }
}
