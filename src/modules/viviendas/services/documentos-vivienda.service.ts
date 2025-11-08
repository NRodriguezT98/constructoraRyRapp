/**
 * @file documentos-vivienda.service.ts
 * @description Servicio para gestión de documentos de viviendas
 * @module viviendas/services
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Json = Database['public']['Tables']['documentos_vivienda']['Row']['metadata']

export interface DocumentoVivienda {
  id: string
  vivienda_id: string
  categoria_id: string | null
  carpeta_id: string | null
  titulo: string
  descripcion: string | null
  nombre_archivo: string
  nombre_original: string
  tamano_bytes: number
  tipo_mime: string
  url_storage: string
  etiquetas: string[] | null
  version: number
  es_version_actual: boolean
  documento_padre_id: string | null
  estado: string
  metadata: Json
  subido_por: string
  fecha_documento: string | null
  fecha_vencimiento: string | null
  es_importante: boolean
  fecha_creacion: string
  fecha_actualizacion: string
  categoria?: {
    id: string
    nombre: string
    color: string
    icono: string
    es_sistema: boolean
  }
  usuario?: {
    nombres: string
    apellidos: string
    email: string
  }
}

export interface SubirDocumentoParams {
  viviendaId: string
  archivo: File
  categoriaNombre?: string
  titulo?: string
  descripcion?: string
  etiquetas?: string[]
  esImportante?: boolean
  fechaDocumento?: string
  fechaVencimiento?: string
}

export interface ActualizarDocumentoParams {
  id: string
  titulo?: string
  descripcion?: string
  categoria_id?: string | null
  etiquetas?: string[]
  es_importante?: boolean
  fecha_vencimiento?: string
}

export class DocumentosViviendaService {
  private supabase = createClient()
  private BUCKET_NAME = 'documentos-viviendas'

  /**
   * Obtener todos los documentos de una vivienda
   */
  async obtenerDocumentos(viviendaId: string): Promise<DocumentoVivienda[]> {
    const { data, error } = await this.supabase
      .from('documentos_vivienda')
      .select(`
        *,
        categoria:categorias_documento(
          id,
          nombre,
          color,
          icono,
          es_sistema
        )
      `)
      .eq('vivienda_id', viviendaId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener documentos:', error)
      throw new Error(`Error al cargar documentos: ${error.message}`)
    }

    // Obtener información de usuarios
    if (data && data.length > 0) {
      const usuariosIds = [...new Set(data.map(doc => doc.subido_por).filter(Boolean))]

      if (usuariosIds.length > 0) {
        const { data: usuarios } = await this.supabase
          .from('usuarios')
          .select('id, email, nombres, apellidos')
          .in('email', usuariosIds)

        // Mapear usuarios a documentos
        const usuariosMap = new Map(
          usuarios?.map(u => [u.email, u]) || []
        )

        return data.map(doc => ({
          ...doc,
          usuario: usuariosMap.get(doc.subido_por) || undefined
        })) as unknown as DocumentoVivienda[]
      }
    }

    return data as unknown as DocumentoVivienda[]
  }

  /**
   * Obtener categoría de sistema por nombre
   */
  private async obtenerCategoriaSistema(
    nombre: string
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('categorias_documento')
      .select('id')
      .eq('nombre', nombre)
      .contains('modulos_permitidos', ['viviendas'])
      .eq('es_sistema', true)
      .single()

    if (error) {
      console.warn(`⚠️ Categoría "${nombre}" no encontrada:`, error.message)
      return null
    }

    return data?.id || null
  }

  /**
   * Subir documento a Storage y crear registro en BD
   */
  async subirDocumento(params: SubirDocumentoParams): Promise<DocumentoVivienda> {
    const {
      viviendaId,
      archivo,
      categoriaNombre,
      titulo,
      descripcion,
      etiquetas,
      esImportante = false,
      fechaDocumento,
      fechaVencimiento,
    } = params

    try {
      // 1. Obtener categoría si se especifica
      let categoriaId: string | null = null

      if (categoriaNombre) {
        categoriaId = await this.obtenerCategoriaSistema(categoriaNombre)

        if (!categoriaId) {
          throw new Error(
            `Categoría "${categoriaNombre}" no encontrada. Verifique que esté creada en el sistema.`
          )
        }
      }

      // 2. Obtener usuario actual
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('Usuario no autenticado')
      }

      // 3. Subir archivo a Storage
      const timestamp = Date.now()
      const extension = archivo.name.split('.').pop()
      const nombreLimpio = archivo.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `${timestamp}_${nombreLimpio}.${extension}`
      const filePath = `${viviendaId}/${fileName}`

      const { data: uploadData, error: uploadError } =
        await this.supabase.storage
          .from(this.BUCKET_NAME)
          .upload(filePath, archivo, {
            cacheControl: '3600',
            upsert: false,
          })

      if (uploadError) {
        console.error('❌ Error al subir archivo a Storage:', uploadError)
        throw new Error(`Error al subir archivo: ${uploadError.message}`)
      }

      // 4. Obtener URL pública
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(this.BUCKET_NAME).getPublicUrl(uploadData.path)

      // 5. Crear registro en BD
      const { data: documento, error: dbError } = await this.supabase
        .from('documentos_vivienda')
        .insert({
          vivienda_id: viviendaId,
          categoria_id: categoriaId,
          titulo: titulo || archivo.name,
          descripcion: descripcion || null,
          nombre_archivo: fileName,
          nombre_original: archivo.name,
          tamano_bytes: archivo.size,
          tipo_mime: archivo.type,
          url_storage: publicUrl,
          etiquetas: etiquetas || null,
          subido_por: user.email || 'Sistema',
          es_importante: esImportante,
          fecha_documento: fechaDocumento || null,
          fecha_vencimiento: fechaVencimiento || null,
          metadata: {
            uploaded_at: new Date().toISOString(),
            user_id: user.id,
          },
        })
        .select(
          `
          *,
          categoria:categorias_documento(id, nombre, color, icono, es_sistema)
        `
        )
        .single()

      if (dbError) {
        // Intentar eliminar archivo de Storage si falla la BD
        await this.supabase.storage
          .from(this.BUCKET_NAME)
          .remove([uploadData.path])

        console.error('❌ Error al crear registro en BD:', dbError)
        throw new Error(`Error al guardar documento: ${dbError.message}`)
      }

      // Obtener información del usuario
      let usuarioData = undefined
      if (documento.subido_por) {
        const { data: usuario } = await this.supabase
          .from('usuarios')
          .select('id, email, nombres, apellidos')
          .eq('email', documento.subido_por)
          .single()

        usuarioData = usuario || undefined
      }

      console.log('✅ Documento subido exitosamente:', documento.id)
      return {
        ...documento,
        usuario: usuarioData
      } as unknown as DocumentoVivienda
    } catch (error) {
      console.error('❌ Error en subirDocumento:', error)
      throw error
    }
  }

  /**
   * Actualizar metadata de un documento
   */
  async actualizarDocumento(
    params: ActualizarDocumentoParams
  ): Promise<DocumentoVivienda> {
    const { id, ...updateData } = params

    const { data, error } = await this.supabase
      .from('documentos_vivienda')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        categoria:categorias_documento(id, nombre, color, icono, es_sistema)
      `
      )
      .single()

    if (error) {
      console.error('❌ Error al actualizar documento:', error)
      throw new Error(`Error al actualizar documento: ${error.message}`)
    }

    // Obtener información del usuario
    let usuarioData = undefined
    if (data.subido_por) {
      const { data: usuario } = await this.supabase
        .from('usuarios')
        .select('id, email, nombres, apellidos')
        .eq('email', data.subido_por)
        .single()

      usuarioData = usuario || undefined
    }

    console.log('✅ Documento actualizado:', id)
    return {
      ...data,
      usuario: usuarioData
    } as unknown as DocumentoVivienda
  }

  /**
   * Eliminar documento (soft delete)
   */
  async eliminarDocumento(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('documentos_vivienda')
      .update({ estado: 'eliminado' })
      .eq('id', id)

    if (error) {
      console.error('❌ Error al eliminar documento:', error)
      throw new Error(`Error al eliminar documento: ${error.message}`)
    }

    console.log('✅ Documento eliminado (soft):', id)
  }

  /**
   * Descargar documento
   */
  async descargarDocumento(id: string): Promise<Blob> {
    // 1. Obtener info del documento
    const { data: documento, error: docError } = await this.supabase
      .from('documentos_vivienda')
      .select('nombre_archivo, vivienda_id, nombre_original')
      .eq('id', id)
      .single()

    if (docError || !documento) {
      console.error('❌ Error al buscar documento:', docError)
      throw new Error('Documento no encontrado')
    }

    console.log('📄 Descargando documento:', {
      id,
      vivienda_id: documento.vivienda_id,
      nombre_archivo: documento.nombre_archivo,
    })

    // 2. Descargar de Storage (usar nombre_archivo que ya está limpio en DB)
    const filePath = `${documento.vivienda_id}/${documento.nombre_archivo}`

    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .download(filePath)

    if (error) {
      console.error('❌ Error al descargar archivo desde Storage:', {
        error,
        filePath,
        bucket: this.BUCKET_NAME,
      })
      throw new Error(`Error al descargar: ${error.message}`)
    }

    if (!data) {
      throw new Error('No se recibió datos del archivo')
    }

    console.log('✅ Archivo descargado exitosamente')
    return data
  }

  /**
   * Obtener URL firmada para ver/descargar documento
   */
  async obtenerUrlFirmada(
    id: string,
    expiresIn = 3600
  ): Promise<string> {
    // 1. Obtener info del documento
    const { data: documento, error: docError } = await this.supabase
      .from('documentos_vivienda')
      .select('nombre_archivo, vivienda_id, url_storage')
      .eq('id', id)
      .single()

    if (docError || !documento) {
      console.error('❌ Error al buscar documento:', docError)
      throw new Error('Documento no encontrado en base de datos')
    }

    console.log('📄 Obteniendo URL para visualizar:', {
      id,
      vivienda_id: documento.vivienda_id,
      nombre_archivo: documento.nombre_archivo,
    })

    // 2. Construir path del archivo en Storage
    const filePath = `${documento.vivienda_id}/${documento.nombre_archivo}`

    // 3. Verificar si el archivo existe en Storage
    const { data: fileExists } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .list(documento.vivienda_id, {
        search: documento.nombre_archivo,
      })

    if (!fileExists || fileExists.length === 0) {
      console.error('❌ Archivo no encontrado en Storage:', {
        bucket: this.BUCKET_NAME,
        filePath,
        vivienda_id: documento.vivienda_id,
        nombre_archivo: documento.nombre_archivo,
      })

      throw new Error(
        `El archivo "${documento.nombre_archivo}" no existe en Storage. ` +
        `Posiblemente fue eliminado o nunca se subió correctamente.`
      )
    }

    console.log('✅ Archivo existe en Storage')

    // 4. Crear URL firmada
    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn)

    if (error || !data?.signedUrl) {
      console.error('❌ Error al crear URL firmada:', {
        error,
        message: error?.message,
      })

      throw new Error(
        `Error al generar URL firmada: ${error?.message || 'Sin URL'}`
      )
    }

    console.log('✅ URL firmada creada:', data.signedUrl.substring(0, 100) + '...')
    return data.signedUrl
  }

  /**
   * Obtener estadísticas de documentos por vivienda
   */
  async obtenerEstadisticas(viviendaId: string) {
    const { data, error } = await this.supabase
      .from('documentos_vivienda')
      .select('id, categoria_id, tamano_bytes, es_importante')
      .eq('vivienda_id', viviendaId)
      .eq('estado', 'activo')

    if (error) {
      console.error('❌ Error al obtener estadísticas:', error)
      return {
        total: 0,
        importantes: 0,
        tamanoTotal: 0,
        porCategoria: {},
      }
    }

    const docs = data || []

    return {
      total: docs.length,
      importantes: docs.filter((d) => d.es_importante).length,
      tamanoTotal: docs.reduce((sum, d) => sum + d.tamano_bytes, 0),
      porCategoria: docs.reduce(
        (acc, d) => {
          const cat = d.categoria_id || 'Sin categoría'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
    }
  }

  // ============================================
  // 📚 MÉTODOS DE VERSIONADO
  // ============================================

  /**
   * Obtener todas las versiones de un documento
   */
  async obtenerVersiones(documentoId: string): Promise<DocumentoVivienda[]> {
    console.log('📚 Obteniendo versiones del documento:', documentoId)

    // 1. Obtener el documento solicitado
    const { data: docActual, error: errorDoc } = await this.supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', documentoId)
      .single()

    if (errorDoc) throw errorDoc
    if (!docActual) return []

    // 2. Determinar el ID raíz (si tiene padre, ese es la raíz; si no, él mismo es la raíz)
    const raizId = docActual.documento_padre_id || docActual.id

    // 3. Obtener TODAS las versiones: la raíz + todas sus hijas
    const { data, error } = await this.supabase
      .from('documentos_vivienda')
      .select('*')
      .or(`id.eq.${raizId},documento_padre_id.eq.${raizId}`)
      .neq('estado', 'eliminado') // No mostrar versiones eliminadas
      .order('version', { ascending: false })

    if (error) throw error

    // 4. Obtener información de usuarios
    if (data && data.length > 0) {
      const usuariosIds = [...new Set(data.map(doc => doc.subido_por).filter(Boolean))]

      let usuariosMap = new Map<string, any>()

      if (usuariosIds.length > 0) {
        const { data: usuarios } = await this.supabase
          .from('usuarios')
          .select('id, email, nombres, apellidos')
          .in('email', usuariosIds)

        // Mapear usuarios a documentos
        usuariosMap = new Map(
          usuarios?.map(u => [u.email, u]) || []
        )
      }

      // ✅ SIEMPRE mapear usuario (aunque sea undefined si no se encontró)
      const versionesConUsuario = data.map(doc => ({
        ...doc,
        usuario: doc.subido_por ? usuariosMap.get(doc.subido_por) : undefined
      }))

      console.log(`✅ ${versionesConUsuario.length} versiones encontradas`)
      return versionesConUsuario as unknown as DocumentoVivienda[]
    }

    console.log(`✅ 0 versiones encontradas`)
    return []
  }

  /**
   * Crear nueva versión de un documento
   *
   * ✅ CORREGIDO: Siempre usa el nombre del archivo nuevo como título
   * El título se extrae del nombre_original del archivo subido (sin extensión)
   */
  async crearNuevaVersion(
    documentoIdOriginal: string,
    archivo: File,
    userId: string,
    cambios?: string,
    tituloOverride?: string  // ✅ Opcional: para casos especiales (ej: restauración con nombre específico)
  ): Promise<DocumentoVivienda> {
    console.log('📤 Creando nueva versión del documento:', documentoIdOriginal)

    // 1. Obtener documento original
    const { data: docOriginal, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', documentoIdOriginal)
      .single()

    if (fetchError) throw fetchError

    // ✅ NUEVO: Extraer título del nombre del archivo (sin extensión)
    // Ejemplo: "MAT. INM. CASA B14 - NOVIEMBRE 6 DE 2025.pdf" → "MAT. INM. CASA B14 - NOVIEMBRE 6 DE 2025"
    const tituloDelArchivo = archivo.name.replace(/\.[^/.]+$/, '')
    const tituloFinal = tituloOverride || tituloDelArchivo

    console.log('📝 Título de nueva versión:', tituloFinal)

    // 2. Encontrar el documento padre (la versión 1)
    const documentoPadreId = docOriginal.documento_padre_id || documentoIdOriginal

    // 3. Obtener la versión más alta actual
    const { data: versiones } = await this.supabase
      .from('documentos_vivienda')
      .select('version')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .order('version', { ascending: false })
      .limit(1)

    const nuevaVersion = (versiones?.[0]?.version || 0) + 1

    // 4. Marcar versiones anteriores como NO actuales
    await this.supabase
      .from('documentos_vivienda')
      .update({ es_version_actual: false })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    // 5. Subir nuevo archivo a Storage
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`
    const storagePath = `${docOriginal.vivienda_id}/${nombreArchivo}`

    const { error: uploadError } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(storagePath, archivo)

    if (uploadError) throw uploadError

    // 6. Crear nuevo registro de documento
    const { data: nuevaVersionDoc, error: insertError } = await this.supabase
      .from('documentos_vivienda')
      .insert({
        vivienda_id: docOriginal.vivienda_id,
        categoria_id: docOriginal.categoria_id,
        titulo: tituloFinal,  // ✅ CORREGIDO: usa título del archivo nuevo, no del padre
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
        } as Json,
        subido_por: userId,
        fecha_documento: docOriginal.fecha_documento,
        fecha_vencimiento: docOriginal.fecha_vencimiento,
        es_importante: docOriginal.es_importante
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Obtener información del usuario
    let usuarioData = undefined
    if (nuevaVersionDoc.subido_por) {
      const { data: usuario } = await this.supabase
        .from('usuarios')
        .select('id, email, nombres, apellidos')
        .eq('email', nuevaVersionDoc.subido_por)
        .single()

      usuarioData = usuario || undefined
    }

    console.log(`✅ Nueva versión ${nuevaVersion} creada`)
    return {
      ...nuevaVersionDoc,
      usuario: usuarioData
    } as unknown as DocumentoVivienda
  }

  /**
   * Restaurar una versión anterior (crea una nueva versión con el contenido de la anterior)
   */
  async restaurarVersion(
    versionId: string,
    userId: string,
    motivo: string
  ): Promise<DocumentoVivienda> {
    console.log('🔄 Restaurando versión:', versionId)

    // 1. Obtener la versión a restaurar
    const { data: versionAnterior, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', versionId)
      .single()

    if (fetchError) throw fetchError

    console.log('📄 Versión a restaurar:', {
      id: versionAnterior.id,
      version: versionAnterior.version,
      url_storage: versionAnterior.url_storage,
      nombre_archivo: versionAnterior.nombre_archivo
    })

    // 2. Descargar el archivo de esa versión usando url_storage (que contiene la ruta)
    const { data: archivoBlob, error: downloadError } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .download(versionAnterior.url_storage)

    if (downloadError) {
      console.error('❌ Error al descargar archivo para restaurar:', downloadError)
      throw downloadError
    }

    // 3. Convertir blob a File
    const archivo = new File(
      [archivoBlob],
      versionAnterior.nombre_original,
      { type: versionAnterior.tipo_mime }
    )

    // 4. Crear nueva versión con el contenido restaurado
    const documentoPadreId = versionAnterior.documento_padre_id || versionId

    // ✅ CORREGIDO: Extraer título del nombre_original de la versión a restaurar
    // Ejemplo: "MAT. INM. CASA A7 - LAS AMERICAS 2 - 373-146214 - OCTUBRE 10 DE 2025.pdf"
    const tituloRestaurado = versionAnterior.nombre_original.replace(/\.[^/.]+$/, '') // Quitar extensión

    const resultado = await this.crearNuevaVersion(
      documentoPadreId,
      archivo,
      userId,
      `[RESTAURACIÓN] ${motivo} - Restaurado desde versión ${versionAnterior.version}`,
      tituloRestaurado  // ✅ NUEVO: pasar título de la versión restaurada
    )

    console.log(`✅ Versión ${versionAnterior.version} restaurada con título: ${tituloRestaurado}`)
    return resultado
  }

  /**
   * Eliminar versión (soft delete)
   * NO elimina el archivo físico, solo marca como eliminado
   */
  async eliminarVersion(
    versionId: string,
    userId: string,
    motivo: string
  ): Promise<void> {
    console.log('🗑️ Eliminando versión:', versionId)

    // 1. Obtener la versión a eliminar
    const { data: version, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
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
    const { data: versionesActivas, error: countError } = await this.supabase
      .from('documentos_vivienda')
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

    const { error: updateError } = await this.supabase
      .from('documentos_vivienda')
      .update({
        estado: 'eliminado',
        metadata: {
          ...metadataActual,
          motivo_eliminacion: motivo,
          eliminado_por: userId,
          fecha_eliminacion: new Date().toISOString(),
        } as Json,
      })
      .eq('id', versionId)

    if (updateError) throw updateError

    console.log(`✅ Versión ${version.version} eliminada (soft delete)`)
  }
}

// Singleton instance
export const documentosViviendaService = new DocumentosViviendaService()
