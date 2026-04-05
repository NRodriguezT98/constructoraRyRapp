import { describe, expect, it } from 'vitest'

import type { CrearClienteDTO } from '../types'

import {
  sanitizeActualizarClienteDTO,
  sanitizeCrearClienteDTO,
} from './sanitize-cliente.utils'

// ============================================================
// sanitizeCrearClienteDTO
// ============================================================

describe('sanitizeCrearClienteDTO', () => {
  const base: CrearClienteDTO = {
    nombres: 'JUAN PABLO',
    apellidos: 'RODRIGUEZ GARCIA',
    tipo_documento: 'CC',
    numero_documento: '12345678',
  }

  it('capitaliza nombres y apellidos correctamente', () => {
    const result = sanitizeCrearClienteDTO(base)
    expect(result.nombres).toBe('Juan Pablo')
    expect(result.apellidos).toBe('Rodriguez Garcia')
  })

  it('convierte estado_civil inválido a undefined', () => {
    const result = sanitizeCrearClienteDTO({
      ...base,
      // @ts-expect-error - Probar valor inválido intencionalmente
      estado_civil: 'Separado',
    })
    expect(result.estado_civil).toBeUndefined()
  })

  it('acepta estados civiles válidos', () => {
    const result = sanitizeCrearClienteDTO({
      ...base,
      estado_civil: 'Soltero(a)',
    })
    expect(result.estado_civil).toBe('Soltero(a)')
  })

  it('convierte fecha_nacimiento vacía a undefined', () => {
    const result = sanitizeCrearClienteDTO({
      ...base,
      fecha_nacimiento: '',
    })
    expect(result.fecha_nacimiento).toBeUndefined()
  })

  it('acepta fecha_nacimiento válida', () => {
    const result = sanitizeCrearClienteDTO({
      ...base,
      fecha_nacimiento: '1990-05-15',
    })
    expect(result.fecha_nacimiento).toBe('1990-05-15')
  })

  it('convierte email a minúsculas', () => {
    const result = sanitizeCrearClienteDTO({
      ...base,
      email: '  JUAN@GMAIL.COM  ',
    })
    expect(result.email).toBe('juan@gmail.com')
  })

  it('convierte teléfono con espacios a null → undefined', () => {
    const result = sanitizeCrearClienteDTO({
      ...base,
      telefono: '   ',
    })
    expect(result.telefono).toBeUndefined()
  })

  it('trimea teléfono válido', () => {
    const result = sanitizeCrearClienteDTO({
      ...base,
      telefono: '  3001234567  ',
    })
    expect(result.telefono).toBe('3001234567')
  })

  it('convierte ciudad vacía a undefined', () => {
    const result = sanitizeCrearClienteDTO({
      ...base,
      ciudad: '',
    })
    expect(result.ciudad).toBeUndefined()
  })

  it('mantiene tipo_documento sin cambios', () => {
    const result = sanitizeCrearClienteDTO(base)
    expect(result.tipo_documento).toBe('CC')
  })
})

// ============================================================
// sanitizeActualizarClienteDTO
// ============================================================

describe('sanitizeActualizarClienteDTO', () => {
  it('capitaliza nombres si se proveen', () => {
    const result = sanitizeActualizarClienteDTO({ nombres: 'CARLOS' })
    expect(result.nombres).toBe('Carlos')
  })

  it('no incluye campo si no está en el DTO original', () => {
    const result = sanitizeActualizarClienteDTO({ ciudad: 'Bogotá' })
    expect(result.nombres).toBeUndefined()
    expect(result.apellidos).toBeUndefined()
  })

  it('convierte email a minúsculas si se provee', () => {
    const result = sanitizeActualizarClienteDTO({ email: 'TEST@MAIL.COM' })
    expect(result.email).toBe('test@mail.com')
  })

  it('convierte estado_civil inválido a undefined', () => {
    const result = sanitizeActualizarClienteDTO({
      // @ts-expect-error - Probar valor inválido intencionalmente
      estado_civil: 'Divorciado',
    })
    expect(result.estado_civil).toBeUndefined()
  })

  it('acepta estado_civil válido', () => {
    const result = sanitizeActualizarClienteDTO({ estado_civil: 'Casado(a)' })
    expect(result.estado_civil).toBe('Casado(a)')
  })

  it('convierte fecha_nacimiento inválida a undefined', () => {
    const result = sanitizeActualizarClienteDTO({ fecha_nacimiento: 'abc' })
    expect(result.fecha_nacimiento).toBeUndefined()
  })

  it('retorna objeto vacío para DTO vacío', () => {
    const result = sanitizeActualizarClienteDTO({})
    expect(Object.keys(result)).toHaveLength(0)
  })
})
