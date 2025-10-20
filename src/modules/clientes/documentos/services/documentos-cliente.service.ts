// ============================================
// SERVICE: Gestión de Documentos de Cliente
// ============================================

import { supabase } from '@/lib/supabase/client-browser'
import type { DocumentoCliente, SubirDocumentoClienteParams } from '../types'

const BUCKET_NAME = 'documentos-clientes'

export class DocumentosClienteService {
  /**
   * Obtener todos los documentos de un cliente
   */
  static async obtenerDocumentosPorCliente(
    clienteId: string
  ): Promise<DocumentoCliente[]> {
    const { data, error } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('es_version_actual', true)
      .eq('estado', 'activo')
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Obtener documentos por categoría
   */
  static async obtenerDocumentosPorCategoria(
    clienteId: string,
    categoriaId: string
  ): Promise<DocumentoCliente[]> {
    const { data, error } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('categoria_id', categoriaId)
      .eq('es_version_actual', true)
      .eq('estado', 'activo')
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Obtener documentos próximos a vencer
   */
  static async obtenerDocumentosProximosAVencer(
    clienteId: string,
    diasAntes: number = 30
  ): Promise<DocumentoCliente[]> {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + diasAntes)

    const { data, error } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('es_version_actual', true)
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
    params: SubirDocumentoClienteParams,
    userId: string
  ): Promise<DocumentoCliente> {
    const {
      archivo,
      cliente_id,
      categoria_id,
      titulo,
      descripcion,
      etiquetas,
      fecha_documento,
      fecha_vencimiento,
      es_importante,
      es_documento_identidad,
      metadata,
    } = params

    // 1. Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`

    // 2. Construir path en storage: {user_id}/{cliente_id}/{filename}
    const storagePath = `${userId}/${cliente_id}/${nombreArchivo}`

    // 3. Subir archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, archivo, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // 4. Crear registro en la base de datos
    const { data: documento, error: dbError } = await supabase
      .from('documentos_cliente')
      .insert({
        cliente_id,
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
        es_documento_identidad: es_documento_identidad || false,
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
  ): Promise<DocumentoCliente> {
    // 1. Obtener documento padre
    const { data: documentoPadre, error: fetchError } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('id', documentoPadreId)
      .single()

    if (fetchError) throw fetchError

    // 2. Marcar versión anterior como no actual
    const { error: updateError } = await supabase
      .from('documentos_cliente')
      .update({ es_version_actual: false })
      .eq('id', documentoPadreId)

    if (updateError) throw updateError

    // 3. Subir nuevo archivo
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`
    const storagePath = `${userId}/${documentoPadre.cliente_id}/${nombreArchivo}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, archivo)

    if (uploadError) throw uploadError

    // 4. Crear nuevo registro con versión incrementada
    const { data: nuevaVersion, error: dbError } = await supabase
      .from('documentos_cliente')
      .insert({
        cliente_id: documentoPadre.cliente_id,
        categoria_id: documentoPadre.categoria_id,
        titulo: documentoPadre.titulo,
        nombre_archivo: nombreArchivo,
        nombre_original: archivo.name,
        tamano_bytes: archivo.size,
        tipo_mime: archivo.type,
        url_storage: storagePath,
        etiquetas: documentoPadre.etiquetas,
        version: documentoPadre.version + 1,
        es_version_actual: true,
        documento_padre_id: documentoPadreId,
        estado: 'activo',
        metadata: documentoPadre.metadata,
        subido_por: userId,
        fecha_documento: documentoPadre.fecha_documento,
        fecha_vencimiento: documentoPadre.fecha_vencimiento,
        es_importante: documentoPadre.es_importante,
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
   * Obtener URL de descarga temporal (signed URL)
   */
  static async obtenerUrlDescarga(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, 3600) // Válido por 1 hora

    if (error) throw error
    return data.signedUrl
  }

  /**
   * Actualizar documento
   */
  static async actualizarDocumento(
    documentoId: string,
    updates: Partial<DocumentoCliente>
  ): Promise<DocumentoCliente> {
    const { data, error } = await supabase
      .from('documentos_cliente')
      .update(updates)
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
      .from('documentos_cliente')
      .update({ estado: 'archivado' })
      .eq('id', documentoId)

    if (error) throw error
  }

  /**
   * Eliminar documento (hard delete)
   */
  static async eliminarDocumento(documentoId: string): Promise<void> {
    // 1. Obtener info del documento
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_cliente')
      .select('url_storage')
      .eq('id', documentoId)
      .single()

    if (fetchError) throw fetchError

    // 2. Eliminar de storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([documento.url_storage])

    if (storageError) throw storageError

    // 3. Eliminar de BD
    const { error: dbError } = await supabase
      .from('documentos_cliente')
      .delete()
      .eq('id', documentoId)

    if (dbError) throw dbError
  }

  /**
   * Obtener todas las versiones de un documento
   */
  static async obtenerVersiones(
    documentoId: string
  ): Promise<DocumentoCliente[]> {
    const { data, error } = await supabase
      .from('documentos_cliente')
      .select('*')
      .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
      .order('version', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Buscar documentos
   */
  static async buscarDocumentos(
    clienteId: string,
    busqueda: string
  ): Promise<DocumentoCliente[]> {
    const { data, error } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('es_version_actual', true)
      .eq('estado', 'activo')
      .or(
        `titulo.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%,nombre_original.ilike.%${busqueda}%`
      )
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Obtener estadísticas de documentos
   */
  static async obtenerEstadisticas(clienteId: string) {
    const documentos = await this.obtenerDocumentosPorCliente(clienteId)

    const stats = {
      total: documentos.length,
      importantes: documentos.filter((d) => d.es_importante).length,
      por_categoria: {} as Record<string, number>,
      sin_categoria: documentos.filter((d) => !d.categoria_id).length,
    }

    documentos.forEach((doc) => {
      if (doc.categoria_id) {
        stats.por_categoria[doc.categoria_id] =
          (stats.por_categoria[doc.categoria_id] || 0) + 1
      }
    })

    return stats
  }

  /**
   * Verificar si el cliente tiene cédula activa (requerido para negociaciones)
   */
  static async tieneCedulaActiva(clienteId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('documentos_cliente')
      .select('id')
      .eq('cliente_id', clienteId)
      .eq('es_documento_identidad', true)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .limit(1)

    if (error) throw error
    return (data && data.length > 0) || false
  }

  /**
   * Obtener documento de identidad del cliente
   */
  static async obtenerCedula(
    clienteId: string
  ): Promise<DocumentoCliente | null> {
    const { data, error } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('es_documento_identidad', true)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .order('fecha_creacion', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No encontrado
      throw error
    }

    return data
  }
}
