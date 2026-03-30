import type { EstadoAbono, EstadoNegociacion, MetodoPago } from '../types'

// =====================================================
// CONSTANTES: Módulo de Abonos
// =====================================================

// ============================================
// MÉTODOS DE PAGO
// ============================================

export const METODOS_PAGO: { value: MetodoPago; label: string }[] = [
  { value: 'Transferencia', label: 'Transferencia' },
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Consignación', label: 'Consignación' },
  { value: 'PSE', label: 'PSE' },
  { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
  { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
]

// ============================================
// ESTADOS DE ABONO
// ============================================

export const ESTADOS_ABONO: { value: EstadoAbono; label: string }[] = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Anulado', label: 'Anulado' },
]

export const ESTADO_ABONO_COLORS: Record<EstadoAbono, string> = {
  Activo:
    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800',
  Anulado:
    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800',
}

// ============================================
// ESTADOS DE NEGOCIACIÓN (para filtros)
// ============================================

export const ESTADOS_NEGOCIACION_FILTRO: {
  value: EstadoNegociacion | undefined
  label: string
}[] = [
  { value: undefined, label: 'Todas' },
  { value: 'Activa', label: 'Activa' },
  { value: 'Completada', label: 'Completada' },
  { value: 'En Proceso', label: 'En Proceso' },
  { value: 'Cierre Financiero', label: 'Cierre Financiero' },
]

// ============================================
// VALORES POR DEFECTO
// ============================================

export const ABONOS_DEFAULTS = {
  ITEMS_POR_PAGINA: 12,
  STALE_TIME: 30_000, // 30 segundos
  GC_TIME: 300_000, // 5 minutos
}

// ============================================
// OPCIONES DE ORDENAMIENTO
// ============================================

export const OPCIONES_ORDENAMIENTO = [
  { value: 'urgente', label: 'Más urgentes' },
  { value: 'porcentaje_asc', label: 'Menor % pagado' },
  { value: 'porcentaje_desc', label: 'Mayor % pagado' },
  { value: 'nombre_asc', label: 'Nombre A-Z' },
  { value: 'nombre_desc', label: 'Nombre Z-A' },
  { value: 'saldo_desc', label: 'Mayor saldo pendiente' },
  { value: 'saldo_asc', label: 'Menor saldo pendiente' },
] as const

export type OrdenAbonos = (typeof OPCIONES_ORDENAMIENTO)[number]['value']
