/**
 * Utilidades de formato para datos
 */

/**
 * Formatea tamaño de archivo en bytes a formato legible
 * @param bytes - Tamaño en bytes
 * @returns String formateado (ej: "1.5 MB", "350 KB")
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)

  return `${size.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`
}
