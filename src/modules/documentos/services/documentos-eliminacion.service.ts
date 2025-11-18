// ============================================
// SERVICE: Documentos - Eliminación y Papelera
// ============================================

import { supabase } from '@/lib/supabase/client'
import type { DocumentoProyecto } from '../types/documento.types'

const BUCKET_NAME = 'documentos-proyectos'

/**
 * Servicio de eliminación de documentos (soft/hard delete)
 * Responsabilidades: archivar, eliminar (soft), restaurar, eliminar definitivo (hard)
 */
export class DocumentosEliminacionService {
  /**
   * ARCHIVAR DOCUMENTO COMPLETO (todas las versiones)
   */
  static async archivarDocumento(documentoId: string): Promise<void> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { error } = await supabase
      .from('documentos_proyecto')
      .update({ estado: 'archivado' })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    if (error) throw error
  }

  /**
   * RESTAURAR DOCUMENTO ARCHIVADO (todas las versiones)
   */
  static async restaurarDocumentoArchivado(documentoId: string): Promise<void> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { error } = await supabase
      .from('documentos_proyecto')
      .update({ estado: 'activo' })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    if (error) throw error
  }

  /**
   * OBTENER DOCUMENTOS ARCHIVADOS
   */
  static async obtenerDocumentosArchivados(
    proyectoId: string
  ): Promise<DocumentoProyecto[]> {
    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select(`
        *,
        usuario:usuarios!fk_documentos_proyecto_subido_por (
          nombres,
          apellidos,
          email
        )
      `)
      .eq('proyecto_id', proyectoId)
      .eq('estado', 'archivado')
      .eq('es_version_actual', true)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * ELIMINAR DOCUMENTO (soft delete)
   * Elimina el documento y TODAS sus versiones
   */
  static async eliminarDocumento(documentoId: string): Promise<void> {
    console.log('🗑️ Eliminando documento (soft delete):', documentoId)

    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id, version, es_version_actual')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { data: versiones, error: versionesError } = await supabase
      .from('documentos_proyecto')
      .select('id, version, es_version_actual')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .eq('estado', 'activo')
      .order('version', { ascending: false })

    if (versionesError) throw versionesError

    console.log(`📊 Eliminando ${versiones?.length || 0} versiones activas`)

    if (versiones && versiones.length > 0) {
      const versionMasAlta = versiones[0]
      const idsAEliminar = versiones.map((v) => v.id)

      const { error: updateError } = await supabase
        .from('documentos_proyecto')
        .update({ estado: 'eliminado' })
        .in('id', idsAEliminar)

      if (updateError) throw updateError

      // Asegurar que la versión más alta tenga es_version_actual=true
      const { error: flagError } = await supabase
        .from('documentos_proyecto')
        .update({ es_version_actual: true })
        .eq('id', versionMasAlta.id)

      if (flagError) throw flagError

      console.log(`✅ ${versiones.length} versiones eliminadas`)
    }
  }

  /**
   * OBTENER DOCUMENTOS ELIMINADOS (Papelera)
   */
  static async obtenerDocumentosEliminados(): Promise<DocumentoProyecto[]> {
    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select(`
        *,
        proyectos(nombre),
        usuarios(nombres, apellidos, email)
      `)
      .eq('estado', 'eliminado')
      .eq('es_version_actual', true)
      .order('fecha_actualizacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * OBTENER VERSIONES ELIMINADAS de un documento
   */
  static async obtenerVersionesEliminadas(
    documentoId: string
  ): Promise<DocumentoProyecto[]> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select(`
        *,
        usuario:usuarios!fk_documentos_proyecto_subido_por (
          nombres,
          apellidos,
          email
        )
      `)
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .eq('estado', 'eliminado')
      .order('version', { ascending: true })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * RESTAURAR VERSIONES SELECCIONADAS
   */
  static async restaurarVersionesSeleccionadas(versionIds: string[]): Promise<void> {
    if (versionIds.length === 0) {
      throw new Error('Debe seleccionar al menos una versión para restaurar')
    }

    const { error } = await supabase
      .from('documentos_proyecto')
      .update({ estado: 'activo' })
      .in('id', versionIds)

    if (error) throw error
  }

  /**
   * RESTAURAR DOCUMENTO ELIMINADO (con todas sus versiones)
   */
  static async restaurarDocumentoEliminado(documentoId: string): Promise<void> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    let documentosARestaurar: string[] = []

    if (documento.documento_padre_id) {
      // Es una versión → Restaurar toda la cadena
      const { data: padre } = await supabase
        .from('documentos_proyecto')
        .select('id')
        .eq('id', documento.documento_padre_id)
        .single()

      if (padre) {
        const { data: versiones } = await supabase
          .from('documentos_proyecto')
          .select('id')
          .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
          .eq('estado', 'eliminado')

        if (versiones) {
          documentosARestaurar = versiones.map((v) => v.id)
        }
      }
    } else {
      // Es documento independiente o versión 1
      const { data: versiones } = await supabase
        .from('documentos_proyecto')
        .select('id')
        .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        documentosARestaurar = versiones.map((v) => v.id)
      }
    }

    if (documentosARestaurar.length > 0) {
      const { error: updateError } = await supabase
        .from('documentos_proyecto')
        .update({ estado: 'activo' })
        .in('id', documentosARestaurar)

      if (updateError) throw updateError
    } else {
      // Fallback
      const { error } = await supabase
        .from('documentos_proyecto')
        .update({ estado: 'activo' })
        .eq('id', documentoId)

      if (error) throw error
    }
  }

  /**
   * ELIMINAR DEFINITIVAMENTE (hard delete - NO reversible)
   */
  static async eliminarDefinitivo(documentoId: string): Promise<void> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    let documentosAEliminar: string[] = []

    if (documento.documento_padre_id) {
      const { data: padre } = await supabase
        .from('documentos_proyecto')
        .select('id')
        .eq('id', documento.documento_padre_id)
        .single()

      if (padre) {
        const { data: versiones } = await supabase
          .from('documentos_proyecto')
          .select('id, url_storage')
          .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
          .eq('estado', 'eliminado')

        if (versiones) {
          // Eliminar archivos de Storage
          for (const version of versiones) {
            try {
              await supabase.storage.from(BUCKET_NAME).remove([version.url_storage])
            } catch (err) {
              console.warn('⚠️ Error al eliminar archivo de Storage:', err)
            }
          }

          documentosAEliminar = versiones.map((v) => v.id)
        }
      }
    } else {
      const { data: versiones } = await supabase
        .from('documentos_proyecto')
        .select('id, url_storage')
        .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        // Eliminar archivos de Storage
        for (const version of versiones) {
          try {
            await supabase.storage.from(BUCKET_NAME).remove([version.url_storage])
          } catch (err) {
            console.warn('⚠️ Error al eliminar archivo de Storage:', err)
          }
        }

        documentosAEliminar = versiones.map((v) => v.id)
      }
    }

    // Eliminar registros de BD (DELETE físico)
    if (documentosAEliminar.length > 0) {
      const { error: deleteError } = await supabase
        .from('documentos_proyecto')
        .delete()
        .in('id', documentosAEliminar)

      if (deleteError) throw deleteError
    }
  }
}
