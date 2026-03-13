/**
 * ============================================
 * ESTILOS: Estado de Documentación de Fuente
 * ============================================
 *
 * Estilos centralizados para el card de estado de documentación.
 * Usa esquema de colores del módulo de abonos/negociaciones.
 *
 * @version 1.0.0 - 2025-12-12
 */

// ============================================
// CONFIGURACIÓN DE COLORES POR ESTADO
// ============================================

export const estadoColors = {
  completo: {
    icon: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    bgLight: 'bg-green-50/50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-900 dark:text-green-100',
    textMuted: 'text-green-700 dark:text-green-300',
    badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
    gradient: 'from-green-500 to-emerald-500',
  },
  advertencia: {
    icon: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    bgLight: 'bg-yellow-50/50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-900 dark:text-yellow-100',
    textMuted: 'text-yellow-700 dark:text-yellow-300',
    badge: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    gradient: 'from-yellow-500 to-amber-500',
  },
  bloqueado: {
    icon: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    bgLight: 'bg-red-50/50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-100',
    textMuted: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
    gradient: 'from-red-500 to-rose-500',
  },
} as const

// ============================================
// ESTILOS DEL CARD
// ============================================

export const estadoDocumentacionStyles = {
  // Container principal
  card: {
    base: 'relative overflow-hidden rounded-xl border-2 transition-all duration-300',
    hover: 'hover:shadow-lg',
  },

  // Header del card
  header: {
    container: 'flex items-start justify-between gap-3 p-3',
    iconWrapper: 'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center shadow-sm',
    contentWrapper: 'flex-1 min-w-0',
    title: 'text-sm font-bold leading-tight',
    description: 'text-xs leading-tight mt-0.5',
    badge: 'flex-shrink-0',
  },

  // Barra de progreso
  progress: {
    container: 'px-3 pb-2',
    wrapper: 'relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
    bar: 'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
    label: 'text-[10px] font-semibold text-gray-600 dark:text-gray-400 mt-1',
  },

  // Lista de documentos
  documentos: {
    container: 'border-t border-gray-200 dark:border-gray-700 px-3 py-2 space-y-1.5',
    header: 'text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1',
    item: {
      container: 'flex items-center justify-between gap-2 py-1',
      left: 'flex items-center gap-2 flex-1 min-w-0',
      indicator: 'w-1.5 h-1.5 rounded-full flex-shrink-0',
      text: 'text-xs flex-1 min-w-0 truncate',
      badge: 'text-[10px] px-1.5 py-0.5 rounded-full font-medium border',
      button: 'flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
    },
  },

  // Estados vacíos
  empty: {
    container: 'px-3 py-4 text-center',
    icon: 'w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-600',
    text: 'text-xs text-gray-600 dark:text-gray-400',
  },

  // Loading
  loading: {
    container: 'px-3 py-4',
    spinner: 'w-5 h-5 mx-auto animate-spin text-gray-400 dark:text-gray-600',
  },

  // Badges
  badge: {
    base: 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border',
  },
} as const

// ============================================
// HELPER: Obtener clases por estado
// ============================================

export const getEstadoClasses = (estado: 'completo' | 'advertencia' | 'bloqueado') => {
  return estadoColors[estado]
}
