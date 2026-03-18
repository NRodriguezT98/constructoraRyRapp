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

// Dinámico: los tipos reales se cargan desde tipos_fuentes_pago en BD.
// TIPOS_FUENTE_PAGO queda como constantes de referencia para compatibilidad.
export type TipoFuentePago = string

/**
 * Códigos técnicos estables de fuentes de pago (columna `codigo` en BD).
 * Siempre snake_case minúsculas — la BD tiene un CHECK constraint que lo impone.
 * Usar ESTOS en SQL, queries y lógica interna.
 * Usar TIPOS_FUENTE_PAGO solo para displays y comparaciones con datos existentes.
 */
export const FUENTES_PAGO_CODIGOS = {
  CUOTA_INICIAL: 'cuota_inicial',
  CREDITO_HIPOTECARIO: 'credito_hipotecario',
  SUBSIDIO_MI_CASA_YA: 'subsidio_mi_casa_ya',
  SUBSIDIO_CAJA_COMPENSACION: 'subsidio_caja_compensacion',
} as const

export type FuentePagoCodigo = typeof FUENTES_PAGO_CODIGOS[keyof typeof FUENTES_PAGO_CODIGOS]

export const ESTADOS_FUENTE_PAGO = {
  ACTIVA: 'Activa',
  INACTIVA: 'Inactiva',
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
  monto_recibido: number | null
  saldo_pendiente: number | null
  porcentaje_completado: number | null

  // Detalles
  entidad: string | null
  numero_referencia: string | null

  // Comportamiento
  permite_multiples_abonos: boolean

  // Documentos
  carta_asignacion_url: string | null

  // Campos específicos para subsidios
  fecha_resolucion: string | null // Para Subsidio Mi Casa Ya
  fecha_acta: string | null // Para Subsidio Caja Compensación

  // Estado
  estado: EstadoFuentePago
  estado_fuente?: string | null // Para compatibilidad con BD
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
