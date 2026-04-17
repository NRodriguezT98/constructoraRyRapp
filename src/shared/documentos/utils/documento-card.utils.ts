/**
 * Utilidades puras para las tarjetas de documentos.
 * Sin dependencias de React — importables en cualquier componente o hook.
 */

// ─── Color basado en tipo de archivo (independiente de categoría) ─────────────

export function getFileTypeColor(
  extension: string,
  mimeType?: string | null
): string {
  const ext = extension.toLowerCase()
  if (
    mimeType?.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
  )
    return '#3b82f6' // blue-500
  if (['pdf'].includes(ext)) return '#ef4444' // red-500
  if (['doc', 'docx'].includes(ext)) return '#2563eb' // blue-700
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '#16a34a' // green-600
  if (['ppt', 'pptx'].includes(ext)) return '#ea580c' // orange-600
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return '#9333ea' // purple-600
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '#d97706' // amber-600
  return '#64748b' // slate-500 (fallback)
}

// ─── Avatares deterministas según nombre ─────────────────────────────────────

export const AVATAR_COLORS = [
  '#15803d', // green-700 ← índice 0
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
]

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function getInitials(nombres?: string, apellidos?: string): string {
  const n = nombres?.trim().charAt(0).toUpperCase() ?? ''
  const a = apellidos?.trim().charAt(0).toUpperCase() ?? ''
  return n + a || '?'
}
