import type { EstadoRenuncia } from '../types'

// =====================================================
// CONSTANTES: Módulo de Renuncias
// =====================================================

// ============================================
// ESTADOS DE RENUNCIA
// ============================================

export const ESTADOS_RENUNCIA: {
  value: EstadoRenuncia | undefined
  label: string
}[] = [
  { value: undefined, label: 'Todas' },
  { value: 'Pendiente Devolución', label: 'Pendiente Devolución' },
  { value: 'Cerrada', label: 'Cerrada' },
]

export const ESTADO_RENUNCIA_COLORS: Record<EstadoRenuncia, string> = {
  'Pendiente Devolución':
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
  Cerrada:
    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800',
}

export const ESTADO_RENUNCIA_ICONS: Record<EstadoRenuncia, string> = {
  'Pendiente Devolución': '⏳',
  Cerrada: '✅',
}

// ============================================
// VALORES POR DEFECTO
// ============================================

export const RENUNCIAS_DEFAULTS = {
  ITEMS_POR_PAGINA: 12,
  STALE_TIME: 30_000,
  GC_TIME: 300_000,
  MOTIVO_MIN_LENGTH: 10,
}
