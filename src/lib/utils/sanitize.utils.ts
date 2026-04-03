/**
 * 🧹 UTILIDADES DE SANITIZACIÓN DE DATOS
 *
 * Funciones centralizadas para limpiar y normalizar datos antes de enviarlos a la BD.
 * Convierte strings vacíos, undefined, y valores inválidos a null.
 *
 * @module sanitize
 */

/**
 * Sanitizar string: convierte strings vacíos a null
 * @param value - Valor a sanitizar
 * @returns String limpio o null
 */
export function sanitizeString(
  value: string | null | undefined
): string | null {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Sanitizar fecha: convierte strings vacíos y fechas inválidas a null
 * @param value - Valor de fecha a sanitizar
 * @returns Fecha válida o null
 */
export function sanitizeDate(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  if (trimmed === '') return null

  // Validar que sea una fecha válida
  const date = new Date(trimmed)
  if (isNaN(date.getTime())) return null

  return trimmed
}

/**
 * Sanitizar enum: convierte strings vacíos y valores inválidos a null
 * @param value - Valor del enum a sanitizar
 * @param validValues - Array de valores válidos del enum
 * @returns Valor del enum o null
 */
export function sanitizeEnum<T extends string>(
  value: T | string | null | undefined,
  validValues: readonly T[]
): T | null {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  if (trimmed === '') return null

  // Verificar que el valor esté en los valores válidos
  if (validValues.includes(trimmed as T)) {
    return trimmed as T
  }

  return null
}

/**
 * Sanitizar objeto completo: aplica sanitización recursiva
 * @param obj - Objeto a sanitizar
 * @returns Objeto con valores sanitizados
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      result[key] = null
    } else if (typeof value === 'string') {
      result[key] = sanitizeString(value)
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }

  return result as T
}

/**
 * Palabras que NO deben capitalizarse en nombres propios en español
 * (excepto si son la primera palabra)
 */
const PALABRAS_MINUSCULAS_ES = new Set([
  'de',
  'del',
  'la',
  'las',
  'los',
  'el',
  'y',
  'e',
  'o',
  'u',
  'a',
  'al',
  'con',
  'en',
  'por',
  'para',
  'sin',
  'sobre',
])

function capitalizarPalabra(word: string): string {
  // Maneja palabras con guion: "Ana-Maria" → "Ana-Maria"
  return word
    .split('-')
    .map(part =>
      part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
    )
    .join('-')
}

/**
 * Formatear nombre propio con Title Case inteligente en español.
 * Capitaliza la primera letra de cada palabra excepto preposiciones y artículos.
 * Siempre capitaliza la primera palabra.
 *
 * @example
 * formatNombrePropio("JUAN PABLO")          → "Juan Pablo"
 * formatNombrePropio("maria de los angeles") → "Maria de los Angeles"
 * formatNombrePropio("ana-maria")            → "Ana-Maria"
 * formatNombrePropio("juan de dios")         → "Juan de Dios"
 *
 * @param value - Nombre a formatear
 * @returns Nombre formateado o null si está vacío
 */
export function formatNombrePropio(
  value: string | null | undefined
): string | null {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  if (trimmed === '') return null

  const palabras = trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 0)

  return palabras
    .map((word, index) => {
      if (index === 0) return capitalizarPalabra(word)
      if (PALABRAS_MINUSCULAS_ES.has(word)) return word
      return capitalizarPalabra(word)
    })
    .join(' ')
}

/**
 * Remover campos con valores null/undefined de un objeto
 * Útil para updates parciales donde solo quieres enviar campos modificados
 * @param obj - Objeto a limpiar
 * @returns Objeto sin campos null/undefined
 */
export function removeNullish<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      result[key] = value
    }
  }

  return result as Partial<T>
}
