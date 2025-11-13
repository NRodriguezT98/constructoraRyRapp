// ============================================
// SERVICE: Gestión de Documentos de Proyecto
// ============================================

import { supabase } from '@/lib/supabase/client'

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
      .select(`
        *,
        usuario:usuarios!fk_documentos_proyecto_subido_por (
          nombres,
          apellidos,
          email
        )
      `)
      .eq('proyecto_id', proyectoId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)  // ✅ SOLO mostrar versión actual
      .order('es_importante', { ascending: false }) // Importantes primero
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
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
      .select(`
        *,
        usuario:usuarios!fk_documentos_proyecto_subido_por (
          nombres,
          apellidos,
          email
        )
      `)
      .eq('proyecto_id', proyectoId)
      .eq('categoria_id', categoriaId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)  // ✅ SOLO mostrar versión actual
      .order('version', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * Obtener documentos próximos a vencer
   */
  static async obtenerDocumentosProximosAVencer(
    diasAntes = 30
  ): Promise<DocumentoProyecto[]> {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + diasAntes)

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
      .eq('estado', 'activo')
      .eq('es_version_actual', true)  // ✅ SOLO mostrar versión actual
      .not('fecha_vencimiento', 'is', null)
      .lte('fecha_vencimiento', fechaLimite.toISOString())
      .order('fecha_vencimiento', { ascending: true })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
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

    return documento as unknown as DocumentoProyecto
  }

  /**
   * ✅ CREAR NUEVA VERSIÓN de un documento existente
   *
   * @param documentoIdOriginal - ID del documento del cual crear nueva versión
   * @param archivo - Archivo nuevo a subir
   * @param userId - ID del usuario que sube
   * @param cambios - Descripción de cambios (opcional)
   * @param tituloOverride - Título personalizado (opcional, por defecto usa nombre del archivo)
   * @param fechaDocumento - Nueva fecha del documento (opcional)
   * @param fechaVencimiento - Nueva fecha de vencimiento (opcional)
   */
  static async crearNuevaVersion(
    documentoIdOriginal: string,
    archivo: File,
    userId: string,
    cambios?: string,
    tituloOverride?: string,
    fechaDocumento?: string,
    fechaVencimiento?: string
  ): Promise<DocumentoProyecto> {
    console.log('📤 Creando nueva versión del documento:', documentoIdOriginal)

    // 1. Obtener documento original
    const { data: docOriginal, error: fetchError } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('id', documentoIdOriginal)
      .single()

    if (fetchError) throw fetchError

    // Extraer título del nombre del archivo (sin extensión)
    const tituloDelArchivo = archivo.name.replace(/\.[^/.]+$/, '')
    const tituloFinal = tituloOverride || tituloDelArchivo

    console.log('📝 Título de nueva versión:', tituloFinal)

    // 2. Encontrar el documento padre (la versión 1)
    const documentoPadreId = docOriginal.documento_padre_id || documentoIdOriginal

    // 3. Obtener la versión más alta actual
    const { data: versiones } = await supabase
      .from('documentos_proyecto')
      .select('version')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .order('version', { ascending: false })
      .limit(1)

    const nuevaVersion = (versiones?.[0]?.version || 0) + 1

    // 4. Marcar versiones anteriores como NO actuales
    await supabase
      .from('documentos_proyecto')
      .update({ es_version_actual: false })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    // 5. Subir nuevo archivo a Storage
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`
    const storagePath = `${userId}/${docOriginal.proyecto_id}/${nombreArchivo}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, archivo)

    if (uploadError) throw uploadError

    // 6. Crear nuevo registro de documento
    const { data: nuevaVersionDoc, error: insertError } = await supabase
      .from('documentos_proyecto')
      .insert({
        proyecto_id: docOriginal.proyecto_id,
        categoria_id: docOriginal.categoria_id,
        titulo: tituloFinal,
        descripcion: cambios || docOriginal.descripcion,
        nombre_archivo: nombreArchivo,
        nombre_original: archivo.name,
        tamano_bytes: archivo.size,
        tipo_mime: archivo.type,
        url_storage: storagePath,
        etiquetas: docOriginal.etiquetas,
        version: nuevaVersion,
        es_version_actual: true,
        documento_padre_id: documentoPadreId,
        estado: 'activo',
        metadata: {
          ...(typeof docOriginal.metadata === 'object' && docOriginal.metadata !== null ? docOriginal.metadata : {}),
          cambios,
          version_anterior_id: documentoIdOriginal
        },
        subido_por: userId,
        fecha_documento: fechaDocumento || docOriginal.fecha_documento,
        fecha_vencimiento: fechaVencimiento || docOriginal.fecha_vencimiento,
        es_importante: docOriginal.es_importante
      })
      .select(`
        *,
        usuario:usuarios!fk_documentos_proyecto_subido_por (
          nombres,
          apellidos,
          email
        )
      `)
      .single()

    if (insertError) {
      // Limpiar archivo si falla la BD
      await supabase.storage.from(BUCKET_NAME).remove([storagePath])
      throw insertError
    }

    console.log(`✅ Nueva versión ${nuevaVersion} creada`)
    return nuevaVersionDoc as unknown as DocumentoProyecto
  }

  /**
   * ✅ OBTENER VERSIONES de un documento
   */
  static async obtenerVersiones(
    documentoId: string
  ): Promise<DocumentoProyecto[]> {
    // Obtener documento para saber si es padre o hijo
    const { data: doc } = await supabase
      .from('documentos_proyecto')
      .select('documento_padre_id')
      .eq('id', documentoId)
      .single()

    const padreId = doc?.documento_padre_id || documentoId

    // Obtener todas las versiones (padre + hijas) SOLO ACTIVAS
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
      .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
      .eq('estado', 'activo') // ← 🔧 FIX: Solo versiones activas (no eliminadas)
      .order('version', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * ✅ RESTAURAR VERSIÓN anterior
   *
   * Descarga el archivo de la versión antigua y crea una nueva versión con ese contenido
   */
  static async restaurarVersion(
    versionId: string,
    userId: string,
    motivo: string
  ): Promise<DocumentoProyecto> {
    console.log('🔄 Restaurando versión:', versionId)

    // 1. Obtener la versión a restaurar
    const { data: versionAnterior, error: fetchError } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('id', versionId)
      .single()

    if (fetchError) throw fetchError

    console.log('📄 Versión a restaurar:', {
      id: versionAnterior.id,
      version: versionAnterior.version,
      url_storage: versionAnterior.url_storage
    })

    // 2. Validar que el documento esté en bucket correcto
    if (!versionAnterior.url_storage.includes('documentos-proyectos')) {
      throw new Error(
        'No se puede restaurar esta versión. El documento tiene datos inconsistentes. ' +
        'Por favor, contacta al administrador.'
      )
    }

    // 3. Descargar el archivo de esa versión
    const { data: archivoBlob, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(versionAnterior.url_storage)

    if (downloadError) {
      console.error('❌ Error al descargar archivo:', downloadError)
      throw new Error('No se pudo descargar el archivo de la versión anterior')
    }

    // 4. Convertir blob a File
    const archivo = new File(
      [archivoBlob],
      versionAnterior.nombre_original,
      { type: versionAnterior.tipo_mime }
    )

    // 5. Crear nueva versión con el contenido restaurado
    const documentoPadreId = versionAnterior.documento_padre_id || versionId
    const tituloRestaurado = versionAnterior.nombre_original.replace(/\.[^/.]+$/, '')

    const resultado = await this.crearNuevaVersion(
      documentoPadreId,
      archivo,
      userId,
      `[RESTAURACIÓN] ${motivo} - Restaurado desde versión ${versionAnterior.version}`,
      tituloRestaurado,
      versionAnterior.fecha_documento,
      versionAnterior.fecha_vencimiento
    )

    console.log(`✅ Versión ${versionAnterior.version} restaurada`)
    return resultado
  }

  /**
   * ✅ ELIMINAR VERSIÓN (soft delete, solo Admin)
   *
   * @param versionId - ID de la versión a eliminar
   * @param userId - ID del usuario
   * @param userRole - Rol del usuario (debe ser 'Administrador')
   * @param motivo - Justificación obligatoria (mínimo 20 caracteres)
   */
  static async eliminarVersion(
    versionId: string,
    userId: string,
    userRole: string,
    motivo: string
  ): Promise<void> {
    console.log('🗑️ [ADMIN] Eliminando versión:', versionId)

    // Validar rol de Administrador
    if (userRole !== 'Administrador') {
      throw new Error('❌ Solo Administradores pueden eliminar versiones')
    }

    // Validar motivo
    if (!motivo || motivo.trim().length < 20) {
      throw new Error('❌ Debe proporcionar un motivo detallado (mínimo 20 caracteres)')
    }

    // Obtener la versión a eliminar
    const { data: version, error: fetchError } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('id', versionId)
      .single()

    if (fetchError) throw fetchError
    if (!version) throw new Error('Versión no encontrada')

    // Verificar si es la versión actual
    if (version.es_version_actual) {
      // Contar versiones activas
      const padreId = version.documento_padre_id || versionId
      const { data: versionesActivas, error: countError } = await supabase
        .from('documentos_proyecto')
        .select('id')
        .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
        .eq('estado', 'activo')

      if (countError) throw countError

      if ((versionesActivas?.length || 0) <= 1) {
        throw new Error(
          '❌ No se puede eliminar la última versión activa. ' +
          'Usa "Eliminar Documento" en su lugar.'
        )
      }

      // Promover versión anterior a actual
      const { data: versionAnterior } = await supabase
        .from('documentos_proyecto')
        .select('id')
        .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
        .eq('estado', 'activo')
        .neq('id', versionId)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (versionAnterior) {
        await supabase
          .from('documentos_proyecto')
          .update({ es_version_actual: true })
          .eq('id', versionAnterior.id)
      }
    }

    // Marcar como eliminado (soft delete)
    const { error: updateError } = await supabase
      .from('documentos_proyecto')
      .update({
        estado: 'eliminado',
        metadata: {
          ...(typeof version.metadata === 'object' && version.metadata !== null ? version.metadata : {}),
          eliminado_por: userId,
          motivo_eliminacion: motivo,
          fecha_eliminacion: new Date().toISOString()
        }
      })
      .eq('id', versionId)

    if (updateError) throw updateError

    console.log('✅ Versión eliminada (soft delete)')
  }

  /**
   * Obtener URL de descarga con firma temporal
   */
  static async obtenerUrlDescarga(
    storagePath: string,
    expiresIn = 3600 // 1 hora por defecto
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
   *
   * LÓGICA: Elimina el documento Y TODAS SUS VERSIONES (toda la cadena)
   * Es un soft delete (estado='eliminado'), los archivos permanecen en Storage
   *
   * IMPORTANTE: Mantiene es_version_actual=true en la última versión para que aparezca en Papelera
   */
  static async eliminarDocumento(documentoId: string): Promise<void> {
    console.log('🗑️ Eliminando documento (soft delete):', documentoId)

    // 1. Obtener información del documento
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id, version, es_version_actual')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    // 2. Determinar el ID raíz (documento padre o el mismo si es v1)
    const documentoPadreId = documento.documento_padre_id || documentoId

    // 3. Obtener TODAS las versiones de esta cadena (activas)
    const { data: versiones, error: versionesError } = await supabase
      .from('documentos_proyecto')
      .select('id, version, es_version_actual')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .eq('estado', 'activo')
      .order('version', { ascending: false }) // Orden descendente para encontrar la última

    if (versionesError) throw versionesError

    console.log(`📊 Eliminando ${versiones?.length || 0} versiones activas`)

    if (versiones && versiones.length > 0) {
      // 4. Identificar la versión más alta (última versión)
      const versionMasAlta = versiones[0] // Ya está ordenado DESC

      // 5. Eliminar TODAS las versiones
      const idsAEliminar = versiones.map((v) => v.id)

      const { error: updateError } = await supabase
        .from('documentos_proyecto')
        .update({ estado: 'eliminado' })
        .in('id', idsAEliminar)

      if (updateError) throw updateError

      // 6. CRÍTICO: Asegurar que la versión más alta tenga es_version_actual=true
      // Esto permite que aparezca en la Papelera
      const { error: flagError } = await supabase
        .from('documentos_proyecto')
        .update({ es_version_actual: true })
        .eq('id', versionMasAlta.id)

      if (flagError) throw flagError

      console.log(`✅ ${versiones.length} versiones eliminadas correctamente`)
      console.log(`📌 Versión v${versionMasAlta.version} marcada como actual para Papelera`)
    } else {
      console.warn('⚠️ No se encontraron versiones activas para eliminar')
    }
  }

  /**
   * Contar versiones activas de un documento
   * (usado para validar eliminación desde card)
   */
  static async contarVersionesActivas(documentoId: string): Promise<{
    total: number
    versiones: Array<{ version: number; titulo: string }>
  }> {
    // 1. Obtener información del documento
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    // 2. Determinar el ID raíz
    const documentoPadreId = documento.documento_padre_id || documentoId

    // 3. Contar versiones activas
    const { data: versiones, error } = await supabase
      .from('documentos_proyecto')
      .select('version, titulo')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .eq('estado', 'activo')
      .order('version', { ascending: true })

    if (error) throw error

    return {
      total: versiones?.length || 0,
      versiones: versiones || [],
    }
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
    return data as unknown as DocumentoProyecto
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
    return (data || []) as unknown as DocumentoProyecto[]
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
    return (data || []) as unknown as DocumentoProyecto[]
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
    return (data || []) as unknown as DocumentoProyecto[]
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
    return data as unknown as DocumentoProyecto
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

  // ============================================
  // 🗑️ PAPELERA DE DOCUMENTOS
  // ============================================

  /**
   * Obtener documentos eliminados (soft delete)
   * Solo visible para Administradores
   *
   * LÓGICA: Muestra solo la versión actual de cada documento eliminado
   * Al restaurar, se restaura toda la cadena de versiones automáticamente
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
      .eq('es_version_actual', true) // ✅ Solo mostrar versión actual
      .order('fecha_actualizacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * Obtener SOLO las versiones ELIMINADAS de un documento
   * (para restauración selectiva en Papelera)
   *
   * IMPORTANTE: Solo muestra versiones con estado='eliminado'
   */
  static async obtenerVersionesEliminadas(documentoId: string): Promise<DocumentoProyecto[]> {
    // 1. Obtener información del documento
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    // 2. Determinar el ID raíz (documento padre o el mismo si es v1)
    const documentoPadreId = documento.documento_padre_id || documentoId

    // 3. Obtener SOLO versiones ELIMINADAS de esta cadena
    // IMPORTANTE: Usar FK correcta para JOIN con usuarios
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

    console.log('🔍 [SERVICE] obtenerVersionesEliminadas:', {
      documentoId,
      documentoPadreId,
      totalVersiones: data?.length || 0,
      versionesEliminadas: data?.map(v => `v${v.version} (${v.estado})`),
      versiones: data
    })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * Restaurar versiones específicas de un documento
   * (permite restauración selectiva desde Papelera)
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
   * Restaurar documento eliminado (cambia estado a 'activo')
   *
   * LÓGICA DE RESTAURACIÓN:
   * 1. Si es una versión antigua (es_version_actual=false) → Restaurar toda la cadena
   * 2. Si es la versión actual → Restaurar el documento y sus versiones históricas
   * 3. Mantener la estructura de versionado intacta
   */
  static async restaurarDocumentoEliminado(documentoId: string): Promise<void> {
    // 1. Obtener información del documento
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    // 2. Determinar qué documentos restaurar
    let documentosARestaurar: string[] = []

    if (documento.documento_padre_id) {
      // Es una versión (tiene padre) → Restaurar toda la cadena
      // Obtener el documento padre (versión 1)
      const { data: padre } = await supabase
        .from('documentos_proyecto')
        .select('id')
        .eq('id', documento.documento_padre_id)
        .single()

      if (padre) {
        // Obtener todas las versiones de esta cadena
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
      // Es un documento independiente o la versión 1 de una cadena
      // Restaurar este documento y todas sus versiones
      const { data: versiones } = await supabase
        .from('documentos_proyecto')
        .select('id')
        .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        documentosARestaurar = versiones.map((v) => v.id)
      }
    }

    // 3. Restaurar todos los documentos identificados
    if (documentosARestaurar.length > 0) {
      const { error: updateError } = await supabase
        .from('documentos_proyecto')
        .update({
          estado: 'activo',
          // fecha_actualizacion se actualiza automáticamente con trigger
        })
        .in('id', documentosARestaurar)

      if (updateError) throw updateError
    } else {
      // Fallback: restaurar solo el documento solicitado
      const { error } = await supabase
        .from('documentos_proyecto')
        .update({
          estado: 'activo',
        })
        .eq('id', documentoId)

      if (error) throw error
    }
  }

  /**
   * Eliminar definitivamente documento (DELETE físico de BD + Storage)
   *
   * LÓGICA: Elimina el documento y TODAS sus versiones (toda la cadena)
   * ADVERTENCIA: Esta acción NO es reversible
   */
  static async eliminarDefinitivo(documentoId: string): Promise<void> {
    // 1. Obtener información del documento
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    // 2. Determinar qué documentos eliminar (toda la cadena de versiones)
    let documentosAEliminar: string[] = []

    if (documento.documento_padre_id) {
      // Es una versión (tiene padre) → Eliminar toda la cadena
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
              await supabase.storage
                .from(BUCKET_NAME)
                .remove([version.url_storage])
            } catch (err) {
              console.warn('⚠️ Error al eliminar archivo de Storage:', err)
            }
          }

          documentosAEliminar = versiones.map((v) => v.id)
        }
      }
    } else {
      // Es documento independiente o versión 1 → Eliminar este y todas sus versiones
      const { data: versiones } = await supabase
        .from('documentos_proyecto')
        .select('id, url_storage')
        .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        // Eliminar archivos de Storage
        for (const version of versiones) {
          try {
            await supabase.storage
              .from(BUCKET_NAME)
              .remove([version.url_storage])
          } catch (err) {
            console.warn('⚠️ Error al eliminar archivo de Storage:', err)
          }
        }

        documentosAEliminar = versiones.map((v) => v.id)
      }
    }

    // 3. Eliminar registros de BD (DELETE físico)
    if (documentosAEliminar.length > 0) {
      const { error: deleteError } = await supabase
        .from('documentos_proyecto')
        .delete()
        .in('id', documentosAEliminar)

      if (deleteError) throw deleteError
    }
  }
}
