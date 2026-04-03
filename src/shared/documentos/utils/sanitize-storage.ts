/**
 * Sanitiza texto para rutas de almacenamiento en Supabase Storage
 * - Remueve acentos y caracteres especiales
 * - Convierte a minúsculas
 * - Reemplaza espacios por guiones
 */
export function sanitizeForStorage(text: string): string {
  const accentMap: Record<string, string> = {
    á: 'a',
    é: 'e',
    í: 'i',
    ó: 'o',
    ú: 'u',
    Á: 'A',
    É: 'E',
    Í: 'I',
    Ó: 'O',
    Ú: 'U',
    ñ: 'n',
    Ñ: 'N',
    ü: 'u',
    Ü: 'U',
  }

  let sanitized = text
  for (const [accent, plain] of Object.entries(accentMap)) {
    sanitized = sanitized.replace(new RegExp(accent, 'g'), plain)
  }

  return sanitized
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
}
