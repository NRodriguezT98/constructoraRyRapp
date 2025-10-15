import { FORMATO_MONEDA, REGEX_PATTERNS, VIVIENDA_LIMITES } from '../constants'

/**
 * Utilidades para el módulo Viviendas
 */

// ============================================
// FORMATO DE MONEDA
// ============================================

/**
 * Formatea un número como peso colombiano
 * @example formatCurrency(150000000) // "$150.000.000"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(FORMATO_MONEDA.locale, FORMATO_MONEDA.options).format(value)
}

/**
 * Parsea un string de moneda a número
 * @example parseCurrency("$150.000.000") // 150000000
 */
export function parseCurrency(value: string): number {
  // Remover símbolos de moneda y separadores
  const cleanValue = value.replace(/[^0-9]/g, '')
  return parseInt(cleanValue, 10) || 0
}

/**
 * Formatea un input de moneda mientras el usuario escribe
 * @example formatCurrencyInput("150000000") // "$ 150.000.000"
 */
export function formatCurrencyInput(value: string): string {
  const numericValue = parseCurrency(value)
  if (numericValue === 0) return ''
  return formatCurrency(numericValue)
}

// ============================================
// CÁLCULOS FINANCIEROS
// ============================================

/**
 * Calcula el valor total de una vivienda
 */
export function calcularValorTotal(
  valorBase: number,
  gastosNotariales: number,
  recargoEsquinera: number
): number {
  return valorBase + gastosNotariales + recargoEsquinera
}

/**
 * Calcula el porcentaje que representa un monto sobre el total
 */
export function calcularPorcentaje(monto: number, total: number): number {
  if (total === 0) return 0
  return Math.round((monto / total) * 100)
}

// ============================================
// VALIDACIÓN DE CAMPOS
// ============================================

/**
 * Valida un campo de lindero
 * Permite: letras, números, espacios, comas, puntos, paréntesis, punto y coma, acentos
 */
export const validarLindero = (valor: string): string | null => {
  if (!valor || valor.trim().length === 0) {
    return 'Este campo es obligatorio'
  }

  if (valor.trim().length < VIVIENDA_LIMITES.LINDERO_MIN) {
    return `Mínimo ${VIVIENDA_LIMITES.LINDERO_MIN} caracteres`
  }

  if (valor.length > VIVIENDA_LIMITES.LINDERO_MAX) {
    return `Máximo ${VIVIENDA_LIMITES.LINDERO_MAX} caracteres`
  }

  if (!REGEX_PATTERNS.LINDERO.test(valor)) {
    return 'Solo se permiten letras, números, espacios, comas, puntos, paréntesis y punto y coma'
  }

  return null
}

/**
 * Valida matrícula inmobiliaria
 * Formato: 373-123456 (números y guiones)
 */
export const validarMatricula = (valor: string): string | null => {
  if (!valor || valor.trim().length === 0) {
    return 'La matrícula inmobiliaria es obligatoria'
  }

  if (valor.length < VIVIENDA_LIMITES.MATRICULA_MIN) {
    return `Mínimo ${VIVIENDA_LIMITES.MATRICULA_MIN} caracteres`
  }

  if (valor.length > VIVIENDA_LIMITES.MATRICULA_MAX) {
    return `Máximo ${VIVIENDA_LIMITES.MATRICULA_MAX} caracteres`
  }

  if (!REGEX_PATTERNS.MATRICULA.test(valor)) {
    return 'Solo se permiten números y guiones (Ej: 373-123456)'
  }

  return null
}

/**
 * Valida nomenclatura
 * Formato: Calle 4A Sur # 4 - 05 (letras, números, #, -, espacios, puntos)
 */
export const validarNomenclatura = (valor: string): string | null => {
  if (!valor || valor.trim().length === 0) {
    return 'La nomenclatura es obligatoria'
  }

  if (valor.trim().length < VIVIENDA_LIMITES.NOMENCLATURA_MIN) {
    return `Mínimo ${VIVIENDA_LIMITES.NOMENCLATURA_MIN} caracteres`
  }

  if (valor.length > VIVIENDA_LIMITES.NOMENCLATURA_MAX) {
    return `Máximo ${VIVIENDA_LIMITES.NOMENCLATURA_MAX} caracteres`
  }

  if (!REGEX_PATTERNS.NOMENCLATURA.test(valor)) {
    return 'Solo se permiten letras, números, #, -, espacios y puntos'
  }

  return null
}

/**
 * Valida área (lote o construida)
 * Formato: números con hasta 2 decimales (Ej: 61.00)
 */
export const validarArea = (valor: number | string, tipo: 'lote' | 'construida'): string | null => {
  const valorStr = String(valor)

  if (!valorStr || valorStr.trim() === '') {
    return `El área ${tipo === 'lote' ? 'del lote' : 'construida'} es obligatoria`
  }

  if (!REGEX_PATTERNS.AREA.test(valorStr)) {
    return 'Solo se permiten números con hasta 2 decimales (Ej: 61.00)'
  }

  const valorNum = parseFloat(valorStr)

  if (isNaN(valorNum)) {
    return 'Valor inválido'
  }

  if (valorNum < VIVIENDA_LIMITES.AREA_MIN) {
    return `El área mínima es ${VIVIENDA_LIMITES.AREA_MIN} m²`
  }

  if (valorNum > VIVIENDA_LIMITES.AREA_MAX) {
    return `El área máxima es ${VIVIENDA_LIMITES.AREA_MAX} m²`
  }

  return null
}

/**
 * Valida valor base de casa
 * Solo números enteros (sin decimales ni puntos ni comas)
 */
export const validarValorBase = (valor: number | string): string | null => {
  const valorStr = String(valor)

  if (!valorStr || valorStr.trim() === '') {
    return 'El valor base es obligatorio'
  }

  if (!REGEX_PATTERNS.VALOR_BASE.test(valorStr)) {
    return 'Solo se permiten números enteros (sin decimales ni puntos)'
  }

  const valorNum = parseInt(valorStr, 10)

  if (isNaN(valorNum)) {
    return 'Valor inválido'
  }

  if (valorNum < VIVIENDA_LIMITES.VALOR_BASE_MIN) {
    return `El valor mínimo es ${formatCurrency(VIVIENDA_LIMITES.VALOR_BASE_MIN)}`
  }

  if (valorNum > VIVIENDA_LIMITES.VALOR_BASE_MAX) {
    return `El valor máximo es ${formatCurrency(VIVIENDA_LIMITES.VALOR_BASE_MAX)}`
  }

  return null
}

// ============================================
// UTILIDADES DE TEXTO
// ============================================

/**
 * Genera el texto descriptivo de viviendas disponibles
 */
export function generarTextoDisponibilidad(
  manzanaNombre: string,
  totalViviendas: number,
  viviendasCreadas: number,
  viviendasDisponibles: number
): string {
  if (viviendasDisponibles === 0) {
    return `La manzana ${manzanaNombre} tiene todas sus ${totalViviendas} viviendas creadas`
  }

  if (viviendasDisponibles === 1) {
    return `La manzana ${manzanaNombre} tiene 1 vivienda disponible (última)`
  }

  return `La manzana ${manzanaNombre} tiene ${viviendasDisponibles} viviendas disponibles de ${totalViviendas}`
}

/**
 * Genera el label para el número de vivienda
 */
export function generarLabelVivienda(
  numeroVivienda: number,
  esUltima: boolean
): string {
  return `Vivienda #${numeroVivienda}${esUltima ? ' (Última disponible)' : ''}`
}

// ============================================
// VALIDACIÓN DE ARCHIVOS
// ============================================

/**
 * Valida un archivo PDF
 */
export function validarArchivoPDF(file: File): { valido: boolean; mensaje?: string } {
  // Validar tipo
  if (!file.type.includes('pdf')) {
    return { valido: false, mensaje: 'El archivo debe ser un PDF' }
  }

  // Validar tamaño (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valido: false, mensaje: 'El archivo no debe superar 10MB' }
  }

  return { valido: true }
}

// ============================================
// HELPERS DE DATOS
// ============================================

/**
 * Filtra manzanas que tienen viviendas disponibles
 */
export function filtrarManzanasDisponibles<T extends { viviendas_disponibles: number }>(
  manzanas: T[]
): T[] {
  return manzanas.filter((m) => m.viviendas_disponibles > 0)
}

/**
 * Ordena proyectos por nombre
 */
export function ordenarProyectosPorNombre<T extends { nombre: string }>(
  proyectos: T[]
): T[] {
  return [...proyectos].sort((a, b) => a.nombre.localeCompare(b.nombre))
}

/**
 * Ordena manzanas por nombre (alfabético/numérico)
 */
export function ordenarManzanasPorNombre<T extends { nombre: string }>(
  manzanas: T[]
): T[] {
  return [...manzanas].sort((a, b) => {
    // Intenta comparar como números primero
    const aNum = parseInt(a.nombre, 10)
    const bNum = parseInt(b.nombre, 10)

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum
    }

    // Si no son números, compara como strings
    return a.nombre.localeCompare(b.nombre)
  })
}
