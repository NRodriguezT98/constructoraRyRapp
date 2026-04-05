import { describe, expect, it } from 'vitest'

import {
  formatNombrePropio,
  sanitizeDate,
  sanitizeEnum,
  sanitizeObject,
  sanitizeString,
} from './sanitize.utils'

// ============================================================
// sanitizeString
// ============================================================

describe('sanitizeString', () => {
  it('retorna null para null', () => {
    expect(sanitizeString(null)).toBeNull()
  })

  it('retorna null para undefined', () => {
    expect(sanitizeString(undefined)).toBeNull()
  })

  it('retorna null para string vacío', () => {
    expect(sanitizeString('')).toBeNull()
  })

  it('retorna null para string solo espacios', () => {
    expect(sanitizeString('   ')).toBeNull()
  })

  it('retorna string trimmed para valor válido', () => {
    expect(sanitizeString('  Hola  ')).toBe('Hola')
  })

  it('retorna string tal cual si no tiene espacios', () => {
    expect(sanitizeString('Bogotá')).toBe('Bogotá')
  })
})

// ============================================================
// sanitizeDate
// ============================================================

describe('sanitizeDate', () => {
  it('retorna null para null', () => {
    expect(sanitizeDate(null)).toBeNull()
  })

  it('retorna null para undefined', () => {
    expect(sanitizeDate(undefined)).toBeNull()
  })

  it('retorna null para string vacío', () => {
    expect(sanitizeDate('')).toBeNull()
  })

  it('retorna null para string solo espacios', () => {
    expect(sanitizeDate('   ')).toBeNull()
  })

  it('retorna null para fecha inválida', () => {
    expect(sanitizeDate('no-es-fecha')).toBeNull()
  })

  it('retorna la fecha para formato YYYY-MM-DD válido', () => {
    expect(sanitizeDate('2025-10-23')).toBe('2025-10-23')
  })

  it('retorna el valor para timestamp ISO válido', () => {
    expect(sanitizeDate('2025-10-23T12:00:00')).toBe('2025-10-23T12:00:00')
  })
})

// ============================================================
// sanitizeEnum
// ============================================================

describe('sanitizeEnum', () => {
  const validValues = ['Activo', 'Inactivo', 'Pendiente'] as const

  it('retorna null para null', () => {
    expect(sanitizeEnum(null, validValues)).toBeNull()
  })

  it('retorna null para undefined', () => {
    expect(sanitizeEnum(undefined, validValues)).toBeNull()
  })

  it('retorna null para string vacío', () => {
    expect(sanitizeEnum('', validValues)).toBeNull()
  })

  it('retorna null para valor no permitido', () => {
    expect(sanitizeEnum('Cerrado', validValues)).toBeNull()
  })

  it('retorna el valor si es válido', () => {
    expect(sanitizeEnum('Activo', validValues)).toBe('Activo')
  })

  it('retorna el valor trimmed si es válido', () => {
    expect(sanitizeEnum('  Inactivo  ', validValues)).toBe('Inactivo')
  })
})

// ============================================================
// formatNombrePropio
// ============================================================

describe('formatNombrePropio', () => {
  it('retorna null para null', () => {
    expect(formatNombrePropio(null)).toBeNull()
  })

  it('retorna null para undefined', () => {
    expect(formatNombrePropio(undefined)).toBeNull()
  })

  it('retorna null para string vacío', () => {
    expect(formatNombrePropio('')).toBeNull()
  })

  it('capitaliza nombre simple', () => {
    expect(formatNombrePropio('juan')).toBe('Juan')
  })

  it('capitaliza nombre compuesto en MAYÚSCULAS', () => {
    expect(formatNombrePropio('JUAN PABLO')).toBe('Juan Pablo')
  })

  it('mantiene preposiciones en minúscula', () => {
    expect(formatNombrePropio('maria de los angeles')).toBe(
      'Maria de los Angeles'
    )
  })

  it('capitaliza la primera palabra aunque sea preposición', () => {
    expect(formatNombrePropio('de la rosa')).toBe('De la Rosa')
  })

  it('maneja nombres con guion', () => {
    expect(formatNombrePropio('ana-maria')).toBe('Ana-Maria')
  })

  it('maneja apellido compuesto con "del"', () => {
    expect(formatNombrePropio('juan del campo')).toBe('Juan del Campo')
  })

  it('normaliza espacios múltiples', () => {
    expect(formatNombrePropio('  carlos   Alberto  ')).toBe('Carlos Alberto')
  })
})

// ============================================================
// sanitizeObject
// ============================================================

describe('sanitizeObject', () => {
  it('convierte strings vacíos a null', () => {
    const result = sanitizeObject({ nombre: '', ciudad: 'Bogotá' })
    expect(result.nombre).toBeNull()
    expect(result.ciudad).toBe('Bogotá')
  })

  it('mantiene null como null', () => {
    const result = sanitizeObject({ campo: null })
    expect(result.campo).toBeNull()
  })

  it('trimea strings con espacios', () => {
    const result = sanitizeObject({ nombre: '  Pedro  ' })
    expect(result.nombre).toBe('Pedro')
  })

  it('no modifica números ni booleanos', () => {
    const result = sanitizeObject({ edad: 30, activo: true })
    expect(result.edad).toBe(30)
    expect(result.activo).toBe(true)
  })
})
