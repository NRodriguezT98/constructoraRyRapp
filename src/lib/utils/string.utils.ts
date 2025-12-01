/**
 * Utilidades para formateo de strings
 */

/**
 * Convierte un string a Title Case (capitalización de nombres propios)
 * Primera letra de cada palabra en mayúscula, resto en minúsculas
 *
 * @param str - String a formatear
 * @returns String en Title Case
 *
 * @example
 * toTitleCase("JUAN CARLOS PÉREZ") // → "Juan Carlos Pérez"
 * toTitleCase("pedro rodriguez") // → "Pedro Rodriguez"
 * toTitleCase("MARÍA DE LOS ÁNGELES") // → "María De Los Ángeles"
 */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return ''

  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Formatea un nombre completo para visualización
 * Aplica Title Case y limpia espacios extras
 *
 * @param nombre - Nombre a formatear
 * @returns Nombre formateado
 */
export function formatNombreCompleto(nombre: string | null | undefined): string {
  if (!nombre) return ''

  // Limpiar espacios extras y aplicar Title Case
  return toTitleCase(nombre.trim().replace(/\s+/g, ' '))
}

/**
 * Formatea nombres y apellidos por separado y los concatena
 *
 * @param nombres - Nombres del cliente
 * @param apellidos - Apellidos del cliente
 * @returns Nombre completo formateado
 */
export function formatNombreApellido(
  nombres: string | null | undefined,
  apellidos: string | null | undefined
): string {
  const nombresFormatted = toTitleCase(nombres)
  const apellidosFormatted = toTitleCase(apellidos)

  return `${nombresFormatted} ${apellidosFormatted}`.trim()
}
