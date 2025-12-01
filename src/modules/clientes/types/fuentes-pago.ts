/**
 * Types: Fuentes de Pago
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 *
 * Tipos de fuentes:
 * - 'Cuota Inicial' → permite_multiples_abonos = true
 * - 'Crédito Hipotecario' → permite_multiples_abonos = false
 * - 'Subsidio Mi Casa Ya' → permite_multiples_abonos = false
 * - 'Subsidio Caja Compensación' → permite_multiples_abonos = false
 */

export const TIPOS_FUENTE_PAGO = {
  CUOTA_INICIAL: 'Cuota Inicial',
  CREDITO_HIPOTECARIO: 'Crédito Hipotecario',
  SUBSIDIO_MI_CASA_YA: 'Subsidio Mi Casa Ya',
  SUBSIDIO_CAJA: 'Subsidio Caja Compensación',
} as const

export type TipoFuentePago = typeof TIPOS_FUENTE_PAGO[keyof typeof TIPOS_FUENTE_PAGO]

export const ESTADOS_FUENTE_PAGO = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  COMPLETADA: 'Completada',
} as const

export type EstadoFuentePago = typeof ESTADOS_FUENTE_PAGO[keyof typeof ESTADOS_FUENTE_PAGO]

/**
 * DTO para crear fuente de pago
 */
export interface CrearFuentePagoDTO {
  negociacion_id: string
  tipo: TipoFuentePago
  monto_aprobado: number

  // Opcionales
  entidad?: string
  numero_referencia?: string
  carta_aprobacion_url?: string
  carta_asignacion_url?: string

  // Campos específicos para subsidios
  fecha_resolucion?: string // Para Subsidio Mi Casa Ya
  fecha_acta?: string // Para Subsidio Caja Compensación
}

/**
 * DTO para actualizar fuente de pago
 */
export interface ActualizarFuentePagoDTO {
  monto_aprobado?: number
  entidad?: string
  numero_referencia?: string
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
  estado?: EstadoFuentePago
  fecha_completado?: string

  // Campos específicos para subsidios
  fecha_resolucion?: string // Para Subsidio Mi Casa Ya
  fecha_acta?: string // Para Subsidio Caja Compensación
}

/**
 * Interfaz completa de fuente de pago (DB)
 */
export interface FuentePago {
  id: string
  negociacion_id: string
  tipo: TipoFuentePago
  monto_aprobado: number
  monto_recibido: number
  saldo_pendiente: number
  porcentaje_completado: number

  // Detalles
  entidad: string
  numero_referencia: string

  // Comportamiento
  permite_multiples_abonos: boolean

  // Documentos
  carta_aprobacion_url: string | null
  carta_asignacion_url: string | null

  // Campos específicos para subsidios
  fecha_resolucion: string | null // Para Subsidio Mi Casa Ya
  fecha_acta: string | null // Para Subsidio Caja Compensación

  // Estado
  estado: EstadoFuentePago
  fecha_completado: string | null
  fecha_creacion: string
  fecha_actualizacion: string
}

/**
 * Configuración temporal para el formulario
 */
export interface FuentePagoConfiguracion {
  tipo: TipoFuentePago
  habilitada: boolean
  config?: {
    monto_aprobado: number
    entidad: string
    numero_referencia: string
    carta_aprobacion_file?: File
    fecha_resolucion?: string // Para Subsidio Mi Casa Ya
    fecha_acta?: string // Para Subsidio Caja Compensación
  }
}

/**
 * Helper para determinar si un tipo permite múltiples abonos
 */
export function permiteMultiplesAbonos(tipo: TipoFuentePago): boolean {
  return tipo === TIPOS_FUENTE_PAGO.CUOTA_INICIAL
}

/**
 * Helper para obtener porcentaje de una fuente
 */
export function calcularPorcentajeFuente(
  montoFuente: number,
  valorTotal: number
): number {
  if (valorTotal === 0) return 0
  return Math.round((montoFuente / valorTotal) * 100 * 100) / 100
}
