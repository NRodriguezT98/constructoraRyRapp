/**
 * ============================================
 * UTILIDADES DE FORMATEO DE DOCUMENTOS
 * ============================================
 *
 * Funciones para formatear documentos de identidad:
 * - Siglas de tipos de documento
 * - Formato con puntos de mil
 */

/**
 * Mapeo de tipos de documento a siglas
 * ✅ KEYS coinciden con TipoDocumento: 'CC' | 'CE' | 'TI' | 'NIT' | 'PP' | 'PEP'
 */
export const SIGLAS_DOCUMENTO: Record<string, string> = {
  CC: 'C.C',    // Cédula de Ciudadanía
  CE: 'C.E',    // Cédula de Extranjería
  TI: 'T.I',    // Tarjeta de Identidad
  NIT: 'NIT',   // NIT
  PP: 'P.P',    // Pasaporte
  PEP: 'P.E.P', // Permiso Especial de Permanencia
}

/**
 * Formatea un número de documento con puntos de mil
 *
 * @example
 * formatearNumeroDocumento("12345678") → "12.345.678"
 * formatearNumeroDocumento("1234567") → "1.234.567"
 * formatearNumeroDocumento("ABC123456") → "123.456"
 */
export function formatearNumeroDocumento(numero: string): string {
  // Extraer solo números
  const soloNumeros = numero.replace(/\D/g, '')

  // Agregar puntos cada 3 dígitos desde la derecha
  return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Formatea un documento completo con siglas y número
 *
 * @example
 * formatearDocumentoCompleto("CC", "12345678") → "C.C 12.345.678"
 * formatearDocumentoCompleto("PP", "ABC123456") → "P.P 123.456"
 * formatearDocumentoCompleto("PEP", "1234567") → "P.E.P 1.234.567"
 */
export function formatearDocumentoCompleto(
  tipoDocumento: string,
  numeroDocumento: string
): string {
  const sigla = SIGLAS_DOCUMENTO[tipoDocumento] || 'DOC'
  const numeroFormateado = formatearNumeroDocumento(numeroDocumento)

  return `${sigla} ${numeroFormateado}`
}
