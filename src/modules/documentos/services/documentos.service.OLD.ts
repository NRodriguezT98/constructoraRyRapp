// ============================================
// SERVICE: Gestión de Documentos de Proyecto
// ============================================

import { supabase } from '@/lib/supabase/client'
import { auditService } from '@/services/audit.service'

import type { DocumentoProyecto } from '../types/documento.types'

const BUCKET_NAME = 'documentos-proyectos'

interface SubirDocumentoParams {
  proyecto_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  archivo: File
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
      fecha_documento,
      fecha_vencimiento,
      es_importante,
      metadata,
    } = params

    // 1. Obtener nombre de categoría para organizar archivos
    let categoriaNombre = 'general'
    if (categoria_id) {
      const { data: categoria } = await supabase
        .from('categorias_documento')
        .select('nombre')
        .eq('id', categoria_id)
        .single()

      if (categoria?.nombre) {
        categoriaNombre = categoria.nombre.toLowerCase().replace(/\s+/g, '-')
      }
    }

    // 2. Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`

    // 3. Construir path en storage: {proyecto_id}/{categoria}/{filename}
    const storagePath = `${proyecto_id}/${categoriaNombre}/${nombreArchivo}`

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
        subido_por: userId,
        fecha_documento: fecha_documento || null,
        fecha_vencimiento: fecha_vencimiento || null,
        es_importante: es_importante || false,
        metadata: metadata || {},
        version: 1,
        es_version_actual: true,
        estado: 'activo',
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

    // 5. Obtener nombre de categoría para organizar archivos
    let categoriaNombre = 'general'
    if (docOriginal.categoria_id) {
      const { data: categoria } = await supabase
        .from('categorias_documento')
        .select('nombre')
        .eq('id', docOriginal.categoria_id)
        .single()

      if (categoria?.nombre) {
        categoriaNombre = categoria.nombre.toLowerCase().replace(/\s+/g, '-')
      }
    }

    // 6. Subir nuevo archivo a Storage
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`
    const storagePath = `${docOriginal.proyecto_id}/${categoriaNombre}/${nombreArchivo}`

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
   * ✅ ARCHIVAR documento COMPLETO (todas las versiones)
   * Archiva el documento padre y TODAS sus versiones
   * Para auditoría: mantener integridad del historial completo
   */
  static async archivarDocumento(documentoId: string): Promise<void> {
    // 1. Obtener información del documento
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    // 2. Determinar el ID raíz (documento padre)
    const documentoPadreId = documento.documento_padre_id || documentoId

    // 3. Archivar TODAS las versiones (padre + versiones)
    const { error } = await supabase
      .from('documentos_proyecto')
      .update({ estado: 'archivado' })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    if (error) throw error
  }

  /**
   * ✅ RESTAURAR documento COMPLETO (todas las versiones)
   * Restaura el documento padre y TODAS sus versiones
   */
  static async restaurarDocumento(documentoId: string): Promise<void> {
    // 1. Obtener información del documento
    const { data: documento, error: getError } = await supabase
      .from('documentos_proyecto')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    // 2. Determinar el ID raíz (documento padre)
    const documentoPadreId = documento.documento_padre_id || documentoId

    // 3. Restaurar TODAS las versiones (padre + versiones)
    const { error } = await supabase
      .from('documentos_proyecto')
      .update({ estado: 'activo' })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    if (error) throw error
  }

  /**
   * ✅ OBTENER documentos archivados de un proyecto
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
      .eq('es_version_actual', true)  // ✅ SOLO mostrar versión actual
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
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

  // ============================================================================
  // SISTEMA DE ESTADOS DE VERSIÓN - PROFESIONAL
  // ============================================================================

  /**
   * Marcar una versión como errónea
   * @param documentoId - ID de la versión a marcar como errónea
   * @param motivo - Motivo por el cual es errónea
   * @param versionCorrectaId - (Opcional) ID de la versión que corrige este error
   */
  static async marcarVersionComoErronea(
    documentoId: string,
    motivo: string,
    versionCorrectaId?: string
  ): Promise<void> {
    console.log('🚨 Marcando versión como errónea:', {
      documentoId,
      motivo,
      versionCorrectaId,
    })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_proyecto')
      .select('id, titulo, version, estado_version')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      console.error('❌ Error detallado al buscar documento:', {
        documentoId,
        error: fetchError,
        errorMessage: fetchError?.message,
        errorDetails: fetchError?.details,
        errorHint: fetchError?.hint,
        errorCode: fetchError?.code,
      })
      throw new Error(`Documento no encontrado: ${fetchError?.message || 'ID inválido'}`)
    }

    // 2. Validar que la versión correcta existe (si se proporciona)
    if (versionCorrectaId) {
      const { data: versionCorrecta, error: correctaError } = await supabase
        .from('documentos_proyecto')
        .select('id, titulo, version')
        .eq('id', versionCorrectaId)
        .single()

      if (correctaError || !versionCorrecta) {
        throw new Error('La versión correcta especificada no existe')
      }

      console.log('✓ Versión correcta validada:', {
        id: versionCorrecta.id,
        titulo: versionCorrecta.titulo,
        version: versionCorrecta.version,
      })
    }

    // 3. Actualizar estado de la versión
    const { error: updateError } = await supabase
      .from('documentos_proyecto')
      .update({
        estado_version: 'erronea',
        motivo_estado: motivo,
        version_corrige_a: versionCorrectaId || null,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', documentoId)

    if (updateError) {
      console.error('❌ Error al marcar versión como errónea:', updateError)
      throw new Error(`Error al actualizar estado: ${updateError.message}`)
    }

    // 4. Si hay versión correcta, vincularla
    if (versionCorrectaId) {
      const { error: linkError } = await supabase
        .from('documentos_proyecto')
        .update({
          metadata: {
            corrige_version_erronea: documentoId,
            fecha_correccion: new Date().toISOString(),
          },
        })
        .eq('id', versionCorrectaId)

      if (linkError) {
        console.warn('⚠️ No se pudo vincular versión correcta:', linkError)
      }
    }

    console.log('✅ Versión marcada como errónea:', {
      documentoId,
      titulo: documento.titulo,
      version: documento.version,
      motivo,
    })

    // 5. 📋 REGISTRAR EN AUDITORÍA
    try {
      console.log('🔍 Iniciando registro de auditoría para versión errónea...')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log('👤 Usuario obtenido:', user?.email)

      // Obtener información completa del documento
      const { data: docCompleto } = await supabase
        .from('documentos_proyecto')
        .select('*, categorias_documento(nombre)')
        .eq('id', documentoId)
        .single()

      console.log('📄 Documento completo obtenido:', docCompleto?.titulo)

      await auditService.registrarAccion({
        tabla: 'documentos_proyecto',
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

          // 📄 Información del documento
          documento: {
            id: documentoId,
            titulo: docCompleto?.titulo,
            version: docCompleto?.version,
            categoria: docCompleto?.categorias_documento?.nombre || 'Sin categoría',
            estado_anterior: documento.estado_version || 'valida',
            estado_nuevo: 'erronea',
            es_version_actual: docCompleto?.es_version_actual,
          },

          // 🔗 Versión correcta (si aplica)
          version_correcta: versionCorrectaId
            ? {
                id: versionCorrectaId,
                titulo: null, // Se podría cargar si es necesario
                vinculacion: 'Esta versión errónea es corregida por la versión indicada',
              }
            : null,

          // ⏱️ Timestamp
          fecha_marcado: new Date().toISOString(),

          // 👤 Usuario
          usuario: {
            usuario_id: user?.id || 'desconocido',
            email: user?.email || 'desconocido',
          },

          // 🏗️ Contexto
          contexto: {
            proyecto_id: docCompleto?.proyecto_id,
            tipo_archivo: docCompleto?.tipo_mime,
            tamano_bytes: docCompleto?.tamano_bytes,
          },
        },
        modulo: 'documentos',
      })

      console.log('✅ Auditoría registrada para marcado de versión errónea')
    } catch (auditError) {
      console.error('❌ ERROR COMPLETO al registrar auditoría:', auditError)
      console.error('❌ Stack trace:', (auditError as Error).stack)
      console.error('❌ Mensaje:', (auditError as Error).message)
    }
  }

  /**
   * Marcar una versión como obsoleta
   * @param documentoId - ID de la versión a marcar como obsoleta
   * @param motivo - Motivo por el cual quedó obsoleta
   */
  static async marcarVersionComoObsoleta(
    documentoId: string,
    motivo: string
  ): Promise<void> {
    console.log('📦 Marcando versión como obsoleta:', { documentoId, motivo })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_proyecto')
      .select('id, titulo, version, estado_version')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      console.error('❌ Error detallado al buscar documento:', {
        documentoId,
        error: fetchError,
        errorMessage: fetchError?.message,
        errorDetails: fetchError?.details,
        errorHint: fetchError?.hint,
        errorCode: fetchError?.code,
      })
      throw new Error(`Documento no encontrado: ${fetchError?.message || 'ID inválido'}`)
    }

    // 2. Actualizar estado
    const { error: updateError } = await supabase
      .from('documentos_proyecto')
      .update({
        estado_version: 'obsoleta',
        motivo_estado: motivo,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', documentoId)

    if (updateError) {
      console.error('❌ Error al marcar versión como obsoleta:', updateError)
      throw new Error(`Error al actualizar estado: ${updateError.message}`)
    }

    console.log('✅ Versión marcada como obsoleta:', {
      documentoId,
      titulo: documento.titulo,
      version: documento.version,
      motivo,
    })

    // 3. 📋 REGISTRAR EN AUDITORÍA
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: docCompleto } = await supabase
        .from('documentos_proyecto')
        .select('*, categorias_documento(nombre)')
        .eq('id', documentoId)
        .single()

      await auditService.registrarAccion({
        tabla: 'documentos_proyecto',
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
            categoria: docCompleto?.categorias_documento?.nombre || 'Sin categoría',
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
            proyecto_id: docCompleto?.proyecto_id,
            tipo_archivo: docCompleto?.tipo_mime,
          },
        },
        modulo: 'documentos',
      })

      console.log('✅ Auditoría registrada para marcado de versión obsoleta')
    } catch (auditError) {
      console.error('⚠️ Error al registrar auditoría (no crítico):', auditError)
    }
  }

  /**
   * Restaurar estado de una versión a "valida"
   * @param documentoId - ID de la versión a restaurar
   */
  static async restaurarEstadoVersion(documentoId: string): Promise<void> {
    console.log('♻️ Restaurando estado de versión:', { documentoId })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_proyecto')
      .select('id, titulo, version, estado_version, motivo_estado')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      console.error('❌ Error detallado al buscar documento:', {
        documentoId,
        error: fetchError,
        errorMessage: fetchError?.message,
        errorDetails: fetchError?.details,
        errorHint: fetchError?.hint,
        errorCode: fetchError?.code,
      })
      throw new Error(`Documento no encontrado: ${fetchError?.message || 'ID inválido'}`)
    }

    // 2. Restaurar a estado válido
    const { error: updateError } = await supabase
      .from('documentos_proyecto')
      .update({
        estado_version: 'valida',
        motivo_estado: null,
        version_corrige_a: null,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', documentoId)

    if (updateError) {
      console.error('❌ Error al restaurar estado:', updateError)
      throw new Error(`Error al restaurar estado: ${updateError.message}`)
    }

    console.log('✅ Estado restaurado a "valida":', {
      documentoId,
      titulo: documento.titulo,
      version: documento.version,
      estadoAnterior: documento.estado_version,
    })

    // 3. 📋 REGISTRAR EN AUDITORÍA
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: docCompleto } = await supabase
        .from('documentos_proyecto')
        .select('*, categorias_documento(nombre)')
        .eq('id', documentoId)
        .single()

      await auditService.registrarAccion({
        tabla: 'documentos_proyecto',
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
            categoria: docCompleto?.categorias_documento?.nombre || 'Sin categoría',
            estado_anterior: documento.estado_version,
            estado_nuevo: 'valida',
            motivo_anterior: documento.motivo_estado,
            es_version_actual: docCompleto?.es_version_actual,
          },

          restauracion: {
            desde_estado: documento.estado_version,
            motivo_original: documento.motivo_estado,
            fecha_restauracion: new Date().toISOString(),
            razon: 'Restauración manual de estado a válido',
          },

          usuario: {
            usuario_id: user?.id || 'desconocido',
            email: user?.email || 'desconocido',
          },

          contexto: {
            proyecto_id: docCompleto?.proyecto_id,
            tipo_archivo: docCompleto?.tipo_mime,
          },
        },
        modulo: 'documentos',
      })

      console.log('✅ Auditoría registrada para restauración de estado')
    } catch (auditError) {
      console.error('⚠️ Error al registrar auditoría (no crítico):', auditError)
    }
  }

  /**
   * Reemplazar archivo de documento existente (Admin Only, 48h máximo)
   * Crea backup automático y valida tiempo desde creación
   * @param documentoId - ID del documento a reemplazar
   * @param nuevoArchivo - Nuevo archivo
   * @param motivo - Justificación del reemplazo
   */
  static async reemplazarArchivoSeguro(
    documentoId: string,
    nuevoArchivo: File,
    motivo: string,
    password: string
  ): Promise<void> {
    console.log('🔄 Iniciando reemplazo seguro de archivo:', {
      documentoId,
      nuevoArchivo: nuevoArchivo.name,
      tamano: nuevoArchivo.size,
      motivo,
    })

    // 1. Verificar usuario y validar contraseña de admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    // Verificar que es administrador
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (usuarioError || !usuario) {
      throw new Error('No se pudo verificar el usuario')
    }

    if (usuario.rol !== 'Administrador') {
      throw new Error('Solo administradores pueden reemplazar archivos')
    }

    // Validar contraseña usando función RPC
    const { data: passwordValid, error: passwordError } = await supabase.rpc(
      'validar_password_admin',
      {
        p_user_id: user.id,
        p_password: password,
      }
    )

    if (passwordError) {
      console.error('Error validando password:', passwordError)
      throw new Error('Error al validar contraseña')
    }

    if (!passwordValid) {
      throw new Error('Contraseña incorrecta')
    }

    console.log('✅ Validación de contraseña de admin exitosa')

    // 2. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      throw new Error('Documento no encontrado')
    }

    // 3. Validar ventana de 48 horas
    const fechaCreacion = new Date(documento.fecha_creacion)
    const ahora = new Date()
    const horasTranscurridas =
      (ahora.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60)

    if (horasTranscurridas > 48) {
      throw new Error(
        `No se puede reemplazar archivo después de 48 horas. Han transcurrido ${Math.floor(horasTranscurridas)} horas.`
      )
    }

    console.log('✓ Validación de 48 horas OK:', {
      fechaCreacion: fechaCreacion.toISOString(),
      horasTranscurridas: Math.floor(horasTranscurridas),
    })

    // 4. Crear backup del archivo original
    const backupPath = `${documento.proyecto_id}/backups/reemplazos/${documentoId}_backup_${Date.now()}_${documento.nombre_archivo}`

    // Copiar archivo original a backup
    // url_storage ya contiene el path relativo (ej: "proyecto-id/categoria/archivo.pdf")
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(documento.url_storage)

    if (downloadError) {
      console.error('❌ Error al descargar archivo original:', downloadError)
      throw new Error(`Error al descargar archivo original: ${downloadError.message}`)
    }

    console.log('✅ Archivo original descargado para backup')

    const { error: backupError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(backupPath, downloadData, {
        contentType: documento.tipo_mime,
        upsert: false,
      })

    if (backupError) {
      console.error('❌ Error al crear backup:', backupError)
      throw new Error(`Error al crear backup: ${backupError.message}`)
    }

    console.log('✅ Backup creado:', backupPath)

    // 5. Reemplazar archivo original
    const { error: replaceError } = await supabase.storage
      .from(BUCKET_NAME)
      .update(documento.url_storage, nuevoArchivo, {
        contentType: nuevoArchivo.type,
        upsert: true,
      })

    if (replaceError) {
      console.error('❌ Error al reemplazar archivo:', replaceError)
      throw new Error(`Error al reemplazar archivo: ${replaceError.message}`)
    }

    console.log('✅ Archivo reemplazado exitosamente en storage')

    // 6. Actualizar metadata con información del reemplazo
    const metadataReemplazo = {
      ...(documento.metadata || {}),
      reemplazo: {
        fecha: new Date().toISOString(),
        motivo,
        archivo_original: documento.nombre_archivo,
        archivo_nuevo: nuevoArchivo.name,
        tamano_original: documento.tamano_bytes,
        tamano_nuevo: nuevoArchivo.size,
        backup_path: backupPath,
      },
    }

    const { error: updateError } = await supabase
      .from('documentos_proyecto')
      .update({
        nombre_archivo: nuevoArchivo.name,
        nombre_original: nuevoArchivo.name,
        tamano_bytes: nuevoArchivo.size,
        tipo_mime: nuevoArchivo.type,
        metadata: metadataReemplazo,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', documentoId)

    if (updateError) {
      console.error('❌ Error al actualizar metadata:', updateError)
      throw new Error(`Error al actualizar metadata: ${updateError.message}`)
    }

    console.log('✅ Archivo reemplazado exitosamente:', {
      documentoId,
      archivoAnterior: documento.nombre_archivo,
      archivoNuevo: nuevoArchivo.name,
      backupCreado: backupPath,
      motivo,
    })

    // 7. 📋 REGISTRAR EN AUDITORÍA con información ULTRA detallada
    try {
      // Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Obtener URL de descarga del archivo original (backup)
      const { data: backupUrlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(backupPath, 31536000) // 1 año de validez

      // Obtener URL del nuevo archivo (mismo path que el original, pero con contenido nuevo)
      const { data: nuevoUrlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(documento.url_storage, 31536000)

      await auditService.registrarAccion({
        tabla: 'documentos_proyecto',
        accion: 'UPDATE',
        registroId: documentoId,
        datosAnteriores: {
          nombre_archivo: documento.nombre_archivo,
          nombre_original: documento.nombre_original,
          tamano_bytes: documento.tamano_bytes,
          tipo_mime: documento.tipo_mime,
          url_storage: documento.url_storage,
          fecha_actualizacion: documento.fecha_actualizacion,
        },
        datosNuevos: {
          nombre_archivo: nuevoArchivo.name,
          nombre_original: nuevoArchivo.name,
          tamano_bytes: nuevoArchivo.size,
          tipo_mime: nuevoArchivo.type,
          url_storage: documento.url_storage, // Mismo path, diferente contenido
          fecha_actualizacion: new Date().toISOString(),
        },
        metadata: {
          tipo_operacion: 'REEMPLAZO_ARCHIVO',
          motivo_reemplazo: motivo,

          // 📁 Información del archivo ORIGINAL (reemplazado)
          archivo_original: {
            nombre: documento.nombre_archivo,
            tamano_bytes: documento.tamano_bytes,
            tamano_mb: (documento.tamano_bytes / (1024 * 1024)).toFixed(2),
            tipo_mime: documento.tipo_mime,
            url_backup: backupUrlData?.signedUrl || null,
            backup_path: backupPath,
          },

          // 📁 Información del archivo NUEVO
          archivo_nuevo: {
            nombre: nuevoArchivo.name,
            tamano_bytes: nuevoArchivo.size,
            tamano_mb: (nuevoArchivo.size / (1024 * 1024)).toFixed(2),
            tipo_mime: nuevoArchivo.type,
            url_actual: nuevoUrlData?.signedUrl || null,
          },

          // ⏱️ Información de tiempo
          tiempo: {
            fecha_creacion_documento: documento.fecha_creacion,
            fecha_reemplazo: new Date().toISOString(),
            horas_transcurridas: Math.floor(horasTranscurridas),
            ventana_48h_cumplida: horasTranscurridas <= 48,
          },

          // 📊 Comparación de tamaños
          comparacion: {
            diferencia_bytes: nuevoArchivo.size - documento.tamano_bytes,
            diferencia_mb: (
              (nuevoArchivo.size - documento.tamano_bytes) /
              (1024 * 1024)
            ).toFixed(2),
            porcentaje_cambio: (
              ((nuevoArchivo.size - documento.tamano_bytes) /
                documento.tamano_bytes) *
              100
            ).toFixed(2),
          },

          // 🏗️ Contexto del documento
          contexto: {
            proyecto_id: documento.proyecto_id,
            categoria_id: documento.categoria_id,
            titulo: documento.titulo,
            version: documento.version,
            es_version_actual: documento.es_version_actual,
            estado_version: documento.estado_version || 'valida',
          },

          // 👤 Usuario que realizó el reemplazo
          usuario_reemplazo: {
            usuario_id: user?.id || 'desconocido',
            email: user?.email || 'desconocido',
            timestamp: new Date().toISOString(),
          },
        },
        modulo: 'documentos',
      })

      console.log('✅ Auditoría registrada para reemplazo de archivo')
    } catch (auditError) {
      // No fallar el reemplazo si falla la auditoría, solo loguear
      console.error('⚠️ Error al registrar auditoría (no crítico):', auditError)
    }
  }
}

// Exportar instancia singleton
export const documentosService = new DocumentosService()
