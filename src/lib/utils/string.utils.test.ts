import { describe, expect, it } from 'vitest'

import {
  formatNombreApellido,
  formatNombreCompleto,
  toTitleCase,
} from './string.utils'

describe('toTitleCase', () => {
  it('should return empty string for null', () => {
    expect(toTitleCase(null)).toBe('')
  })

  it('should return empty string for undefined', () => {
    expect(toTitleCase(undefined)).toBe('')
  })

  it('should return empty string for empty string', () => {
    expect(toTitleCase('')).toBe('')
  })

  it('should capitalize first letter of each word', () => {
    expect(toTitleCase('juan carlos pérez')).toBe('Juan Carlos Pérez')
  })

  it('should lowercase all-caps input', () => {
    expect(toTitleCase('JUAN CARLOS PÉREZ')).toBe('Juan Carlos Pérez')
  })

  it('should handle single word', () => {
    expect(toTitleCase('PEDRO')).toBe('Pedro')
  })

  it('should handle mixed case', () => {
    expect(toTitleCase('mArIa JOSE')).toBe('Maria Jose')
  })

  it('should preserve spaces between words', () => {
    expect(toTitleCase('DE LOS ÁNGELES')).toBe('De Los Ángeles')
  })
})

describe('formatNombreCompleto', () => {
  it('should return empty string for null', () => {
    expect(formatNombreCompleto(null)).toBe('')
  })

  it('should return empty string for undefined', () => {
    expect(formatNombreCompleto(undefined)).toBe('')
  })

  it('should trim leading/trailing spaces', () => {
    expect(formatNombreCompleto('  juan perez  ')).toBe('Juan Perez')
  })

  it('should collapse multiple spaces to single space', () => {
    expect(formatNombreCompleto('juan   perez')).toBe('Juan Perez')
  })

  it('should apply title case', () => {
    expect(formatNombreCompleto('CARLOS ANDRÉS RODRÍGUEZ')).toBe(
      'Carlos Andrés Rodríguez'
    )
  })
})

describe('formatNombreApellido', () => {
  it('should return empty string when both null', () => {
    expect(formatNombreApellido(null, null)).toBe('')
  })

  it('should return only nombres when apellidos is null', () => {
    expect(formatNombreApellido('CARLOS', null)).toBe('Carlos')
  })

  it('should return only apellidos when nombres is null', () => {
    expect(formatNombreApellido(null, 'RODRÍGUEZ')).toBe('Rodríguez')
  })

  it('should concatenate nombres and apellidos with space', () => {
    expect(formatNombreApellido('CARLOS ANDRÉS', 'RODRÍGUEZ LÓPEZ')).toBe(
      'Carlos Andrés Rodríguez López'
    )
  })

  it('should apply title case to both parts', () => {
    expect(formatNombreApellido('juan', 'perez')).toBe('Juan Perez')
  })

  it('should trim the result', () => {
    expect(formatNombreApellido('', 'PÉREZ')).toBe('Pérez')
  })
})
