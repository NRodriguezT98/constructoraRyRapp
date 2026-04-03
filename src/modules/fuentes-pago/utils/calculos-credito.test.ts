import { describe, expect, it } from 'vitest'

import {
  calcularCapitalPendiente,
  calcularMoraSugerida,
  calcularTablaAmortizacion,
  fechaCuotaParaBD,
} from './calculos-credito'

// ========================================================
// calcularTablaAmortizacion
// ========================================================

describe('calcularTablaAmortizacion', () => {
  it('calcula correctamente un crédito simple de 12 cuotas', () => {
    const resultado = calcularTablaAmortizacion({
      capital: 12_000_000,
      tasaMensual: 1,
      numCuotas: 12,
      fechaInicio: new Date(2025, 0, 1), // 1 ene 2025
    })

    expect(resultado.capital).toBe(12_000_000)
    expect(resultado.interesTotal).toBe(1_440_000) // 12M × 1% × 12
    expect(resultado.montoTotal).toBe(13_440_000)
    expect(resultado.cuotas).toHaveLength(12)
  })

  it('genera fechas de vencimiento mensualmente correctas', () => {
    const resultado = calcularTablaAmortizacion({
      capital: 10_000_000,
      tasaMensual: 1,
      numCuotas: 3,
      fechaInicio: new Date(2025, 0, 15), // 15 enero 2025
    })

    // Cuota 1 → 15 feb, cuota 2 → 15 mar, cuota 3 → 15 abr
    expect(resultado.cuotas[0].fechaVencimiento.getMonth()).toBe(1) // febrero
    expect(resultado.cuotas[1].fechaVencimiento.getMonth()).toBe(2) // marzo
    expect(resultado.cuotas[2].fechaVencimiento.getMonth()).toBe(3) // abril
  })

  it('cada cuota tiene número incremental', () => {
    const resultado = calcularTablaAmortizacion({
      capital: 5_000_000,
      tasaMensual: 1.5,
      numCuotas: 6,
      fechaInicio: new Date(2025, 0, 1),
    })

    resultado.cuotas.forEach((cuota, i) => {
      expect(cuota.numero).toBe(i + 1)
    })
  })

  it('valorCuota es consistente con el resumen', () => {
    const resultado = calcularTablaAmortizacion({
      capital: 10_000_000,
      tasaMensual: 1,
      numCuotas: 10,
      fechaInicio: new Date(2025, 0, 1),
    })

    // Cada cuota debe igualar el valor informado en el resumen
    expect(resultado.cuotas[0].valorCuota).toBe(resultado.valorCuotaMensual)
  })

  it('lanza error si el capital es 0', () => {
    expect(() =>
      calcularTablaAmortizacion({
        capital: 0,
        tasaMensual: 1,
        numCuotas: 12,
        fechaInicio: new Date(),
      })
    ).toThrow('El capital debe ser mayor a 0')
  })

  it('lanza error si la tasa supera el 10%', () => {
    expect(() =>
      calcularTablaAmortizacion({
        capital: 10_000_000,
        tasaMensual: 11,
        numCuotas: 12,
        fechaInicio: new Date(),
      })
    ).toThrow('La tasa mensual debe estar entre 0 y 10%')
  })

  it('lanza error si el número de cuotas excede 360', () => {
    expect(() =>
      calcularTablaAmortizacion({
        capital: 10_000_000,
        tasaMensual: 1,
        numCuotas: 361,
        fechaInicio: new Date(),
      })
    ).toThrow('El número de cuotas debe estar entre 1 y 360')
  })
})

// ========================================================
// calcularMoraSugerida
// ========================================================

describe('calcularMoraSugerida', () => {
  it('retorna 0 si la cuota aún no vence', () => {
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)

    const mora = calcularMoraSugerida(500_000, manana, 0.001)
    expect(mora).toBe(0)
  })

  it('retorna 0 si la cuota vence hoy', () => {
    const hoy = new Date()
    const mora = calcularMoraSugerida(500_000, hoy, 0.001)
    expect(mora).toBe(0)
  })

  it('calcula mora correctamente para 30 días vencida', () => {
    const hace30dias = new Date()
    hace30dias.setDate(hace30dias.getDate() - 30)

    // 500.000 × 0.001 × 30 = 15.000
    const mora = calcularMoraSugerida(500_000, hace30dias, 0.001)
    expect(mora).toBe(15_000)
  })

  it('retorna valor entero (sin centavos flotantes)', () => {
    const hace15dias = new Date()
    hace15dias.setDate(hace15dias.getDate() - 15)

    const mora = calcularMoraSugerida(333_333, hace15dias, 0.001)
    expect(mora).toBe(Math.round(mora)) // Debe ser entero
    expect(Number.isInteger(mora)).toBe(true)
  })
})

// ========================================================
// calcularCapitalPendiente
// ========================================================

describe('calcularCapitalPendiente', () => {
  it('sin cuotas pagadas devuelve el capital original', () => {
    expect(calcularCapitalPendiente(12_000_000, 12, 0)).toBe(12_000_000)
  })

  it('con todas las cuotas pagadas devuelve 0', () => {
    const resultado = calcularCapitalPendiente(12_000_000, 12, 12)
    // Puede no ser exactamente 0 por el redondeo de capitalPorCuota
    expect(resultado).toBeLessThanOrEqual(12_000_000 % 12)
  })

  it('calcula capital pendiente a la mitad del crédito', () => {
    // 12M en 12 cuotas → capital/cuota = 1M. A la mitad (6 pagadas) → 6M pendiente
    const resultado = calcularCapitalPendiente(12_000_000, 12, 6)
    expect(resultado).toBe(6_000_000)
  })

  it('nunca retorna valor negativo', () => {
    // Si se pasan más cuotas de las del plan (edge case)
    const resultado = calcularCapitalPendiente(1_000_000, 12, 15)
    expect(resultado).toBeGreaterThanOrEqual(0)
  })
})

// ========================================================
// fechaCuotaParaBD
// ========================================================

describe('fechaCuotaParaBD', () => {
  it('formatea fecha en YYYY-MM-DD', () => {
    const fecha = new Date(2025, 5, 15) // 15 junio 2025
    expect(fechaCuotaParaBD(fecha)).toBe('2025-06-15')
  })

  it('agrega cero en meses y días menores a 10', () => {
    const fecha = new Date(2025, 0, 7) // 7 enero 2025
    expect(fechaCuotaParaBD(fecha)).toBe('2025-01-07')
  })

  it('maneja correctamente diciembre (mes 11 → "12")', () => {
    const fecha = new Date(2025, 11, 31) // 31 diciembre 2025
    expect(fechaCuotaParaBD(fecha)).toBe('2025-12-31')
  })
})
