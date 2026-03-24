// =====================================================
// TIPOS: Edición de Abonos
// =====================================================

import type { MetodoPago } from './index'

/**
 * Shape completo de un abono para pre-llenar el formulario de edición.
 */
export interface AbonoParaEditar {
  id: string
  negociacion_id: string
  fuente_pago_id: string
  /** Tipo/nombre de la fuente (ej: 'Cuota Inicial') — usado para color scheme del modal */
  fuente_tipo?: string
  monto: number
  fecha_abono: string
  metodo_pago: MetodoPago | null
  numero_referencia: string | null
  notas: string | null
  comprobante_url: string | null
}

/**
 * Payload enviado al PATCH /api/abonos/editar.
 * Solo se incluyen los campos que cambian.
 */
export interface EditarAbonoPayload {
  abonoId: string
  monto?: number
  fecha_abono?: string
  metodo_pago?: MetodoPago | null
  numero_referencia?: string | null
  notas?: string | null
  /** Path en Storage del nuevo comprobante (ya fue subido por el cliente). */
  comprobante_url?: string | null
  /** true si el comprobante existente se eliminó sin reemplazar. */
  eliminar_comprobante?: boolean
  /** Motivo del cambio (obligatorio, mínimo 5 caracteres). */
  motivo: string
}

export interface EditarAbonoResponse {
  ok: boolean
  abono?: AbonoParaEditar
  error?: string
}

/**
 * Cambio individual en un campo para el panel de diff.
 */
export interface DiffCampo {
  campo: string
  label: string
  anterior: string
  nuevo: string
}
