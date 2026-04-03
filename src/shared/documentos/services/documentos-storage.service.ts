// ============================================
// SERVICE: Documentos - Operaciones de Storage (GENÉRICO)
// ============================================

import { supabase } from '@/lib/supabase/client'

import {
  type TipoEntidad,
  obtenerConfiguracionEntidad,
} from '../types/entidad.types'

/**
 * Servicio de operaciones de Supabase Storage (GENÉRICO)
 * Responsabilidades: descargar, URLs firmadas, eliminar archivos físicos
 */
export class DocumentosStorageService {
  /**
   * ✅ GENÉRICO: Obtener URL de descarga con firma temporal
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
   * ✅ GENÉRICO: Descargar archivo como Blob
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
   * ✅ GENÉRICO: Eliminar archivo físico de Storage
   */
  static async eliminarArchivoStorage(
    storagePath: string,
    tipoEntidad: TipoEntidad = 'proyecto'
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const { error } = await supabase.storage
      .from(config.bucket)
      .remove([storagePath])

    if (error) throw error
  }

  /**
   * ✅ GENÉRICO: Eliminar múltiples archivos físicos de Storage
   */
  static async eliminarArchivosStorage(
    storagePaths: string[],
    tipoEntidad: TipoEntidad = 'proyecto'
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const { error } = await supabase.storage
      .from(config.bucket)
      .remove(storagePaths)

    if (error) throw error
  }

  /**
   * ✅ GENÉRICO: Subir archivo a Storage
   */
  static async subirArchivo(
    storagePath: string,
    archivo: File | Blob,
    tipoEntidad: TipoEntidad = 'proyecto',
    options?: { cacheControl?: string; upsert?: boolean }
  ): Promise<string> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const { data, error } = await supabase.storage
      .from(config.bucket)
      .upload(storagePath, archivo, {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
      })

    if (error) throw error
    return data.path
  }
}
