/**
 * ============================================
 * TYPES: Sistema de Fuentes de Pago
 * ============================================
 *
 * Tipos TypeScript para el sistema de requisitos de fuentes de pago.
 * El sistema antiguo (pasos_fuente_pago) ha sido eliminado.
 * El sistema nuevo usa: requisitos_fuentes_pago_config + vista_documentos_pendientes_fuentes
 *
 * @version 2.0.0 - 2026-03-14 (limpieza sistema viejo)
 */

// ============================================
// ENUMS
// ============================================

/**
 * Nivel de validación para requisitos de fuentes de pago
 * Usado en: requisitos_fuentes_pago_config.nivel_validacion
 */
export enum NivelValidacion {
  DOCUMENTO_OBLIGATORIO = 'DOCUMENTO_OBLIGATORIO',
  DOCUMENTO_OPCIONAL = 'DOCUMENTO_OPCIONAL',
  SOLO_CONFIRMACION = 'SOLO_CONFIRMACION',
}

// ============================================================
// LOGICA DE NEGOCIO (feature flags del tipo de fuente)
// ============================================================

export interface LogicaNegocio {
  /** Si true: al crear la fuente se deben generar cuotas de amortización */
  genera_cuotas: boolean
  /** Si true: usar capital (no monto_total) para el cierre financiero */
  capital_para_cierre: boolean
  /** Si true: permite registrar mora en los abonos */
  permite_mora: boolean
  /** Fórmula de cálculo: por ahora solo 'simple' */
  formula_interes: 'simple'
}

// ============================================================
// CRÉDITO CON LA CONSTRUCTORA
// ============================================================

export interface CreditoConstructora {
  id: string
  fuente_pago_id: string
  capital: number
  tasa_mensual: number     // porcentaje: 1.5 = 1.5%
  num_cuotas: number
  fecha_inicio: string     // YYYY-MM-DD
  valor_cuota: number
  interes_total: number
  monto_total: number
  tasa_mora_diaria: number // porcentaje diario: 0.001 = 0.1% diario
  version_actual: number
  created_at: string
  updated_at: string
}

export type CrearCreditoDTO = Omit<CreditoConstructora, 'id' | 'version_actual' | 'created_at' | 'updated_at'>

export interface ParametrosCredito {
  capital: number
  tasaMensual: number
  numCuotas: number
  fechaInicio: Date
  /** Tasa de mora diaria. Default: 0.001 (0.1% daily). Range: 0–0.05 */
  tasaMoraDiaria?: number
}

// ============================================================
// CUOTAS DE AMORTIZACIÓN
// ============================================================

export type EstadoCuota = 'Pendiente' | 'Pagada' | 'Reestructurada'
export type EstadoEfectivoCuota = EstadoCuota | 'Vencida'

export interface CuotaCredito {
  id: string
  fuente_pago_id: string
  numero_cuota: number
  fecha_vencimiento: string
  valor_cuota: number
  mora_aplicada: number
  total_a_cobrar: number
  estado: EstadoCuota
  fecha_pago: string | null
  version_plan: number
  notas: string | null
  created_at: string
  updated_at: string
}

export interface CuotaVigente extends CuotaCredito {
  estado_efectivo: EstadoEfectivoCuota
  esta_vencida: boolean
  dias_mora: number
}

export interface ResumenCuotas {
  total: number
  pendientes: number
  pagadas: number
  vencidas: number
  reestructuradas: number
  montoPendiente: number
  moraAcumulada: number
}

export interface CuotaCalculo {
  numero: number
  fechaVencimiento: Date
  valorCuota: number
  capitalPorCuota: number
  interesPorCuota: number
}

export interface ResumenCredito {
  capital: number
  interesTotal: number
  montoTotal: number
  valorCuotaMensual: number
  cuotas: CuotaCalculo[]
}

export interface ParametrosReestructuracion {
  fuentePagoId: string
  creditoId: string
  capitalPendiente: number
  nuevaTasaMensual: number
  nuevasNumCuotas: number
  nuevaFechaInicio: Date
}
