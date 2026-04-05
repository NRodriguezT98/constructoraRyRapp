import { describe, expect, it } from 'vitest'

import type { ManzanaFormData, ProyectoFormData } from '../types'

import {
  sanitizeManzanaFormData,
  sanitizeProyectoFormData,
  sanitizeProyectoUpdate,
} from './sanitize-proyecto.utils'

const baseManzana: ManzanaFormData = {
  nombre: 'Manzana A',
  totalViviendas: 10,
  precioBase: 250000000,
  superficieTotal: 1200,
}

const baseProyecto: ProyectoFormData = {
  nombre: 'Residencial El Prado',
  descripcion: 'Proyecto de vivienda',
  departamento: 'Cundinamarca',
  ciudad: 'Bogotá',
  direccion: 'Calle 100 # 15-20',
  fechaInicio: '2025-01-01',
  fechaFinEstimada: '2027-12-31',
  presupuesto: 5000000000,
  estado: 'en_proceso',
  manzanas: [baseManzana],
}

describe('sanitizeManzanaFormData', () => {
  it('should trim nombre', () => {
    const result = sanitizeManzanaFormData({
      ...baseManzana,
      nombre: '  Manzana B  ',
    })
    expect(result.nombre).toBe('Manzana B')
  })

  it('should sanitize empty ubicacion to undefined', () => {
    const result = sanitizeManzanaFormData({ ...baseManzana, ubicacion: '' })
    expect(result.ubicacion).toBeUndefined()
  })

  it('should sanitize spaces-only ubicacion to undefined', () => {
    const result = sanitizeManzanaFormData({ ...baseManzana, ubicacion: '   ' })
    expect(result.ubicacion).toBeUndefined()
  })

  it('should keep valid ubicacion', () => {
    const result = sanitizeManzanaFormData({
      ...baseManzana,
      ubicacion: 'Zona Norte',
    })
    expect(result.ubicacion).toBe('Zona Norte')
  })

  it('should preserve numeric fields', () => {
    const result = sanitizeManzanaFormData(baseManzana)
    expect(result.totalViviendas).toBe(10)
    expect(result.precioBase).toBe(250000000)
    expect(result.superficieTotal).toBe(1200)
  })
})

describe('sanitizeProyectoFormData', () => {
  it('should trim required string fields', () => {
    const result = sanitizeProyectoFormData({
      ...baseProyecto,
      nombre: '  Mi Proyecto  ',
      descripcion: '  Descripción  ',
      ciudad: '  Medellín  ',
    })
    expect(result.nombre).toBe('Mi Proyecto')
    expect(result.descripcion).toBe('Descripción')
    expect(result.ciudad).toBe('Medellín')
  })

  it('should return empty string for empty required string fields', () => {
    const result = sanitizeProyectoFormData({
      ...baseProyecto,
      nombre: '',
      departamento: '   ',
    })
    expect(result.nombre).toBe('')
    expect(result.departamento).toBe('')
  })

  it('should keep valid fechaInicio and fechaFinEstimada', () => {
    const result = sanitizeProyectoFormData(baseProyecto)
    expect(result.fechaInicio).toBe('2025-01-01')
    expect(result.fechaFinEstimada).toBe('2027-12-31')
  })

  it('should sanitize invalid fechaInicio to null', () => {
    const result = sanitizeProyectoFormData({
      ...baseProyecto,
      fechaInicio: 'not-a-date',
    })
    expect(result.fechaInicio).toBeNull()
  })

  it('should preserve null fechas', () => {
    const result = sanitizeProyectoFormData({
      ...baseProyecto,
      fechaInicio: null,
      fechaFinEstimada: null,
    })
    expect(result.fechaInicio).toBeNull()
    expect(result.fechaFinEstimada).toBeNull()
  })

  it('should preserve numeric and estado fields', () => {
    const result = sanitizeProyectoFormData(baseProyecto)
    expect(result.presupuesto).toBe(5000000000)
    expect(result.estado).toBe('en_proceso')
  })

  it('should sanitize manzanas array recursively', () => {
    const result = sanitizeProyectoFormData({
      ...baseProyecto,
      manzanas: [{ ...baseManzana, nombre: '  Manzana A  ', ubicacion: '' }],
    })
    expect(result.manzanas[0].nombre).toBe('Manzana A')
    expect(result.manzanas[0].ubicacion).toBeUndefined()
  })
})

describe('sanitizeProyectoUpdate', () => {
  it('should return empty object for empty input', () => {
    const result = sanitizeProyectoUpdate({})
    expect(result).toEqual({})
  })

  it('should only include fields that are present', () => {
    const result = sanitizeProyectoUpdate({ nombre: 'Nuevo Nombre' })
    expect(result.nombre).toBe('Nuevo Nombre')
    expect(result.ciudad).toBeUndefined()
    expect(result.estado).toBeUndefined()
  })

  it('should trim string fields in update', () => {
    const result = sanitizeProyectoUpdate({
      nombre: '  Proyecto Actualizado  ',
      ciudad: '  Cali  ',
    })
    expect(result.nombre).toBe('Proyecto Actualizado')
    expect(result.ciudad).toBe('Cali')
  })

  it('should sanitize invalid fecha in update to null', () => {
    const result = sanitizeProyectoUpdate({ fechaInicio: 'invalid' })
    expect(result.fechaInicio).toBeNull()
  })

  it('should keep valid fecha in update', () => {
    const result = sanitizeProyectoUpdate({ fechaFinEstimada: '2028-06-30' })
    expect(result.fechaFinEstimada).toBe('2028-06-30')
  })

  it('should preserve presupuesto and estado in update', () => {
    const result = sanitizeProyectoUpdate({
      presupuesto: 9999,
      estado: 'completado',
    })
    expect(result.presupuesto).toBe(9999)
    expect(result.estado).toBe('completado')
  })

  it('should sanitize manzanas in update recursively', () => {
    const result = sanitizeProyectoUpdate({
      manzanas: [{ ...baseManzana, ubicacion: '' }],
    })
    expect(result.manzanas?.[0].ubicacion).toBeUndefined()
  })
})
