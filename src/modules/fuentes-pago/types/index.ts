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
  tasa_mensual: number // porcentaje: 1.5 = 1.5%
  num_cuotas: number
  fecha_inicio: string // YYYY-MM-DD
  valor_cuota: number
  interes_total: number
  monto_total: number
  tasa_mora_diaria: number // porcentaje diario: 0.001 = 0.1% diario
  version_actual: number
  created_at: string
  updated_at: string
}

export type CrearCreditoDTO = Omit<
  CreditoConstructora,
  'id' | 'version_actual' | 'created_at' | 'updated_at'
>

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

// ─── Calendario de cuotas (tabla cuotas_credito) ─────────────────────────────
// La tabla es ahora de solo lectura: fecha + monto de referencia por período.
// No hay estado por cuota; el estado se calcula dinámicamente desde los abonos.

export interface CuotaCalendario {
  id: string
  fuente_pago_id: string
  numero_cuota: number
  fecha_vencimiento: string
  valor_cuota: number
  version_plan: number
  notas: string | null
  created_at: string
  updated_at: string
}

/** @deprecated Alias de CuotaCalendario para compatibilidad con código legado */
export type CuotaCredito = CuotaCalendario

// ─── Estado calculado por período (vista_estado_periodos_credito) ─────────────

export type EstadoPeriodo = 'Cubierto' | 'Atrasado' | 'En curso' | 'Futuro'

export interface PeriodoCredito extends CuotaCalendario {
  /** Total capital abonado a esta fuente (acumulado histórico) */
  capital_total: number
  /** Capital atribuido a ESTE período (relleno secuencial) */
  capital_aplicado: number
  /** Cuánto falta para cubrir el período (0 si cubierto) */
  deficit: number
  estado_periodo: EstadoPeriodo
  /** Días desde el vencimiento (solo si Atrasado) */
  dias_atraso: number
  /** Interés de mora calculado sobre el déficit (solo si Atrasado) */
  mora_sugerida: number
}

/** @deprecated Alias de PeriodoCredito para compatibilidad con código legado */
export type CuotaVigente = PeriodoCredito

export interface ResumenCuotas {
  total: number
  cubiertos: number
  atrasados: number
  pendientes: number // En curso + Futuro
  deficitTotal: number
  moraTotal: number // Suma de mora_sugerida en períodos Atrasados
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
  /** Motivo registrado en el audit log (ej: 'Dificultad económica del cliente') */
  motivo?: string
  /** Notas adicionales para el audit log */
  notas?: string
}

// ============================================================
// CÁLCULOS DERIVADOS (usados por useCuotasCredito)
// ============================================================

/** El período activo (En curso o Atrasado) para el panel de resumen */
export interface ProximaCuota {
  id: string
  numero_cuota: number
  fecha_vencimiento: string
  valor_cuota: number
  deficit: number // Cuánto falta cubrir de este período
  mora_sugerida: number // Interés sugerido si está atrasado
  estado: 'Atrasado' | 'En curso'
  dias_atraso: number // 0 si En curso
}

/** Progreso global del crédito */
export interface ProgresoCredito {
  totalCuotas: number
  cuotasCubiertas: number
  cuotasPendientes: number
  montoTotal: number
  montoCubierto: number // Suma de valor_cuota de períodos Cubiertos
  porcentaje: number // 0-100
}
