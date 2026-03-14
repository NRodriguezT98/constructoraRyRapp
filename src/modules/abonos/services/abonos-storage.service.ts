// ============================================================
// SERVICE: Abonos - Operaciones de Storage
// ============================================================

import { supabase } from '@/lib/supabase/client'

const BUCKET = 'comprobantes-abonos'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

/**
 * Genera el path de storage para un comprobante.
 * Formato: negociaciones/{negociacionId}/fuentes/{fuentePagoId}/{YYYYMMDD}-{timestamp}.{ext}
 */
export function generarPathComprobante(
  negociacionId: string,
  fuentePagoId: string,
  archivo: File
): string {
  const ext = MIME_TO_EXT[archivo.type] || 'bin'
  const hoy = new Date()
  const yyyymmdd =
    hoy.getFullYear().toString() +
    String(hoy.getMonth() + 1).padStart(2, '0') +
    String(hoy.getDate()).padStart(2, '0')
  return `negociaciones/${negociacionId}/fuentes/${fuentePagoId}/${yyyymmdd}-${Date.now()}.${ext}`
}

/**
 * Sube un comprobante al bucket privado.
 * @returns El path de storage donde quedó guardado.
 */
export async function subirComprobante(path: string, archivo: File): Promise<string> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, archivo, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error
  return path
}

/**
 * Elimina un comprobante del bucket (best-effort: no lanza si falla).
 */
export async function eliminarComprobante(path: string): Promise<void> {
  try {
    await supabase.storage.from(BUCKET).remove([path])
  } catch (err) {
    console.warn('[abonos-storage] No se pudo eliminar comprobante:', path, err)
  }
}
