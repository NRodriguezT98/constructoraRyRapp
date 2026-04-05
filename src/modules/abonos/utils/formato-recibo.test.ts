import { describe, expect, it } from 'vitest'

import { formatearNumeroRecibo } from './formato-recibo'

describe('formatearNumeroRecibo', () => {
  it('should format 1 as RYR-0001', () => {
    expect(formatearNumeroRecibo(1)).toBe('RYR-0001')
  })

  it('should format 42 as RYR-0042', () => {
    expect(formatearNumeroRecibo(42)).toBe('RYR-0042')
  })

  it('should format 100 as RYR-0100', () => {
    expect(formatearNumeroRecibo(100)).toBe('RYR-0100')
  })

  it('should format 1000 as RYR-1000', () => {
    expect(formatearNumeroRecibo(1000)).toBe('RYR-1000')
  })

  it('should format numbers larger than 4 digits without truncation', () => {
    expect(formatearNumeroRecibo(99999)).toBe('RYR-99999')
  })

  it('should always start with RYR- prefix', () => {
    expect(formatearNumeroRecibo(7)).toMatch(/^RYR-/)
  })
})
