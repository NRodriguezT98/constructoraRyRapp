import { describe, expect, it } from 'vitest'

import {
  formatearDocumentoCompleto,
  formatearNumeroDocumento,
  SIGLAS_DOCUMENTO,
} from './documento.utils'

describe('SIGLAS_DOCUMENTO', () => {
  it('should have correct sigla for CC', () => {
    expect(SIGLAS_DOCUMENTO['CC']).toBe('C.C')
  })

  it('should have correct sigla for CE', () => {
    expect(SIGLAS_DOCUMENTO['CE']).toBe('C.E')
  })

  it('should have correct sigla for TI', () => {
    expect(SIGLAS_DOCUMENTO['TI']).toBe('T.I')
  })

  it('should have correct sigla for NIT', () => {
    expect(SIGLAS_DOCUMENTO['NIT']).toBe('NIT')
  })

  it('should have correct sigla for PP', () => {
    expect(SIGLAS_DOCUMENTO['PP']).toBe('P.P')
  })

  it('should have correct sigla for PEP', () => {
    expect(SIGLAS_DOCUMENTO['PEP']).toBe('P.E.P')
  })
})

describe('formatearNumeroDocumento', () => {
  it('should format 8-digit number with dots', () => {
    expect(formatearNumeroDocumento('12345678')).toBe('12.345.678')
  })

  it('should format 7-digit number with dots', () => {
    expect(formatearNumeroDocumento('1234567')).toBe('1.234.567')
  })

  it('should extract only digits from mixed input', () => {
    expect(formatearNumeroDocumento('ABC123456')).toBe('123.456')
  })

  it('should handle number without formatting needed (3 digits)', () => {
    expect(formatearNumeroDocumento('123')).toBe('123')
  })

  it('should handle exactly 4 digits', () => {
    expect(formatearNumeroDocumento('1000')).toBe('1.000')
  })

  it('should handle 9-digit number', () => {
    expect(formatearNumeroDocumento('123456789')).toBe('123.456.789')
  })

  it('should return empty string for input with no digits', () => {
    expect(formatearNumeroDocumento('ABC')).toBe('')
  })
})

describe('formatearDocumentoCompleto', () => {
  it('should format CC correctly', () => {
    expect(formatearDocumentoCompleto('CC', '12345678')).toBe('C.C 12.345.678')
  })

  it('should format CE correctly', () => {
    expect(formatearDocumentoCompleto('CE', '1234567')).toBe('C.E 1.234.567')
  })

  it('should format PEP correctly', () => {
    expect(formatearDocumentoCompleto('PEP', '1234567')).toBe('P.E.P 1.234.567')
  })

  it('should format PP with alphanumeric input (extracts digits)', () => {
    expect(formatearDocumentoCompleto('PP', 'ABC123456')).toBe('P.P 123.456')
  })

  it('should use DOC as fallback for unknown type', () => {
    expect(formatearDocumentoCompleto('UNKNOWN', '12345678')).toBe(
      'DOC 12.345.678'
    )
  })
})
