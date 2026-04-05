import { describe, expect, it } from 'vitest'

import {
  sanitizeActualizarFuentePagoDTO,
  sanitizeActualizarNegociacionDTO,
  sanitizeCrearFuentePagoDTO,
  sanitizeCrearNegociacionDTO,
} from './sanitize-negociacion.utils'

describe('sanitizeCrearFuentePagoDTO', () => {
  it('should keep valid tipo and monto_aprobado', () => {
    const result = sanitizeCrearFuentePagoDTO({
      tipo: 'Crédito Hipotecario',
      monto_aprobado: 150000,
    })
    expect(result.tipo).toBe('Crédito Hipotecario')
    expect(result.monto_aprobado).toBe(150000)
  })

  it('should trim whitespace from tipo', () => {
    const result = sanitizeCrearFuentePagoDTO({
      tipo: '  Subsidio  ',
      monto_aprobado: 50000,
    })
    expect(result.tipo).toBe('Subsidio')
  })

  it('should fallback monto_aprobado to 0 when NaN', () => {
    const result = sanitizeCrearFuentePagoDTO({
      tipo: 'Cuota Inicial',
      monto_aprobado: NaN,
    })
    expect(result.monto_aprobado).toBe(0)
  })

  it('should sanitize optional empty string fields to undefined', () => {
    const result = sanitizeCrearFuentePagoDTO({
      tipo: 'Cuota Inicial',
      monto_aprobado: 10000,
      entidad: '',
      numero_referencia: '   ',
      carta_asignacion_url: '',
    })
    expect(result.entidad).toBeUndefined()
    expect(result.numero_referencia).toBeUndefined()
    expect(result.carta_asignacion_url).toBeUndefined()
  })

  it('should keep valid optional string fields', () => {
    const result = sanitizeCrearFuentePagoDTO({
      tipo: 'Crédito',
      monto_aprobado: 200000,
      entidad: 'Banco XYZ',
      numero_referencia: 'REF-123',
    })
    expect(result.entidad).toBe('Banco XYZ')
    expect(result.numero_referencia).toBe('REF-123')
  })

  it('should preserve permite_multiples_abonos boolean', () => {
    const resultTrue = sanitizeCrearFuentePagoDTO({
      tipo: 'Crédito',
      monto_aprobado: 100000,
      permite_multiples_abonos: true,
    })
    const resultFalse = sanitizeCrearFuentePagoDTO({
      tipo: 'Crédito',
      monto_aprobado: 100000,
      permite_multiples_abonos: false,
    })
    expect(resultTrue.permite_multiples_abonos).toBe(true)
    expect(resultFalse.permite_multiples_abonos).toBe(false)
  })

  it('should sanitize parametrosCredito when provided', () => {
    const result = sanitizeCrearFuentePagoDTO({
      tipo: 'Crédito',
      monto_aprobado: 100000,
      parametrosCredito: {
        capital: 90000,
        tasaMensual: 0.01,
        numCuotas: 120,
        fechaInicio: '2025-01-01',
        tasaMoraDiaria: 0.001,
      },
    })
    expect(result.parametrosCredito).toBeDefined()
    expect(result.parametrosCredito?.capital).toBe(90000)
    expect(result.parametrosCredito?.numCuotas).toBe(120)
  })

  it('should exclude parametrosCredito when not provided', () => {
    const result = sanitizeCrearFuentePagoDTO({
      tipo: 'Cuota Inicial',
      monto_aprobado: 30000,
    })
    expect(result.parametrosCredito).toBeUndefined()
  })
})

describe('sanitizeCrearNegociacionDTO', () => {
  it('should keep required IDs', () => {
    const result = sanitizeCrearNegociacionDTO({
      cliente_id: 'uuid-cliente',
      vivienda_id: 'uuid-vivienda',
      valor_negociado: 500000,
    })
    expect(result.cliente_id).toBe('uuid-cliente')
    expect(result.vivienda_id).toBe('uuid-vivienda')
  })

  it('should trim whitespace from IDs', () => {
    const result = sanitizeCrearNegociacionDTO({
      cliente_id: '  uuid-1  ',
      vivienda_id: '  uuid-2  ',
      valor_negociado: 400000,
    })
    expect(result.cliente_id).toBe('uuid-1')
    expect(result.vivienda_id).toBe('uuid-2')
  })

  it('should fallback valor_negociado to 0 when NaN', () => {
    const result = sanitizeCrearNegociacionDTO({
      cliente_id: 'c1',
      vivienda_id: 'v1',
      valor_negociado: NaN,
    })
    expect(result.valor_negociado).toBe(0)
  })

  it('should sanitize empty optional strings to undefined', () => {
    const result = sanitizeCrearNegociacionDTO({
      cliente_id: 'c1',
      vivienda_id: 'v1',
      valor_negociado: 300000,
      tipo_descuento: '',
      motivo_descuento: '   ',
      notas: '',
    })
    expect(result.tipo_descuento).toBeUndefined()
    expect(result.motivo_descuento).toBeUndefined()
    expect(result.notas).toBeUndefined()
  })

  it('should keep valid optional string fields', () => {
    const result = sanitizeCrearNegociacionDTO({
      cliente_id: 'c1',
      vivienda_id: 'v1',
      valor_negociado: 300000,
      tipo_descuento: 'Porcentaje',
      motivo_descuento: 'Cliente VIP',
      notas: 'Pagó de contado',
    })
    expect(result.tipo_descuento).toBe('Porcentaje')
    expect(result.motivo_descuento).toBe('Cliente VIP')
    expect(result.notas).toBe('Pagó de contado')
  })

  it('should sanitize invalid fecha_negociacion to undefined', () => {
    const result = sanitizeCrearNegociacionDTO({
      cliente_id: 'c1',
      vivienda_id: 'v1',
      valor_negociado: 300000,
      fecha_negociacion: 'not-a-date',
    })
    expect(result.fecha_negociacion).toBeUndefined()
  })

  it('should keep valid fecha_negociacion', () => {
    const result = sanitizeCrearNegociacionDTO({
      cliente_id: 'c1',
      vivienda_id: 'v1',
      valor_negociado: 300000,
      fecha_negociacion: '2025-06-15',
    })
    expect(result.fecha_negociacion).toBe('2025-06-15')
  })

  it('should sanitize fuentes_pago array', () => {
    const result = sanitizeCrearNegociacionDTO({
      cliente_id: 'c1',
      vivienda_id: 'v1',
      valor_negociado: 300000,
      fuentes_pago: [
        { tipo: '  Crédito  ', monto_aprobado: 200000 },
        { tipo: 'Subsidio', monto_aprobado: 50000, entidad: '' },
      ],
    })
    expect(result.fuentes_pago).toHaveLength(2)
    expect(result.fuentes_pago?.[0].tipo).toBe('Crédito')
    expect(result.fuentes_pago?.[1].entidad).toBeUndefined()
  })
})

describe('sanitizeActualizarNegociacionDTO', () => {
  it('should return empty object for empty input', () => {
    const result = sanitizeActualizarNegociacionDTO({})
    expect(result).toEqual({})
  })

  it('should preserve estado when provided', () => {
    const result = sanitizeActualizarNegociacionDTO({ estado: 'Activa' })
    expect(result.estado).toBe('Activa')
  })

  it('should sanitize NaN valor_negociado to undefined', () => {
    const result = sanitizeActualizarNegociacionDTO({
      valor_negociado: NaN,
    })
    expect(result.valor_negociado).toBeUndefined()
  })

  it('should keep valid valor_negociado', () => {
    const result = sanitizeActualizarNegociacionDTO({
      valor_negociado: 450000,
    })
    expect(result.valor_negociado).toBe(450000)
  })

  it('should sanitize empty tipo_descuento to undefined', () => {
    const result = sanitizeActualizarNegociacionDTO({
      tipo_descuento: '   ',
    })
    expect(result.tipo_descuento).toBeUndefined()
  })

  it('should sanitize invalid fecha_completada to undefined', () => {
    const result = sanitizeActualizarNegociacionDTO({
      fecha_completada: 'invalid',
    })
    expect(result.fecha_completada).toBeUndefined()
  })

  it('should keep valid fecha_completada', () => {
    const result = sanitizeActualizarNegociacionDTO({
      fecha_completada: '2025-12-31',
    })
    expect(result.fecha_completada).toBe('2025-12-31')
  })

  it('should only include fields that were provided', () => {
    const result = sanitizeActualizarNegociacionDTO({
      notas: 'Actualización importante',
    })
    expect(result.notas).toBe('Actualización importante')
    expect(result.estado).toBeUndefined()
    expect(result.valor_negociado).toBeUndefined()
  })
})

describe('sanitizeActualizarFuentePagoDTO', () => {
  it('should keep valid tipo and monto_aprobado', () => {
    const result = sanitizeActualizarFuentePagoDTO({
      tipo: 'Crédito Hipotecario',
      monto_aprobado: 200000,
    })
    expect(result.tipo).toBe('Crédito Hipotecario')
    expect(result.monto_aprobado).toBe(200000)
  })

  it('should trim tipo and fallback monto to 0 when NaN', () => {
    const result = sanitizeActualizarFuentePagoDTO({
      tipo: '  Subsidio  ',
      monto_aprobado: NaN,
    })
    expect(result.tipo).toBe('Subsidio')
    expect(result.monto_aprobado).toBe(0)
  })

  it('should sanitize optional string fields to undefined when empty', () => {
    const result = sanitizeActualizarFuentePagoDTO({
      tipo: 'Cuota',
      monto_aprobado: 10000,
      id: '',
      entidad: null,
      numero_referencia: '  ',
      detalles: null,
    })
    expect(result.id).toBeUndefined()
    expect(result.entidad).toBeUndefined()
    expect(result.numero_referencia).toBeUndefined()
    expect(result.detalles).toBeUndefined()
  })

  it('should keep valid optional string fields', () => {
    const result = sanitizeActualizarFuentePagoDTO({
      id: 'fuente-uuid',
      tipo: 'Crédito',
      monto_aprobado: 150000,
      entidad: 'Banco ABC',
      detalles: 'Tasa preferencial',
    })
    expect(result.id).toBe('fuente-uuid')
    expect(result.entidad).toBe('Banco ABC')
    expect(result.detalles).toBe('Tasa preferencial')
  })

  it('should preserve permite_multiples_abonos boolean', () => {
    const resultTrue = sanitizeActualizarFuentePagoDTO({
      tipo: 'Crédito',
      monto_aprobado: 100000,
      permite_multiples_abonos: true,
    })
    expect(resultTrue.permite_multiples_abonos).toBe(true)
  })
})
