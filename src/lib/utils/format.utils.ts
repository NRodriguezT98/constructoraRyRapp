/**
 * Utilidades de formato para datos
 */

/**
 * Formatea tamaño de archivo en bytes a formato legible
 * @param bytes - Tamaño en bytes
 * @returns String formateado (ej: "1.5 MB", "350 KB")
 */
export function formatFileSize(bytes: number | null | undefined): string {
  // Manejo robusto de valores inválidos
  if (bytes == null || bytes <= 0 || isNaN(bytes) || !isFinite(bytes)) {
    return '0 B'
  }

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  // Validar que el índice esté en rango
  const sizeIndex = Math.max(0, Math.min(i, sizes.length - 1))
  const size = bytes / Math.pow(1024, sizeIndex)

  return `${size.toFixed(sizeIndex === 0 ? 0 : 2)} ${sizes[sizeIndex]}`
}
