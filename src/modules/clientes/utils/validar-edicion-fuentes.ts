/**
 * Utilidades para validar edición de fuentes de pago
 *
 * ⚠️ REGLAS DE NEGOCIO:
 *
 * 1. CUOTA INICIAL:
 *    - Siempre editable
 *    - Nuevo monto >= monto_recibido (lo que ya abonó)
 *    - Suma total debe cerrar en $0
 *
 * 2. CRÉDITO HIPOTECARIO Y SUBSIDIOS:
 *    - Solo editables SI NO han sido desembolsados
 *    - Si monto_recibido = monto_aprobado → BLOQUEADO
 *    - Desembolso es TODO O NADA (no hay abonos parciales)
 *
 * 3. SUMA TOTAL:
 *    - Siempre debe ser igual al valor total de la vivienda
 */

import type { FuentePago, TipoFuentePago } from '../types'

// ============================================
// INTERFACES
// ============================================

export interface ResultadoValidacion {
  valido: boolean
  errores: string[]
  advertencias?: string[]
}

export interface ValidacionFuenteIndividual {
  editable: boolean
  razon?: string
  tipo_restriccion?: 'bloqueado' | 'limitado' | 'libre'
}

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Valida si una fuente de pago específica puede ser editada
 */
export function puedeEditarFuente(fuente: FuentePago): ValidacionFuenteIndividual {
  // CASO 1: Cuota Inicial (siempre editable con restricciones)
  if (fuente.tipo === 'Cuota Inicial') {
    if (fuente.monto_recibido === 0) {
      return {
        editable: true,
        tipo_restriccion: 'libre',
      }
    }

    return {
      editable: true,
      tipo_restriccion: 'limitado',
      razon: `Ya se han recibido $${fuente.monto_recibido.toLocaleString('es-CO')}. El nuevo monto debe ser mayor o igual a esta cantidad.`,
    }
  }

  // CASO 2: Crédito Hipotecario y Subsidios (solo si no están desembolsados)
  const tiposDesembolsoUnico: TipoFuentePago[] = [
    'Crédito Hipotecario',
    'Subsidio Mi Casa Ya',
    'Subsidio Caja Compensación',
  ]

  if (tiposDesembolsoUnico.includes(fuente.tipo)) {
    // Verificar si ya fue desembolsado (monto_recibido = monto_aprobado)
    const fueDesembolsado = fuente.monto_recibido === fuente.monto_aprobado && fuente.monto_recibido > 0

    if (fueDesembolsado) {
      return {
        editable: false,
        tipo_restriccion: 'bloqueado',
        razon: `${fuente.tipo} ya fue desembolsado por $${fuente.monto_aprobado.toLocaleString('es-CO')}. No se puede modificar.`,
      }
    }

    // Si está pendiente (monto_recibido = 0), se puede editar libremente
    return {
      editable: true,
      tipo_restriccion: 'libre',
    }
  }

  // Por defecto: no editable
  return {
    editable: false,
    tipo_restriccion: 'bloqueado',
    razon: 'Tipo de fuente no reconocido',
  }
}

/**
 * Valida que la nueva configuración de Cuota Inicial sea válida
 */
export function validarNuevaCuotaInicial(
  fuente: FuentePago,
  nuevoMonto: number
): ResultadoValidacion {
  const errores: string[] = []

  // Validación 1: Nuevo monto debe ser > 0
  if (nuevoMonto <= 0) {
    errores.push('El monto de la Cuota Inicial debe ser mayor a $0')
  }

  // Validación 2: Nuevo monto >= monto_recibido
  if (nuevoMonto < fuente.monto_recibido) {
    errores.push(
      `El nuevo monto ($${nuevoMonto.toLocaleString('es-CO')}) no puede ser menor al monto ya recibido ($${fuente.monto_recibido.toLocaleString('es-CO')})`
    )
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}

/**
 * Valida que la suma total de fuentes sea igual al valor de la vivienda
 */
export function validarSumaTotal(
  fuentes: Array<{ tipo: TipoFuentePago; monto_aprobado: number }>,
  valorTotalVivienda: number
): ResultadoValidacion {
  const errores: string[] = []
  const advertencias: string[] = []

  // Calcular suma total
  const sumaTotal = fuentes.reduce((sum, f) => sum + f.monto_aprobado, 0)

  // Validación: Suma debe ser exactamente igual al valor total
  if (sumaTotal !== valorTotalVivienda) {
    const diferencia = Math.abs(valorTotalVivienda - sumaTotal)
    const mensaje =
      sumaTotal < valorTotalVivienda
        ? `Falta cubrir $${diferencia.toLocaleString('es-CO')} para completar el financiamiento`
        : `Hay un excedente de $${diferencia.toLocaleString('es-CO')} en las fuentes de pago`

    errores.push(mensaje)
  }

  // Validación: Debe tener al menos Cuota Inicial
  const tieneCuotaInicial = fuentes.some((f) => f.tipo === 'Cuota Inicial')
  if (!tieneCuotaInicial) {
    errores.push('Debe existir al menos una Cuota Inicial')
  }

  // Advertencia: Cuota Inicial muy baja
  const cuotaInicial = fuentes.find((f) => f.tipo === 'Cuota Inicial')
  if (cuotaInicial) {
    const porcentajeCuota = (cuotaInicial.monto_aprobado / valorTotalVivienda) * 100
    if (porcentajeCuota < 5) {
      advertencias.push(
        `La Cuota Inicial es muy baja (${porcentajeCuota.toFixed(1)}% del total). Se recomienda al menos 10%.`
      )
    }
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
  }
}

/**
 * Valida toda la configuración de fuentes de pago
 */
export function validarConfiguracionFuentes(
  fuentesActuales: FuentePago[],
  fuentesNuevas: Array<{ tipo: TipoFuentePago; monto_aprobado: number }>,
  valorTotalVivienda: number
): ResultadoValidacion {
  const errores: string[] = []
  const advertencias: string[] = []

  // Validación 1: Verificar que las fuentes desembolsadas no hayan sido modificadas
  fuentesActuales.forEach((fuenteActual) => {
    const validacion = puedeEditarFuente(fuenteActual)

    if (!validacion.editable) {
      // Buscar si existe en las nuevas fuentes
      const fuenteNueva = fuentesNuevas.find((fn) => fn.tipo === fuenteActual.tipo)

      // Si existe y el monto cambió → ERROR
      if (fuenteNueva && fuenteNueva.monto_aprobado !== fuenteActual.monto_aprobado) {
        errores.push(validacion.razon || `No se puede modificar ${fuenteActual.tipo}`)
      }
    } else if (validacion.tipo_restriccion === 'limitado') {
      // Cuota Inicial con restricción
      const fuenteNueva = fuentesNuevas.find((fn) => fn.tipo === 'Cuota Inicial')

      if (fuenteNueva) {
        const validacionCuota = validarNuevaCuotaInicial(fuenteActual, fuenteNueva.monto_aprobado)

        if (!validacionCuota.valido) {
          errores.push(...validacionCuota.errores)
        }
      }
    }
  })

  // Validación 2: Suma total debe cerrar
  const validacionSuma = validarSumaTotal(fuentesNuevas, valorTotalVivienda)
  if (!validacionSuma.valido) {
    errores.push(...validacionSuma.errores)
  }
  if (validacionSuma.advertencias) {
    advertencias.push(...validacionSuma.advertencias)
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias: advertencias.length > 0 ? advertencias : undefined,
  }
}

/**
 * Obtiene el estado de edición de todas las fuentes
 */
export function obtenerEstadoEdicionFuentes(fuentes: FuentePago[]): {
  total: number
  editables: number
  bloqueadas: number
  limitadas: number
  detalles: Array<{
    tipo: TipoFuentePago
    editable: boolean
    restriccion: 'libre' | 'limitado' | 'bloqueado'
    razon?: string
  }>
} {
  const detalles = fuentes.map((fuente) => {
    const validacion = puedeEditarFuente(fuente)
    return {
      tipo: fuente.tipo,
      editable: validacion.editable,
      restriccion: validacion.tipo_restriccion || 'bloqueado',
      razon: validacion.razon,
    }
  })

  return {
    total: fuentes.length,
    editables: detalles.filter((d) => d.editable && d.restriccion === 'libre').length,
    bloqueadas: detalles.filter((d) => !d.editable).length,
    limitadas: detalles.filter((d) => d.editable && d.restriccion === 'limitado').length,
    detalles,
  }
}

/**
 * Helper: Formatea mensaje de error para mostrar al usuario
 */
export function formatearErroresValidacion(resultado: ResultadoValidacion): string {
  if (resultado.valido) return ''

  let mensaje = resultado.errores.join('\n')

  if (resultado.advertencias && resultado.advertencias.length > 0) {
    mensaje += '\n\n⚠️ Advertencias:\n' + resultado.advertencias.join('\n')
  }

  return mensaje
}
