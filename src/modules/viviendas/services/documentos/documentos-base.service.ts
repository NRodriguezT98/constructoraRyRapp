// ============================================
// SERVICE: Documentos Vivienda - CRUD Básico
// ============================================

import { supabase } from '@/lib/supabase/client'
import type { DocumentoVivienda } from '../../types/documento-vivienda.types'

const BUCKET_NAME = 'documentos-viviendas'

interface SubirDocumentoParams {
  vivienda_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  archivo: File
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  metadata?: Record<string, any>
}

/**
 * Servicio de CRUD básico para documentos de vivienda
 * Responsabilidades: crear, leer, actualizar (básico)
 */
export class DocumentosBaseService {
  /**
   * Obtener todos los documentos de una vivienda
   */
  static async obtenerDocumentosPorVivienda(
    viviendaId: string
  ): Promise<DocumentoVivienda[]> {
    const { data, error } = await supabase
      .from('documentos_vivienda')
      .select(`
        *,
        usuario:usuarios!fk_documentos_vivienda_subido_por (
          nombres,
          apellidos,
          email
        )
      `)
      .eq('vivienda_id', viviendaId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .order('es_importante', { ascending: false })
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoVivienda[]
  }

  /**
   * Obtener documentos por categoría
   */
  static async obtenerDocumentosPorCategoria(
    viviendaId: string,
    categoriaId: string
  ): Promise<DocumentoVivienda[]> {
    const { data, error } = await supabase
      .from('documentos_vivienda')
      .select(`
        *,
        usuario:usuarios!fk_documentos_vivienda_subido_por (
          nombres,
          apellidos,
          email
        )
      `)
      .eq('vivienda_id', viviendaId)
      .eq('categoria_id', categoriaId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .order('version', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoVivienda[]
  }

  /**
   * Obtener documentos próximos a vencer
   */
  static async obtenerDocumentosProximosAVencer(
    diasAntes = 30
  ): Promise<DocumentoVivienda[]> {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + diasAntes)

    const { data, error } = await supabase
      .from('documentos_vivienda')
      .select(`
        *,
        usuario:usuarios!fk_documentos_vivienda_subido_por (
          nombres,
          apellidos,
          email
        )
      `)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .not('fecha_vencimiento', 'is', null)
      .lte('fecha_vencimiento', fechaLimite.toISOString())
      .order('fecha_vencimiento', { ascending: true })

    if (error) throw error
    return (data || []) as unknown as DocumentoVivienda[]
  }

  /**
   * Subir un nuevo documento
   */
  static async subirDocumento(
    params: SubirDocumentoParams,
    userId: string
  ): Promise<DocumentoVivienda> {
    const {
      archivo,
      vivienda_id,
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

    // 3. Construir path en storage
    const storagePath = `${vivienda_id}/${categoriaNombre}/${nombreArchivo}`

    // 4. Subir archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, archivo, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // 5. Crear registro en la base de datos
    const { data: documento, error: dbError } = await supabase
      .from('documentos_vivienda')
      .insert({
        vivienda_id,
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
        usuario:usuarios!fk_documentos_vivienda_subido_por (
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

    return documento as unknown as DocumentoVivienda
  }

  /**
   * Actualizar documento (solo campos básicos, NO archivo)
   */
  static async actualizarDocumento(
    documentoId: string,
    updates: {
      titulo?: string
      descripcion?: string
      fecha_documento?: string
      fecha_vencimiento?: string
      categoria_id?: string
      es_importante?: boolean
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('documentos_vivienda')
      .update(updates)
      .eq('id', documentoId)

    if (error) throw error
  }

  /**
   * Buscar documentos por texto
   */
  static async buscarDocumentos(
    viviendaId: string,
    query: string
  ): Promise<DocumentoVivienda[]> {
    const { data, error } = await supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('vivienda_id', viviendaId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoVivienda[]
  }

  /**
   * Obtener documentos importantes
   */
  static async obtenerDocumentosImportantes(
    viviendaId: string
  ): Promise<DocumentoVivienda[]> {
    const { data, error } = await supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('vivienda_id', viviendaId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .eq('es_importante', true)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoVivienda[]
  }

  /**
   * Toggle importante
   */
  static async toggleImportante(
    documentoId: string,
    esImportante: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('documentos_vivienda')
      .update({ es_importante: esImportante })
      .eq('id', documentoId)

    if (error) throw error
  }
}
