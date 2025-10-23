/**
 * 📅 Utilidades de Fecha - RyR Constructora
 *
 * Funciones centralizadas para manejo consistente de fechas
 * en toda la aplicación, evitando problemas de zona horaria.
 *
 * @module date.utils
 */

/**
 * Convierte una fecha del input (YYYY-MM-DD) a formato ISO con hora del mediodía
 * para evitar cambios de día por conversión de zona horaria.
 *
 * @param dateString - Fecha en formato YYYY-MM-DD (ej: "2025-10-23")
 * @returns Fecha en formato ISO con hora 12:00:00 (ej: "2025-10-23T12:00:00")
 *
 * @example
 * ```ts
 * const fecha = formatDateForDB("2025-10-23")
 * // → "2025-10-23T12:00:00"
 * // Guardar en DB: timestamp será siempre el día correcto
 * ```
 */
export function formatDateForDB(dateString: string): string {
  if (!dateString) return ''

  // Si ya tiene hora, retornar tal cual
  if (dateString.includes('T')) return dateString

  // Agregar hora del mediodía para evitar problemas de zona horaria
  return `${dateString}T12:00:00`
}

/**
 * Formatea una fecha de la DB para mostrar en la UI (solo día, mes, año)
 *
 * @param dateString - Fecha en formato ISO o timestamp de la DB
 * @param options - Opciones de formato (por defecto: día, mes largo, año)
 * @returns Fecha formateada en español colombiano
 *
 * @example
 * ```ts
 * formatDateForDisplay("2025-10-23T12:00:00")
 * // → "23 de octubre de 2025"
 *
 * formatDateForDisplay("2025-10-23", { month: 'short' })
 * // → "23 oct 2025"
 * ```
 */
export function formatDateForDisplay(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return ''

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota', // Zona horaria de Colombia
  }

  const finalOptions = { ...defaultOptions, ...options }

  return new Date(dateString).toLocaleDateString('es-CO', finalOptions)
}

/**
 * Formatea una fecha con hora completa para mostrar en la UI
 *
 * @param dateString - Fecha en formato ISO o timestamp de la DB
 * @returns Fecha y hora formateada en español colombiano
 *
 * @example
 * ```ts
 * formatDateTimeForDisplay("2025-10-23T14:30:00")
 * // → "23 de octubre de 2025, 02:30 p.m."
 * ```
 */
export function formatDateTimeForDisplay(dateString: string): string {
  if (!dateString) return ''

  return new Date(dateString).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  })
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (para inputs date)
 *
 * @returns Fecha de hoy en formato YYYY-MM-DD
 *
 * @example
 * ```ts
 * getTodayDateString()
 * // → "2025-10-23"
 * ```
 */
export function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Convierte una fecha de la DB a formato YYYY-MM-DD (para inputs date)
 *
 * @param dateString - Fecha en formato ISO o timestamp de la DB
 * @returns Fecha en formato YYYY-MM-DD
 *
 * @example
 * ```ts
 * formatDateForInput("2025-10-23T12:00:00")
 * // → "2025-10-23"
 * ```
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Calcula la diferencia en días entre dos fechas
 *
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns Número de días de diferencia (positivo o negativo)
 *
 * @example
 * ```ts
 * getDaysDifference("2025-10-23", "2025-10-20")
 * // → 3
 * ```
 */
export function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d1.getTime() - d2.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Valida si una fecha es válida
 *
 * @param dateString - Fecha a validar
 * @returns true si la fecha es válida, false si no
 *
 * @example
 * ```ts
 * isValidDate("2025-10-23") // → true
 * isValidDate("2025-13-45") // → false
 * isValidDate("invalid")     // → false
 * ```
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Formatea una fecha relativa (hace X días, hace X meses, etc.)
 *
 * @param dateString - Fecha a formatear
 * @returns Texto relativo (ej: "hace 2 días", "hace 1 mes")
 *
 * @example
 * ```ts
 * formatRelativeDate("2025-10-21") // Hoy es 23 oct
 * // → "hace 2 días"
 * ```
 */
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffYear > 0) return `hace ${diffYear} ${diffYear === 1 ? 'año' : 'años'}`
  if (diffMonth > 0) return `hace ${diffMonth} ${diffMonth === 1 ? 'mes' : 'meses'}`
  if (diffDay > 0) return `hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`
  if (diffHour > 0) return `hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`
  if (diffMin > 0) return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`

  return 'hace un momento'
}
