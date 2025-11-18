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

  // Sistema de Estados de Versión - PROFESIONAL
  estado_version?: string // 'valida' | 'erronea' | 'obsoleta' | 'supersedida'
  motivo_estado?: string | null
  version_corrige_a?: string | null

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
   * Eliminar documento completo (soft delete)
   * ⚠️ SOLO ADMINISTRADORES
   * ⚠️ Elimina el documento Y TODAS sus versiones
   *
   * @param id - ID del documento (puede ser cualquier versión)
   * @param userId - ID del usuario que elimina
   * @param userRole - Rol del usuario (debe ser 'Administrador')
   * @param motivo - Motivo detallado de eliminación (obligatorio)
   */
  async eliminarDocumento(
    id: string,
    userId: string,
    userRole: string,
    motivo: string
  ): Promise<void> {
    // 🔒 VALIDACIÓN 1: Solo Administradores
    if (userRole !== 'Administrador') {
      throw new Error('❌ Solo los Administradores pueden eliminar documentos. Por favor, reporta el error a un administrador.')
    }

    // 🔒 VALIDACIÓN 2: Motivo obligatorio y detallado
    if (!motivo || motivo.trim().length < 20) {
      throw new Error('❌ Debe proporcionar un motivo detallado (mínimo 20 caracteres)')
    }

    // 1. Obtener información del documento para auditoría
    const { data: documento, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!documento) throw new Error('Documento no encontrado')

    // 2. Determinar el ID raíz (documento original)
    const raizId = documento.documento_padre_id || id

    // 3. Obtener TODAS las versiones para contar
    const { data: todasVersiones, error: countError } = await this.supabase
      .from('documentos_vivienda')
      .select('id, version, titulo')
      .or(`id.eq.${raizId},documento_padre_id.eq.${raizId}`)
      .eq('estado', 'activo')

    if (countError) throw countError

    const cantidadVersiones = todasVersiones?.length || 0

    console.log(`🗑️ [ADMIN] Eliminando documento completo:`, {
      documentoId: id,
      titulo: documento.titulo,
      raizId,
      cantidadVersiones,
      motivo
    })

    // 4. Metadata de auditoría
    const metadataEliminacion = {
      eliminado_por: userId,
      fecha_eliminacion: new Date().toISOString(),
      motivo_eliminacion: motivo.trim(),
      rol_eliminador: userRole,
      versiones_eliminadas: cantidadVersiones,
      eliminacion_completa: true
    }

    // 5. Soft delete de TODAS las versiones (original + versiones)
    const { error: deleteError } = await this.supabase
      .from('documentos_vivienda')
      .update({
        estado: 'eliminado',
        metadata: metadataEliminacion
      })
      .or(`id.eq.${raizId},documento_padre_id.eq.${raizId}`)

    if (deleteError) {
      console.error('❌ Error al eliminar documento completo:', deleteError)
      throw new Error(`Error al eliminar documento: ${deleteError.message}`)
    }

    console.log(`✅ Documento completo eliminado por ${userRole}:`, {
      titulo: documento.titulo,
      versiones: cantidadVersiones,
      motivo
    })
  }

  /**
   * Reportar documento erróneo (para usuarios no-admin)
   * Crea una notificación/flag para que un Admin revise
   *
   * @param id - ID del documento
   * @param userId - ID del usuario que reporta
   * @param motivo - Descripción del error
   */
  async reportarDocumentoErroneo(
    id: string,
    userId: string,
    motivo: string
  ): Promise<void> {
    if (!motivo || motivo.trim().length < 10) {
      throw new Error('❌ Debe describir el error (mínimo 10 caracteres)')
    }

    // Actualizar metadata con flag de reporte
    const { data: documento, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('metadata')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { error } = await this.supabase
      .from('documentos_vivienda')
      .update({
        metadata: {
          ...(typeof documento.metadata === 'object' && documento.metadata !== null ? documento.metadata : {}),
          reportado_como_erroneo: true,
          fecha_reporte: new Date().toISOString(),
          reportado_por: userId,
          motivo_reporte: motivo.trim(),
          estado_reporte: 'pendiente' // 'pendiente', 'revisado', 'corregido'
        }
      })
      .eq('id', id)

    if (error) {
      console.error('❌ Error al reportar documento:', error)
      throw new Error(`Error al reportar documento: ${error.message}`)
    }

    console.log('📢 Documento reportado como erróneo:', {
      id,
      reportado_por: userId,
      motivo
    })

    // TODO: Crear notificación para administradores
    // await this.crearNotificacionAdmin({
    //   tipo: 'documento_reportado',
    //   documento_id: id,
    //   mensaje: `Usuario reportó documento como erróneo: ${motivo}`
    // })
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

    // ✅ CORREGIDO: Obtener URL pública (consistente con primera subida)
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.BUCKET_NAME).getPublicUrl(storagePath)

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
        url_storage: publicUrl,  // ✅ CORREGIDO: usar URL pública completa
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
      nombre_archivo: versionAnterior.nombre_archivo,
      vivienda_id: versionAnterior.vivienda_id
    })

    // 2. ✅ VALIDACIÓN: El documento DEBE estar en bucket documentos-viviendas
    if (!versionAnterior.url_storage.includes('/documentos-viviendas/')) {
      console.error('❌ DOCUMENTO CON DATOS INCONSISTENTES:', {
        id: versionAnterior.id,
        version: versionAnterior.version,
        url_actual: versionAnterior.url_storage,
        problema: 'URL apunta a bucket incorrecto (debería ser documentos-viviendas)'
      })
      throw new Error(
        `No se puede restaurar esta versión. El documento tiene datos inconsistentes en la base de datos. ` +
        `Por favor, contacta al administrador para corregir el registro del documento.`
      )
    }

    // 3. Extraer path relativo desde URL
    let pathRelativo: string

    try {
      const parts = versionAnterior.url_storage.split('/documentos-viviendas/')
      if (parts.length > 1) {
        pathRelativo = decodeURIComponent(parts[1])
        console.log('📂 Path extraído:', pathRelativo)
      } else {
        throw new Error('No se pudo extraer path de la URL')
      }
    } catch (error) {
      console.error('❌ Error al extraer path desde URL:', error)
      throw new Error(
        `No se puede restaurar esta versión. La URL del documento no tiene el formato esperado. ` +
        `Por favor, contacta al administrador.`
      )
    }

    console.log('✅ Path final a descargar:', pathRelativo)

    // 4. Descargar el archivo de esa versión
    const { data: archivoBlob, error: downloadError } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .download(pathRelativo)

    if (downloadError) {
      console.error('❌ Error al descargar archivo para restaurar:', downloadError)
      throw downloadError
    }

    // 4. Convertir blob a File
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
   * ⚠️ SOLO ADMINISTRADORES
   *
   * REGLAS DE NEGOCIO:
   * 🔒 Solo Administradores pueden eliminar versiones
   * ✅ Puede eliminar versión original SI hay múltiples versiones activas
   * ❌ NO puede eliminar versión actual (debe restaurar otra primero)
   * ❌ NO puede eliminar si solo queda 1 versión activa (eliminar documento completo en su lugar)
   */
  async eliminarVersion(
    versionId: string,
    userId: string,
    userRole: string,
    motivo: string
  ): Promise<void> {
    console.log('🗑️ [ADMIN] Eliminando versión:', versionId)

    // 🔒 VALIDACIÓN 1: Solo Administradores
    if (userRole !== 'Administrador') {
      throw new Error('❌ Solo los Administradores pueden eliminar versiones. Por favor, reporta el error a un administrador.')
    }

    // 🔒 VALIDACIÓN 2: Motivo obligatorio
    if (!motivo || motivo.trim().length < 20) {
      throw new Error('❌ Debe proporcionar un motivo detallado (mínimo 20 caracteres)')
    }

    // 1. Obtener la versión a eliminar
    const { data: version, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', versionId)
      .single()

    if (fetchError) throw fetchError
    if (!version) throw new Error('Versión no encontrada')

    console.log(`📋 Versión ${version.version} - "${version.titulo}"`)

    // 2. VALIDACIÓN CRÍTICA: No eliminar versión ACTUAL
    if (version.es_version_actual) {
      throw new Error(
        '❌ No se puede eliminar la versión actual.\n\n' +
        '💡 Primero restaura otra versión como actual, luego podrás eliminar esta.'
      )
    }

    // 3. VALIDACIÓN: Debe haber al menos 2 versiones activas después de eliminar
    const raizId = version.documento_padre_id || version.id
    const { data: versionesActivas, error: countError } = await this.supabase
      .from('documentos_vivienda')
      .select('id, version, es_version_actual')
      .or(`id.eq.${raizId},documento_padre_id.eq.${raizId}`)
      .eq('estado', 'activo')

    if (countError) throw countError

    if (versionesActivas && versionesActivas.length <= 1) {
      throw new Error(
        '❌ No se puede eliminar la única versión activa.\n\n' +
        '💡 Si deseas eliminar este documento completamente, usa el botón "Eliminar Documento" en lugar de "Eliminar Versión".'
      )
    }

    console.log(`✅ Validaciones pasadas. Versiones activas restantes: ${(versionesActivas?.length || 0) - 1}`)
    console.log(`📋 Motivo: ${motivo}`)

    // 4. Marcar como eliminado (soft delete) con auditoría completa
    const metadataActual = typeof version.metadata === 'object' && version.metadata !== null
      ? version.metadata as Record<string, any>
      : {}

    const { error: updateError } = await this.supabase
      .from('documentos_vivienda')
      .update({
        estado: 'eliminado',
        metadata: {
          ...metadataActual,
          motivo_eliminacion: motivo.trim(),
          eliminado_por: userId,
          rol_eliminador: userRole,
          fecha_eliminacion: new Date().toISOString(),
        } as Json,
      })
      .eq('id', versionId)

    if (updateError) throw updateError

    console.log(`✅ Versión ${version.version} eliminada por ${userRole}:`, {
      id: versionId,
      titulo: version.titulo,
      motivo
    })
  }

  /**
   * 🗑️ Obtener documentos eliminados (soft delete) con sus versiones
   * ⚠️ SOLO ADMINISTRADORES
   * ⚠️ Trae SOLO documentos raíz (para evitar duplicados)
   * ⚠️ Las versiones se obtienen mediante una segunda consulta cuando se expande
   *
   * @param viviendaId - ID de la vivienda (opcional, si se omite trae todos)
   */
  async obtenerDocumentosEliminados(viviendaId?: string): Promise<DocumentoVivienda[]> {
    let query = this.supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('estado', 'eliminado')
      .is('documento_padre_id', null) // ✅ SOLO raíz (sin padre)

    if (viviendaId) {
      query = query.eq('vivienda_id', viviendaId)
    }

    query = query.order('fecha_creacion', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('❌ Error al obtener documentos eliminados:', error)
      throw error
    }

    return (data || []) as DocumentoVivienda[]
  }

  /**
   * 🔍 Obtener versiones eliminadas de un documento específico
   * ⚠️ SOLO ADMINISTRADORES
   *
   * @param documentoPadreId - ID del documento raíz
   */
  async obtenerVersionesEliminadas(documentoPadreId: string): Promise<DocumentoVivienda[]> {
    const { data, error } = await this.supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('estado', 'eliminado')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .order('version', { ascending: true })

    if (error) {
      console.error('❌ Error al obtener versiones eliminadas:', error)
      throw error
    }

    return (data || []) as DocumentoVivienda[]
  }

  /**
   * ↩️ Restaurar documento completo (de papelera a activo)
   * ⚠️ SOLO ADMINISTRADORES
   * ⚠️ Restaura el documento Y TODAS sus versiones
   *
   * @param id - ID del documento (puede ser cualquier versión)
   * @param userId - ID del usuario que restaura
   * @param userRole - Rol del usuario (debe ser 'Administrador')
   */
  async restaurarDocumento(
    id: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    // 🔒 VALIDACIÓN: Solo Administradores
    if (userRole !== 'Administrador') {
      throw new Error('❌ Solo los Administradores pueden restaurar documentos.')
    }

    // 1. Obtener información del documento
    const { data: documento, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!documento) throw new Error('Documento no encontrado')

    // Validar que esté eliminado
    if (documento.estado !== 'eliminado') {
      throw new Error('❌ Este documento no está en la papelera')
    }

    // 2. Determinar el ID raíz
    const raizId = documento.documento_padre_id || id

    // 3. Obtener TODAS las versiones para contar
    const { data: todasVersiones, error: countError } = await this.supabase
      .from('documentos_vivienda')
      .select('id, version, titulo')
      .or(`id.eq.${raizId},documento_padre_id.eq.${raizId}`)
      .eq('estado', 'eliminado')

    if (countError) throw countError

    const cantidadVersiones = todasVersiones?.length || 0

    console.log(`↩️ [ADMIN] Restaurando documento completo:`, {
      documentoId: id,
      titulo: documento.titulo,
      raizId,
      cantidadVersiones
    })

    // 4. Metadata de auditoría
    const metadataRestauracion = {
      restaurado_por: userId,
      fecha_restauracion: new Date().toISOString(),
      rol_restaurador: userRole,
      versiones_restauradas: cantidadVersiones
    }

    // 5. Restaurar TODAS las versiones (volver a estado 'activo')
    const { error: restoreError } = await this.supabase
      .from('documentos_vivienda')
      .update({
        estado: 'activo',
        metadata: metadataRestauracion
      })
      .or(`id.eq.${raizId},documento_padre_id.eq.${raizId}`)

    if (restoreError) {
      console.error('❌ Error al restaurar documento:', restoreError)
      throw new Error(`Error al restaurar documento: ${restoreError.message}`)
    }

    console.log(`✅ Documento restaurado por ${userRole}:`, {
      titulo: documento.titulo,
      versiones: cantidadVersiones
    })
  }

  /**
   * 🔥 Eliminar documento PERMANENTEMENTE (hard delete)
   * ⚠️ SOLO ADMINISTRADORES
   * ⚠️ IRREVERSIBLE - Elimina registros de BD y archivos de Storage
   *
   * @param id - ID del documento (puede ser cualquier versión)
   * @param userId - ID del usuario que elimina
   * @param userRole - Rol del usuario (debe ser 'Administrador')
   * @param motivo - Motivo detallado de eliminación permanente
   */
  async eliminarPermanente(
    id: string,
    userId: string,
    userRole: string,
    motivo: string,
    soloEstaVersion: boolean = false
  ): Promise<void> {
    // 🔒 VALIDACIÓN 1: Solo Administradores
    if (userRole !== 'Administrador') {
      throw new Error('❌ Solo los Administradores pueden eliminar permanentemente.')
    }

    // 🔒 VALIDACIÓN 2: Motivo obligatorio
    if (!motivo || motivo.trim().length < 20) {
      throw new Error('❌ Debe proporcionar un motivo detallado (mínimo 20 caracteres)')
    }

    // 1. Obtener información del documento
    const { data: documento, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!documento) throw new Error('Documento no encontrado')

    // Validar que esté eliminado (soft delete primero)
    if (documento.estado !== 'eliminado') {
      throw new Error('❌ Solo se pueden eliminar permanentemente documentos que estén en la papelera')
    }

    let todasVersiones: any[] = []
    let cantidadVersiones = 0

    if (soloEstaVersion) {
      // Eliminar SOLO esta versión específica
      todasVersiones = [documento]
      cantidadVersiones = 1

      console.log(`🔥 [ADMIN] Eliminando PERMANENTEMENTE versión individual:`, {
        documentoId: id,
        titulo: documento.titulo,
        version: documento.version,
        motivo
      })
    } else {
      // Eliminar TODAS las versiones (raíz + hijas)
      const raizId = documento.documento_padre_id || id

      const { data: versionesData, error: versionesError } = await this.supabase
        .from('documentos_vivienda')
        .select('id, version, titulo, url_storage, vivienda_id')
        .or(`id.eq.${raizId},documento_padre_id.eq.${raizId}`)

      if (versionesError) throw versionesError

      todasVersiones = versionesData || []
      cantidadVersiones = todasVersiones.length

      console.log(`🔥 [ADMIN] Eliminando PERMANENTEMENTE documento completo:`, {
        documentoId: id,
        titulo: documento.titulo,
        raizId,
        cantidadVersiones,
        motivo
      })
    }

    // 4. Eliminar archivos físicos de Storage
    const archivosEliminados: string[] = []
    const erroresStorage: string[] = []

    for (const version of todasVersiones || []) {
      if (version.url_storage) {
        try {
          // Extraer la ruta del archivo desde la URL completa
          // url_storage formato: "https://...supabase.co/storage/v1/object/public/documentos-viviendas/{vivienda_id}/{archivo}"
          const urlParts = version.url_storage.split('/documentos-viviendas/')
          const rutaArchivo = urlParts[1] // "{vivienda_id}/{archivo}"

          if (!rutaArchivo) {
            console.warn(`⚠️ No se pudo extraer ruta de: ${version.url_storage}`)
            continue
          }

          const { error: storageError } = await this.supabase.storage
            .from('documentos-viviendas')
            .remove([rutaArchivo])

          if (storageError) {
            console.error(`❌ Error eliminando archivo ${rutaArchivo}:`, storageError)
            erroresStorage.push(rutaArchivo)
          } else {
            archivosEliminados.push(rutaArchivo)
            console.log(`✅ Archivo eliminado de Storage: ${rutaArchivo}`)
          }
        } catch (error) {
          console.error(`❌ Error eliminando archivo de ${version.url_storage}:`, error)
          erroresStorage.push(version.url_storage)
        }
      }
    }

    // 5. Eliminar registros de base de datos (hard delete)
    const idsAEliminar = todasVersiones.map(v => v.id)

    const { error: deleteError } = await this.supabase
      .from('documentos_vivienda')
      .delete()
      .in('id', idsAEliminar)

    if (deleteError) {
      console.error('❌ Error al eliminar registros de BD:', deleteError)
      throw new Error(`Error al eliminar registros: ${deleteError.message}`)
    }

    console.log(`✅ Documento PERMANENTEMENTE eliminado por ${userRole}:`, {
      titulo: documento.titulo,
      versiones: cantidadVersiones,
      archivosEliminados: archivosEliminados.length,
      erroresStorage: erroresStorage.length,
      motivo,
      soloVersion: soloEstaVersion
    })

    // 6. Registrar en logs (opcional, si tienes tabla de auditoría)
    // await this.registrarAuditoria({
    //   tipo: 'eliminacion_permanente',
    //   documento_id: id,
    //   usuario_id: userId,
    //   motivo,
    //   metadata: { versiones: cantidadVersiones, archivos: archivosEliminados }
    // })
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
  async marcarVersionComoErronea(
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
    const { data: documento, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('id, titulo, version, estado_version')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      throw new Error('Documento no encontrado')
    }

    // 2. Validar que la versión correcta existe (si se proporciona)
    if (versionCorrectaId) {
      const { data: versionCorrecta, error: correctaError } = await this.supabase
        .from('documentos_vivienda')
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
    const { error: updateError } = await this.supabase
      .from('documentos_vivienda')
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
      const { error: linkError } = await this.supabase
        .from('documentos_vivienda')
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
  }

  /**
   * Marcar una versión como obsoleta
   * @param documentoId - ID de la versión a marcar como obsoleta
   * @param motivo - Motivo por el cual quedó obsoleta
   */
  async marcarVersionComoObsoleta(
    documentoId: string,
    motivo: string
  ): Promise<void> {
    console.log('📦 Marcando versión como obsoleta:', { documentoId, motivo })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('id, titulo, version, estado_version')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      throw new Error('Documento no encontrado')
    }

    // 2. Actualizar estado
    const { error: updateError } = await this.supabase
      .from('documentos_vivienda')
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
  }

  /**
   * Restaurar estado de una versión a "valida"
   * @param documentoId - ID de la versión a restaurar
   */
  async restaurarEstadoVersion(documentoId: string): Promise<void> {
    console.log('♻️ Restaurando estado de versión:', { documentoId })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('id, titulo, version, estado_version, motivo_estado')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      throw new Error('Documento no encontrado')
    }

    // 2. Restaurar a estado válido
    const { error: updateError } = await this.supabase
      .from('documentos_vivienda')
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
  }

  /**
   * Reemplazar archivo de documento existente (Admin Only, 48h máximo)
   * Crea backup automático y valida tiempo desde creación
   * @param documentoId - ID del documento a reemplazar
   * @param nuevoArchivo - Nuevo archivo
   * @param motivo - Justificación del reemplazo
   */
  async reemplazarArchivoSeguro(
    documentoId: string,
    nuevoArchivo: File,
    motivo: string
  ): Promise<void> {
    console.log('🔄 Iniciando reemplazo seguro de archivo:', {
      documentoId,
      nuevoArchivo: nuevoArchivo.name,
      tamano: nuevoArchivo.size,
      motivo,
    })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await this.supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      throw new Error('Documento no encontrado')
    }

    // 2. Validar ventana de 48 horas
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

    // 3. Crear backup del archivo original
    const backupPath = `${documento.vivienda_id}/backups/${documentoId}_backup_${Date.now()}_${documento.nombre_archivo}`

    // Copiar archivo original a backup (usando la URL de storage)
    const archivoOriginalPath = documento.url_storage.split(
      '/documentos-viviendas/'
    )[1]

    const { data: downloadData, error: downloadError } = await this.supabase.storage
      .from('documentos-viviendas')
      .download(archivoOriginalPath)

    if (downloadError) {
      throw new Error(`Error al descargar archivo original: ${downloadError.message}`)
    }

    const { error: backupError } = await this.supabase.storage
      .from('documentos-viviendas')
      .upload(backupPath, downloadData, {
        contentType: documento.tipo_mime,
        upsert: false,
      })

    if (backupError) {
      throw new Error(`Error al crear backup: ${backupError.message}`)
    }

    console.log('✅ Backup creado:', backupPath)

    // 4. Reemplazar archivo original
    const { error: replaceError } = await this.supabase.storage
      .from('documentos-viviendas')
      .update(archivoOriginalPath, nuevoArchivo, {
        contentType: nuevoArchivo.type,
        upsert: true,
      })

    if (replaceError) {
      throw new Error(`Error al reemplazar archivo: ${replaceError.message}`)
    }

    // 5. Actualizar metadata con información del reemplazo
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

    const { error: updateError } = await this.supabase
      .from('documentos_vivienda')
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
  }
}

// Singleton instance
export const documentosViviendaService = new DocumentosViviendaService()
