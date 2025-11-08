// ============================================
// SERVICE: Gestión de Documentos de Cliente
// ============================================

import { supabase } from '@/lib/supabase/client'

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
    diasAntes = 30
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
   * Renombrar documento (actualizar título)
   */
  static async renombrarDocumento(
    documentoId: string,
    nuevoTitulo: string
  ): Promise<void> {
    // Validar título
    if (!nuevoTitulo || nuevoTitulo.trim().length === 0) {
      throw new Error('El título no puede estar vacío')
    }

    if (nuevoTitulo.length > 200) {
      throw new Error('El título no puede exceder 200 caracteres')
    }

    const { error } = await supabase
      .from('documentos_cliente')
      .update({
        titulo: nuevoTitulo.trim(),
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', documentoId)

    if (error) throw error
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
   * Crear nueva versión de un documento
   */
  static async crearNuevaVersion(
    documentoIdOriginal: string,
    archivo: File,
    userId: string,
    cambios?: string
  ): Promise<DocumentoCliente> {
    // 1. Obtener documento original
    const { data: docOriginal, error: fetchError } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('id', documentoIdOriginal)
      .single()

    if (fetchError) throw fetchError

    // 2. Encontrar el documento padre (la versión 1)
    const documentoPadreId = docOriginal.documento_padre_id || documentoIdOriginal

    // 3. Obtener la versión más alta actual
    const { data: versiones } = await supabase
      .from('documentos_cliente')
      .select('version')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .order('version', { ascending: false })
      .limit(1)

    const nuevaVersion = (versiones?.[0]?.version || 0) + 1

    // 4. Marcar versiones anteriores como NO actuales
    await supabase
      .from('documentos_cliente')
      .update({ es_version_actual: false })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    // 5. Subir nuevo archivo a Storage
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`
    const storagePath = `${userId}/${docOriginal.cliente_id}/${nombreArchivo}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, archivo)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath)

    // 6. Crear nuevo registro de documento
    const { data: nuevaVersionDoc, error: insertError } = await supabase
      .from('documentos_cliente')
      .insert({
        cliente_id: docOriginal.cliente_id,
        categoria_id: docOriginal.categoria_id,
        titulo: docOriginal.titulo,
        descripcion: cambios || docOriginal.descripcion,
        nombre_archivo: nombreArchivo,
        nombre_original: archivo.name,
        tamano_bytes: archivo.size,
        tipo_mime: archivo.type,
        url_storage: publicUrl,
        etiquetas: docOriginal.etiquetas,
        version: nuevaVersion,
        es_version_actual: true,
        documento_padre_id: documentoPadreId,
        estado: 'activo',
        metadata: {
          ...(typeof docOriginal.metadata === 'object' && docOriginal.metadata !== null ? docOriginal.metadata : {}),
          cambios,
          version_anterior_id: documentoIdOriginal
        } as any,
        subido_por: userId,
        fecha_documento: docOriginal.fecha_documento,
        fecha_vencimiento: docOriginal.fecha_vencimiento,
        es_importante: docOriginal.es_importante
      })
      .select()
      .single()

    if (insertError) throw insertError

    return nuevaVersionDoc
  }

  /**
   * Restaurar una versión anterior (crea una nueva versión con el contenido de la anterior)
   */
  static async restaurarVersion(
    versionId: string,
    userId: string
  ): Promise<DocumentoCliente> {
    // 1. Obtener la versión a restaurar
    const { data: versionAnterior, error: fetchError } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('id', versionId)
      .single()

    if (fetchError) throw fetchError

    // 2. Descargar el archivo de esa versión
    const { data: archivoBlob, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(versionAnterior.url_storage.split(`${BUCKET_NAME}/`)[1])

    if (downloadError) throw downloadError

    // 3. Convertir blob a File
    const archivo = new File(
      [archivoBlob],
      versionAnterior.nombre_original,
      { type: versionAnterior.tipo_mime }
    )

    // 4. Crear nueva versión con el contenido restaurado
    const documentoPadreId = versionAnterior.documento_padre_id || versionId

    return await this.crearNuevaVersion(
      documentoPadreId,
      archivo,
      userId,
      `Restaurado desde versión ${versionAnterior.version}`
    )
  }

  /**
   * Eliminar versión (soft delete)
   * NO elimina el archivo físico, solo marca como eliminado
   */
  static async eliminarVersion(
    versionId: string,
    userId: string,
    motivo: string
  ): Promise<void> {
    // 1. Obtener la versión a eliminar
    const { data: version, error: fetchError } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('id', versionId)
      .single()

    if (fetchError) throw fetchError
    if (!version) throw new Error('Versión no encontrada')

    // 2. Validaciones de seguridad
    if (version.es_version_actual) {
      throw new Error('No se puede eliminar la versión actual')
    }

    // 3. Contar versiones activas del documento
    const raizId = version.documento_padre_id || version.id
    const { data: versionesActivas, error: countError } = await supabase
      .from('documentos_cliente')
      .select('id')
      .or(`id.eq.${raizId},documento_padre_id.eq.${raizId}`)
      .eq('estado', 'activo')

    if (countError) throw countError

    if (versionesActivas && versionesActivas.length <= 2) {
      throw new Error('Debe mantener al menos 2 versiones activas')
    }

    // 4. Marcar como eliminado (soft delete)
    const metadataActual = typeof version.metadata === 'object' && version.metadata !== null
      ? version.metadata as Record<string, any>
      : {}

    const { error: updateError } = await supabase
      .from('documentos_cliente')
      .update({
        estado: 'eliminado',
        metadata: {
          ...metadataActual,
          motivo_eliminacion: motivo,
          eliminado_por: userId,
          fecha_eliminacion: new Date().toISOString(),
        },
      })
      .eq('id', versionId)

    if (updateError) throw updateError

    console.log(`✅ Versión ${version.version} eliminada (soft delete) - Motivo: ${motivo}`)
  }

  /**
   * Verificar si un documento pertenece a un proceso completado
   */
  static async esDocumentoDeProceso(documentoId: string): Promise<{
    esDeProceso: boolean
    procesoCompletado: boolean
    pasoNombre?: string
  }> {
    try {
      // Obtener el documento
      const { data: documento, error: docError } = await supabase
        .from('documentos_cliente')
        .select('url_storage, etiquetas')
        .eq('id', documentoId)
        .single()

      if (docError || !documento) {
        console.error('Error al obtener documento:', docError)
        return { esDeProceso: false, procesoCompletado: false }
      }

      // Verificar si tiene etiqueta de Proceso
      const etiquetas = Array.isArray(documento.etiquetas) ? documento.etiquetas : []
      const esDeProceso = etiquetas.some(
        (e: string) => e.toLowerCase() === 'proceso' || e.toLowerCase() === 'negociación'
      )

      if (!esDeProceso) {
        return { esDeProceso: false, procesoCompletado: false }
      }

      // Buscar en procesos_negociacion si la URL está vinculada
      // Usar operador @> (contains) para buscar en el array JSONB
      const { data: procesos, error: procesoError } = await supabase
        .from('procesos_negociacion')
        .select('id, nombre, estado, fecha_completado, documentos_urls')
        .not('documentos_urls', 'is', null)

      if (procesoError) {
        console.error('Error al buscar procesos:', procesoError)
        return { esDeProceso: true, procesoCompletado: false }
      }

      if (!procesos || procesos.length === 0) {
        return { esDeProceso: true, procesoCompletado: false }
      }

      // Filtrar procesos que contengan la URL del documento
      const procesosConDocumento = procesos.filter(p => {
        if (!p.documentos_urls) return false
        const urls = Array.isArray(p.documentos_urls) ? p.documentos_urls : []
        return urls.includes(documento.url_storage)
      })

      if (procesosConDocumento.length === 0) {
        return { esDeProceso: true, procesoCompletado: false }
      }

      // Verificar si algún proceso tiene fecha_completado
      const procesoCompletado = procesosConDocumento.some(p => p.fecha_completado !== null)

      return {
        esDeProceso: true,
        procesoCompletado,
        pasoNombre: procesosConDocumento[0]?.nombre
      }
    } catch (error) {
      console.error('Error en esDocumentoDeProceso:', error)
      return { esDeProceso: false, procesoCompletado: false }
    }
  }

  /**
   * Obtener todas las versiones de un documento
   */
  static async obtenerVersiones(
    documentoId: string
  ): Promise<DocumentoCliente[]> {
    // 1. Obtener el documento solicitado
    const { data: docActual, error: errorDoc } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('id', documentoId)
      .single()

    if (errorDoc) throw errorDoc
    if (!docActual) return []

    // 2. Determinar el ID raíz (si tiene padre, ese es la raíz; si no, él mismo es la raíz)
    const raizId = docActual.documento_padre_id || docActual.id

    // 3. Obtener TODAS las versiones: la raíz + todas sus hijas
    // ✅ FILTRAR versiones eliminadas
    const { data, error } = await supabase
      .from('documentos_cliente')
      .select('*')
      .or(`id.eq.${raizId},documento_padre_id.eq.${raizId}`)
      .neq('estado', 'eliminado') // 🆕 No mostrar versiones eliminadas
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
   * @deprecated Esta función ya no se usa. La cédula se obtiene de clientes.documento_identidad_url
   * Verificar si el cliente tiene cédula activa (requerido para negociaciones)
   */
  static async tieneCedulaActiva(clienteId: string): Promise<boolean> {
    // La cédula ahora se almacena en clientes.documento_identidad_url
    // Ya no se usa documentos_cliente para esto
    return false
  }

  /**
   * @deprecated Esta función ya no se usa. La cédula se obtiene de clientes.documento_identidad_url
   * Obtener documento de identidad del cliente
   */
  static async obtenerCedula(
    clienteId: string
  ): Promise<DocumentoCliente | null> {
    // La cédula ahora se almacena en clientes.documento_identidad_url
    // Ya no se usa documentos_cliente para esto
    return null
  }

  /**
   * Actualizar categoría de un documento
   */
  static async actualizarCategoria(
    documentoId: string,
    categoriaId: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from('documentos_cliente')
      .update({
        categoria_id: categoriaId,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', documentoId)

    if (error) throw error
  }

  /**
   * ✅ NUEVO: Obtener estado del proceso de un documento
   * Verifica si el documento fue subido desde un proceso y retorna el estado del paso
   */
  static async obtenerEstadoProceso(documentoId: string): Promise<{
    esDeProceso: boolean
    estadoPaso?: 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido'
    nombrePaso?: string
  }> {
    try {
      // 1. Obtener el documento
      const { data: documento, error: docError } = await supabase
        .from('documentos_cliente')
        .select('descripcion, etiquetas')
        .eq('id', documentoId)
        .single()

      if (docError || !documento) {
        return { esDeProceso: false }
      }

      // 2. Verificar si es de proceso (tiene etiqueta 'Proceso')
      const esDeProceso = documento.etiquetas?.includes('Proceso') || false
      if (!esDeProceso) {
        return { esDeProceso: false }
      }

      // 3. Extraer nombre del paso desde la descripción
      // Formato: "Subido desde proceso - Paso: Nombre del Paso"
      const match = documento.descripcion?.match(/Paso: (.+)$/)
      const nombrePaso = match?.[1]

      if (!nombrePaso) {
        return { esDeProceso: true }
      }

      // 4. Buscar el paso por nombre y obtener su estado
      const { data: paso, error: pasoError } = await supabase
        .from('procesos_negociacion')
        .select('estado')
        .eq('nombre', nombrePaso)
        .order('fecha_creacion', { ascending: false })
        .limit(1)
        .single()

      if (pasoError || !paso) {
        return { esDeProceso: true, nombrePaso }
      }

      return {
        esDeProceso: true,
        estadoPaso: paso.estado as 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido',
        nombrePaso
      }
    } catch (error) {
      console.error('Error al obtener estado de proceso:', error)
      return { esDeProceso: false }
    }
  }
}
