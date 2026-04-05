import { describe, expect, it } from 'vitest'

import { formatCurrency, formatFileSize } from './format.utils'

describe('formatFileSize', () => {
  it('should return "0 B" for null', () => {
    expect(formatFileSize(null)).toBe('0 B')
  })

  it('should return "0 B" for undefined', () => {
    expect(formatFileSize(undefined)).toBe('0 B')
  })

  it('should return "0 B" for 0', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('should return "0 B" for negative values', () => {
    expect(formatFileSize(-100)).toBe('0 B')
  })

  it('should return "0 B" for NaN', () => {
    expect(formatFileSize(NaN)).toBe('0 B')
  })

  it('should format bytes correctly', () => {
    expect(formatFileSize(512)).toBe('512 B')
  })

  it('should format kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB')
  })

  it('should format megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB')
  })

  it('should format gigabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB')
  })

  it('should format fractional megabytes correctly', () => {
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.50 MB')
  })

  it('should format 350 KB', () => {
    expect(formatFileSize(350 * 1024)).toBe('350.00 KB')
  })
})

describe('formatCurrency', () => {
  it('should return "$0" for null', () => {
    expect(formatCurrency(null).replace(/\s/g, '')).toBe('$0')
  })

  it('should return "$0" for undefined', () => {
    expect(formatCurrency(undefined).replace(/\s/g, '')).toBe('$0')
  })

  it('should return "$0" for NaN', () => {
    expect(formatCurrency(NaN).replace(/\s/g, '')).toBe('$0')
  })

  it('should return "$0" for 0', () => {
    const result = formatCurrency(0)
    expect(result.replace(/\s/g, '')).toBe('$0')
  })

  it('should format positive integer', () => {
    const result = formatCurrency(150000000)
    // Intl.NumberFormat may use different non-breaking spaces depending on locale
    expect(result).toMatch(/\$\s*150[.\s]000[.\s]000/)
  })

  it('should format small amount', () => {
    const result = formatCurrency(1000)
    expect(result).toMatch(/\$\s*1[.\s]000/)
  })

  it('should handle negative value', () => {
    const result = formatCurrency(-50000)
    expect(result).toContain('50')
    expect(result).toContain('000')
  })
})
