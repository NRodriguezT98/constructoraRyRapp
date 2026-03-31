// ============================================
// SERVICE: Documentos - Eliminación y Papelera
// ============================================

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type { DocumentoProyecto } from '../types/documento.types'
import { type TipoEntidad, obtenerConfiguracionEntidad } from '../types/entidad.types'

/**
 * ✅ SERVICIO GENÉRICO: Eliminación de documentos (soft/hard delete)
 * Soporta: proyectos, viviendas, clientes, contratos, proveedores
 * Responsabilidades: archivar, eliminar (soft), restaurar, eliminar definitivo (hard)
 */
export class DocumentosEliminacionService {
  /**
   * ✅ GENÉRICO: Archivar documento completo (todas las versiones)
   */
  static async archivarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad,
    motivoCategoria?: string,
    motivoDetalle?: string
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data: documentoResult, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult as any

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { error } = await supabase
      .from(tabla as any)
      .update({
        estado: 'archivado',
        motivo_categoria: motivoCategoria || null,
        motivo_detalle: motivoDetalle || null
      })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    if (error) throw error
  }

  /**
   * ✅ GENÉRICO: Restaurar documento archivado (todas las versiones)
   */
  static async restaurarDocumentoArchivado(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data: documentoResult, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult as any

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { error } = await supabase
      .from(tabla as any)
      .update({ estado: 'activo' })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    if (error) throw error
  }

  /**
   * ✅ GENÉRICO: Obtener documentos archivados de una entidad
   */
  static async obtenerDocumentosArchivados(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data, error } = await supabase
      .from(tabla as any)
      .select(`
        *,
        usuario:usuarios!${config.fkSubidoPor} (
          nombres,
          apellidos,
          email
        )
      `)
      .eq(config.campoEntidad, entidadId)
      .eq('estado', 'archivado')
      .eq('es_version_actual', true)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * ✅ GENÉRICO: Eliminar documento (soft delete)
   * Elimina el documento y TODAS sus versiones
   */
  static async eliminarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {

    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data: documentoResult2, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id, version, es_version_actual')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult2 as any

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { data: versiones, error: versionesError } = await supabase
      .from(tabla as any)
      .select('id, version, es_version_actual')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .eq('estado', 'activo')
      .order('version', { ascending: false })

    if (versionesError) throw versionesError


    if (versiones && versiones.length > 0) {
      const versionMasAlta = (versiones as any[])[0]
      const idsAEliminar = (versiones as any[]).map((v: any) => v.id)

      const { error: updateError } = await supabase
        .from(tabla as any)
        .update({ estado: 'eliminado' })
        .in('id', idsAEliminar)

      if (updateError) throw updateError

      // Asegurar que la versión más alta tenga es_version_actual=true
      const { error: flagError } = await supabase
        .from(tabla as any)
        .update({ es_version_actual: true })
        .eq('id', (versionMasAlta as any).id)

      if (flagError) throw flagError

    }
  }

  /**
   * ✅ GENÉRICO: Obtener documentos eliminados (Papelera)
   * @param tipoEntidad - Opcional: filtra por tipo de entidad. Si no se provee, muestra todos
   */
  static async obtenerDocumentosEliminados(
    tipoEntidad?: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    // Siempre especificar tipoEntidad para usar la FK correcta (evitar join ambiguo)
    const config = tipoEntidad
      ? obtenerConfiguracionEntidad(tipoEntidad)
      : obtenerConfiguracionEntidad('proyecto') // Fallback explícito

    const tabla = config.tabla
    const fk = config.fkSubidoPor

    const { data, error } = await supabase
      .from(tabla as any)
      .select(`
        *,
        usuario:usuarios!${fk} (nombres, apellidos, email)
      `)
      .eq('estado', 'eliminado')
      .eq('es_version_actual', true)
      .order('fecha_actualizacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * ✅ GENÉRICO: Obtener versiones eliminadas de un documento
   */
  static async obtenerVersionesEliminadas(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data: documentoResult, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult as any

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { data, error } = await supabase
      .from(tabla as any)
      .select(`
        *,
        usuario:usuarios!${config.fkSubidoPor} (
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
   * ✅ GENÉRICO: Restaurar versiones seleccionadas
   */
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
      .from(tabla as any)
      .update({ estado: 'activo' })
      .in('id', versionIds)

    if (error) throw error
  }

  /**
   * ✅ GENÉRICO: Restaurar documento eliminado (con todas sus versiones)
   */
  static async restaurarDocumentoEliminado(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data: documentoResult3, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult3 as any

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    let documentosARestaurar: string[] = []

    if (documento.documento_padre_id) {
      // Es una versión â†’ Restaurar toda la cadena
      const { data: padreResult } = await supabase
        .from(tabla as any)
        .select('id')
        .eq('id', documento.documento_padre_id)
        .single()
      const padre = padreResult as any

      if (padre) {
        const { data: versiones } = await supabase
          .from(tabla as any)
          .select('id')
          .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
          .eq('estado', 'eliminado')

        if (versiones) {
          documentosARestaurar = (versiones as any[]).map((v: any) => v.id)
        }
      }
    } else {
      // Es documento independiente o versión 1
      const { data: versiones } = await supabase
        .from(tabla as any)
        .select('id')
        .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        documentosARestaurar = (versiones as any[]).map((v: any) => v.id)
      }
    }

    if (documentosARestaurar.length > 0) {
      const { error: updateError } = await supabase
        .from(tabla as any)
        .update({ estado: 'activo' })
        .in('id', documentosARestaurar)

      if (updateError) throw updateError
    } else {
      // Fallback
      const { error } = await supabase
        .from(tabla as any)
        .update({ estado: 'activo' })
        .eq('id', documentoId)

      if (error) throw error
    }
  }

  /**
   * ✅ GENÉRICO: Eliminar definitivamente (hard delete - NO reversible)
   */
  static async eliminarDefinitivo(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla
    const bucket = config.bucket

    const { data: documentoResult3, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult3 as any

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    let documentosAEliminar: string[] = []

    if (documento.documento_padre_id) {
      const { data: padreDefResult } = await supabase
        .from(tabla as any)
        .select('id')
        .eq('id', documento.documento_padre_id)
        .single()
      const padre = padreDefResult as any

      if (padre) {
        const { data: versiones } = await supabase
          .from(tabla as any)
          .select('id, url_storage')
          .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
          .eq('estado', 'eliminado')

        if (versiones) {
          // ✅ STORAGE GENÉRICO
          for (const version of (versiones as any[]) as any[]) {
            try {
              await supabase.storage.from(bucket).remove([version.url_storage])
            } catch (err) {
              logger.warn('⚠️ Error al eliminar archivo de Storage:', err)
            }
          }

          documentosAEliminar = (versiones as any[]).map((v: any) => v.id)
        }
      }
    } else {
      const { data: versiones } = await supabase
        .from(tabla as any)
        .select('id, url_storage')
        .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        // ✅ STORAGE GENÉRICO
        for (const version of (versiones as any[]) as any[]) {
          try {
            await supabase.storage.from(bucket).remove([version.url_storage])
          } catch (err) {
            logger.warn('⚠️ Error al eliminar archivo de Storage:', err)
          }
        }

        documentosAEliminar = (versiones as any[]).map((v: any) => v.id)
      }
    }

    // Eliminar registros de BD (DELETE físico)
    if (documentosAEliminar.length > 0) {
      const { error: deleteError } = await supabase
        .from(tabla as any)
        .delete()
        .in('id', documentosAEliminar)

      if (deleteError) throw deleteError
    }
  }
}
