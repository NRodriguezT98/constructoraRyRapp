// ============================================
// SERVICE: Documentos Vivienda - Operaciones de Storage
// ============================================

import { supabase } from '@/lib/supabase/client'

const BUCKET_NAME = 'documentos-viviendas'

/**
 * Servicio de operaciones de Supabase Storage
 * Responsabilidades: descargar, URLs firmadas, eliminar archivos físicos
 */
export class DocumentosStorageService {
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
   * Descargar archivo como Blob
   */
  static async descargarArchivo(storagePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(storagePath)

    if (error) throw error
    return data
  }

  /**
   * Eliminar archivo físico de Storage
   */
  static async eliminarArchivoStorage(storagePath: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath])

    if (error) throw error
  }

  /**
   * Eliminar múltiples archivos físicos de Storage
   */
  static async eliminarArchivosStorage(storagePaths: string[]): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove(storagePaths)

    if (error) throw error
  }

  /**
   * Subir archivo a Storage (usado internamente)
   */
  static async subirArchivo(
    storagePath: string,
    archivo: File | Blob,
    options?: { cacheControl?: string; upsert?: boolean }
  ): Promise<string> {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, archivo, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false
    })

    if (error) throw error
    return data.path
  }
}
