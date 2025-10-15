// ============================================
// SERVICE: Gestión de Documentos de Proyecto
// ============================================

import { supabase } from '../../../lib/supabase/client'
import type { DocumentoProyecto } from '../types/documento.types'

const BUCKET_NAME = 'documentos-proyectos'

interface SubirDocumentoParams {
  proyecto_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  archivo: File
  etiquetas?: string[]
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  metadata?: Record<string, any>
}

export class DocumentosService {
  /**
   * Obtener todos los documentos de un proyecto
   */
  static async obtenerDocumentosPorProyecto(
    proyectoId: string
  ): Promise<DocumentoProyecto[]> {
    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('estado', 'activo')
      .order('es_importante', { ascending: false }) // Importantes primero
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Obtener documentos por categoría
   */
  static async obtenerDocumentosPorCategoria(
    proyectoId: string,
    categoriaId: string
  ): Promise<DocumentoProyecto[]> {
    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('categoria_id', categoriaId)
      .eq('estado', 'activo')
      .order('version', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Obtener documentos próximos a vencer
   */
  static async obtenerDocumentosProximosAVencer(
    diasAntes: number = 30
  ): Promise<DocumentoProyecto[]> {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + diasAntes)

    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('estado', 'activo')
      .not('fecha_vencimiento', 'is', null)
      .lte('fecha_vencimiento', fechaLimite.toISOString())
      .order('fecha_vencimiento', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Subir un nuevo documento
   */
  static async subirDocumento(
    params: SubirDocumentoParams,
    userId: string
  ): Promise<DocumentoProyecto> {
    const {
      archivo,
      proyecto_id,
      categoria_id,
      titulo,
      descripcion,
      etiquetas,
      fecha_documento,
      fecha_vencimiento,
      es_importante,
      metadata,
    } = params

    // 1. Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`

    // 2. Construir path en storage: {user_id}/{proyecto_id}/{filename}
    const storagePath = `${userId}/${proyecto_id}/${nombreArchivo}`

    // 3. Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, archivo, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // 4. Crear registro en la base de datos
    const { data: documento, error: dbError } = await supabase
      .from('documentos_proyecto')
      .insert({
        proyecto_id,
        categoria_id: categoria_id || null,
        titulo,
        descripcion: descripcion || null,
        nombre_archivo: nombreArchivo,
        nombre_original: archivo.name,
        tamano_bytes: archivo.size,
        tipo_mime: archivo.type,
        url_storage: storagePath,
        etiquetas: etiquetas || [],
        subido_por: userId,
        fecha_documento: fecha_documento || null,
        fecha_vencimiento: fecha_vencimiento || null,
        es_importante: es_importante || false,
        metadata: metadata || {},
        version: 1,
        es_version_actual: true,
        estado: 'activo',
      })
      .select()
      .single()

    if (dbError) {
      // Si falla la BD, eliminar archivo de storage
      await supabase.storage.from(BUCKET_NAME).remove([storagePath])
      throw dbError
    }

    return documento
  }

  /**
   * Subir nueva versión de un documento existente
   */
  static async subirNuevaVersion(
    documentoPadreId: string,
    archivo: File,
    userId: string
  ): Promise<DocumentoProyecto> {
    // 1. Obtener documento padre
    const { data: documentoPadre, error: padreError } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('id', documentoPadreId)
      .single()

    if (padreError) throw padreError

    // 2. Marcar versión anterior como no actual
    const { error: updateError } = await supabase
      .from('documentos_proyecto')
      .update({ es_version_actual: false })
      .eq('id', documentoPadreId)

    if (updateError) throw updateError

    // 3. Subir nuevo archivo
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`
    const storagePath = `${userId}/${documentoPadre.proyecto_id}/${nombreArchivo}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, archivo)

    if (uploadError) throw uploadError

    // 4. Crear nuevo registro con versión incrementada
    const { data: nuevaVersion, error: dbError } = await supabase
      .from('documentos_proyecto')
      .insert({
        proyecto_id: documentoPadre.proyecto_id,
        categoria_id: documentoPadre.categoria_id,
        titulo: documentoPadre.titulo,
        nombre_archivo: nombreArchivo,
        nombre_original: archivo.name,
        descripcion: documentoPadre.descripcion,
        tamano_bytes: archivo.size,
        tipo_mime: archivo.type,
        url_storage: storagePath,
        etiquetas: documentoPadre.etiquetas,
        subido_por: userId,
        fecha_documento: documentoPadre.fecha_documento,
        fecha_vencimiento: documentoPadre.fecha_vencimiento,
        es_importante: documentoPadre.es_importante,
        metadata: documentoPadre.metadata,
        version: documentoPadre.version + 1,
        es_version_actual: true,
        documento_padre_id: documentoPadreId,
        estado: 'activo',
      })
      .select()
      .single()

    if (dbError) {
      await supabase.storage.from(BUCKET_NAME).remove([storagePath])
      throw dbError
    }

    return nuevaVersion
  }

  /**
   * Obtener URL de descarga con firma temporal
   */
  static async obtenerUrlDescarga(
    storagePath: string,
    expiresIn: number = 3600 // 1 hora por defecto
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresIn)

    if (error) throw error
    return data.signedUrl
  }

  /**
   * Descargar archivo
   */
  static async descargarArchivo(storagePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(storagePath)

    if (error) throw error
    return data
  }

  /**
   * Eliminar documento (soft delete)
   */
  static async eliminarDocumento(documentoId: string): Promise<void> {
    const { error } = await supabase
      .from('documentos_proyecto')
      .update({ estado: 'eliminado' })
      .eq('id', documentoId)

    if (error) throw error
  }

  /**
   * Eliminar documento permanentemente (incluye archivo)
   */
  static async eliminarDocumentoPermanente(documentoId: string): Promise<void> {
    // 1. Obtener documento
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('url_storage')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError

    // 2. Eliminar archivo de storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([documento.url_storage])

    if (storageError) throw storageError

    // 3. Eliminar registro de BD
    const { error: dbError } = await supabase
      .from('documentos_proyecto')
      .delete()
      .eq('id', documentoId)

    if (dbError) throw dbError
  }

  /**
   * Actualizar documento
   */
  static async actualizarDocumento(
    documentoId: string,
    updates: Partial<
      Pick<
        DocumentoProyecto,
        | 'titulo'
        | 'descripcion'
        | 'categoria_id'
        | 'etiquetas'
        | 'fecha_documento'
        | 'fecha_vencimiento'
        | 'es_importante'
        | 'metadata'
      >
    >
  ): Promise<DocumentoProyecto> {
    const { data, error } = await supabase
      .from('documentos_proyecto')
      .update(updates)
      .eq('id', documentoId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Obtener historial de versiones de un documento
   */
  static async obtenerHistorialVersiones(
    documentoId: string
  ): Promise<DocumentoProyecto[]> {
    // Obtener todas las versiones relacionadas
    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
      .order('version', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Buscar documentos por texto
   */
  static async buscarDocumentos(
    proyectoId: string,
    busqueda: string
  ): Promise<DocumentoProyecto[]> {
    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('estado', 'activo')
      .or(
        `titulo.ilike.%${busqueda}%,nombre_original.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`
      )
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Obtener documentos por etiquetas
   */
  static async obtenerDocumentosPorEtiquetas(
    proyectoId: string,
    etiquetas: string[]
  ): Promise<DocumentoProyecto[]> {
    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('estado', 'activo')
      .contains('etiquetas', etiquetas)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Obtener solo documentos importantes
   */
  static async obtenerDocumentosImportantes(
    proyectoId: string
  ): Promise<DocumentoProyecto[]> {
    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('estado', 'activo')
      .eq('es_importante', true)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Marcar/Desmarcar documento como importante
   */
  static async toggleImportante(
    documentoId: string,
    importante: boolean
  ): Promise<DocumentoProyecto> {
    const { data, error } = await supabase
      .from('documentos_proyecto')
      .update({ es_importante: importante })
      .eq('id', documentoId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Archivar documento (soft delete)
   */
  static async archivarDocumento(documentoId: string): Promise<void> {
    const { error } = await supabase
      .from('documentos_proyecto')
      .update({ estado: 'archivado' })
      .eq('id', documentoId)

    if (error) throw error
  }

  /**
   * Restaurar documento archivado
   */
  static async restaurarDocumento(documentoId: string): Promise<void> {
    const { error } = await supabase
      .from('documentos_proyecto')
      .update({ estado: 'activo' })
      .eq('id', documentoId)

    if (error) throw error
  }
}
