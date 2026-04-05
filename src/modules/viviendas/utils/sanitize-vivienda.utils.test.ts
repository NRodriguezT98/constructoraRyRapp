import { describe, expect, it } from 'vitest'

import type { ViviendaFormData } from '../types'

import {
  sanitizeViviendaFormData,
  sanitizeViviendaUpdate,
} from './sanitize-vivienda.utils'

const baseVivienda: ViviendaFormData = {
  proyecto_id: 'proj-1',
  manzana_id: 'manz-1',
  numero: 'V-001',
  lindero_norte: 'Calle 1',
  lindero_sur: 'Calle 2',
  lindero_oriente: 'Carrera 1',
  lindero_occidente: 'Carrera 2',
  matricula_inmobiliaria: 'MAT-001',
  nomenclatura: 'CASA-001',
  area_lote: 120,
  area_construida: 85,
  tipo_vivienda: 'Regular',
  valor_base: 250000000,
  es_esquinera: false,
  recargo_esquinera: 0,
}

describe('sanitizeViviendaFormData', () => {
  it('should keep required IDs unchanged', () => {
    const result = sanitizeViviendaFormData(baseVivienda)
    expect(result.proyecto_id).toBe('proj-1')
    expect(result.manzana_id).toBe('manz-1')
  })

  it('should trim whitespace from numero', () => {
    const result = sanitizeViviendaFormData({
      ...baseVivienda,
      numero: '  V-002  ',
    })
    expect(result.numero).toBe('V-002')
  })

  it('should trim whitespace from lindero fields', () => {
    const result = sanitizeViviendaFormData({
      ...baseVivienda,
      lindero_norte: '  Al norte  ',
      lindero_sur: '  Al sur  ',
    })
    expect(result.lindero_norte).toBe('Al norte')
    expect(result.lindero_sur).toBe('Al sur')
  })

  it('should return empty string for empty lindero fields', () => {
    const result = sanitizeViviendaFormData({
      ...baseVivienda,
      lindero_norte: '',
      lindero_oriente: '   ',
    })
    expect(result.lindero_norte).toBe('')
    expect(result.lindero_oriente).toBe('')
  })

  it('should trim matricula_inmobiliaria and nomenclatura', () => {
    const result = sanitizeViviendaFormData({
      ...baseVivienda,
      matricula_inmobiliaria: '  MAT-999  ',
      nomenclatura: '  NOM-1  ',
    })
    expect(result.matricula_inmobiliaria).toBe('MAT-999')
    expect(result.nomenclatura).toBe('NOM-1')
  })

  it('should preserve numeric fields unchanged', () => {
    const result = sanitizeViviendaFormData(baseVivienda)
    expect(result.area_lote).toBe(120)
    expect(result.area_construida).toBe(85)
    expect(result.valor_base).toBe(250000000)
    expect(result.es_esquinera).toBe(false)
    expect(result.recargo_esquinera).toBe(0)
  })

  it('should preserve tipo_vivienda unchanged', () => {
    const result = sanitizeViviendaFormData(baseVivienda)
    expect(result.tipo_vivienda).toBe('Regular')
  })
})

describe('sanitizeViviendaUpdate', () => {
  it('should return empty object for empty input', () => {
    const result = sanitizeViviendaUpdate({})
    expect(result).toEqual({})
  })

  it('should only include fields that are present', () => {
    const result = sanitizeViviendaUpdate({ numero: 'V-100' })
    expect(result.numero).toBe('V-100')
    expect(result.proyecto_id).toBeUndefined()
    expect(result.lindero_norte).toBeUndefined()
  })

  it('should trim numero when provided', () => {
    const result = sanitizeViviendaUpdate({ numero: '  V-200  ' })
    expect(result.numero).toBe('V-200')
  })

  it('should sanitize empty lindero to undefined in update', () => {
    const result = sanitizeViviendaUpdate({ lindero_norte: '' })
    expect(result.lindero_norte).toBeUndefined()
  })

  it('should trim lindero fields in update', () => {
    const result = sanitizeViviendaUpdate({
      lindero_sur: '  Al sur  ',
      lindero_occidente: '  Al oeste  ',
    })
    expect(result.lindero_sur).toBe('Al sur')
    expect(result.lindero_occidente).toBe('Al oeste')
  })

  it('should sanitize empty matricula to undefined', () => {
    const result = sanitizeViviendaUpdate({ matricula_inmobiliaria: '' })
    expect(result.matricula_inmobiliaria).toBeUndefined()
  })

  it('should preserve numeric fields in update', () => {
    const result = sanitizeViviendaUpdate({
      area_lote: 150,
      valor_base: 300000000,
      es_esquinera: true,
    })
    expect(result.area_lote).toBe(150)
    expect(result.valor_base).toBe(300000000)
    expect(result.es_esquinera).toBe(true)
  })

  it('should keep proyecto_id when provided and non-empty', () => {
    const result = sanitizeViviendaUpdate({ proyecto_id: 'proj-99' })
    expect(result.proyecto_id).toBe('proj-99')
  })
})
