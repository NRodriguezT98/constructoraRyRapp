// ============================================
// SERVICE: Documentos - Operaciones de Storage
// ============================================

import { supabase } from '@/lib/supabase/client'
import { type TipoEntidad, obtenerConfiguracionEntidad } from '../types/entidad.types'

/**
 * Servicio de operaciones de Supabase Storage
 * Responsabilidades: descargar, URLs firmadas, eliminar archivos físicos
 */
export class DocumentosStorageService {
  /**
   * Obtener URL de descarga con firma temporal
   * @param storagePath - Path del archivo en storage
   * @param tipoEntidad - Tipo de entidad para determinar el bucket correcto
   * @param expiresIn - Tiempo de expiración en segundos (default: 1 hora)
   */
  static async obtenerUrlDescarga(
    storagePath: string,
    tipoEntidad: TipoEntidad = 'proyecto',
    expiresIn = 3600
  ): Promise<string> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    const { data, error } = await supabase.storage
      .from(config.bucket)
      .createSignedUrl(storagePath, expiresIn)

    if (error) throw error
    return data.signedUrl
  }

  /**
   * Descargar archivo como Blob
   * @param storagePath - Path del archivo en storage
   * @param tipoEntidad - Tipo de entidad para determinar el bucket correcto
   */
  static async descargarArchivo(
    storagePath: string,
    tipoEntidad: TipoEntidad = 'proyecto'
  ): Promise<Blob> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    const { data, error } = await supabase.storage
      .from(config.bucket)
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
