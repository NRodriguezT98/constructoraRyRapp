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

    return data || []
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

      console.log('✅ Documento subido exitosamente:', documento.id)
      return documento
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

    console.log('✅ Documento actualizado:', id)
    return data
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
      .select('nombre_archivo, vivienda_id')
      .eq('id', id)
      .single()

    if (docError || !documento) {
      throw new Error('Documento no encontrado')
    }

    // 2. Descargar de Storage
    const filePath = `${documento.vivienda_id}/${documento.nombre_archivo}`
    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .download(filePath)

    if (error) {
      console.error('❌ Error al descargar archivo:', error)
      throw new Error(`Error al descargar: ${error.message}`)
    }

    return data
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
}

// Singleton instance
export const documentosViviendaService = new DocumentosViviendaService()
