/**
 * ============================================
 * ESTILOS: UltimosAbonosSection
 * ============================================
 *
 * Estilos centralizados para la sección de últimos abonos
 * Paleta: Rosa/Púrpura/Índigo (negociaciones)
 * Diseño: Compact, Glassmorphism
 */


// ============================================
// CONFIGURACIÓN DE MÉTODOS DE PAGO
// ============================================

export const METODOS_PAGO_CONFIG = {
  'Efectivo': {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  'Transferencia': {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  'Cheque': {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
  },
  'Tarjeta': {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-700 dark:text-pink-300',
  },
} as const

// ============================================
// ESTILOS DE COMPONENTE
// ============================================

export const ultimosAbonosSectionStyles = {
  // Container principal (compact, glassmorphism)
  container: 'backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-lg',

  // Header
  header: {
    container: 'flex items-center justify-between mb-3',
    left: 'flex-1',
    title: 'text-base font-bold text-gray-900 dark:text-white flex items-center gap-2',
    titleIcon: 'w-4 h-4 text-indigo-600 dark:text-indigo-400',
    subtitle: 'text-xs text-gray-500 dark:text-gray-400 mt-0.5',
    button: 'inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-xs font-medium shadow-sm hover:shadow-md',
    buttonIcon: 'w-3.5 h-3.5',
  },

  // Lista de abonos (compact)
  lista: 'space-y-2',

  // Item de abono
  item: {
    container: 'flex items-center gap-2 p-2 backdrop-blur-xl bg-gray-50/80 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all',
    iconContainer: 'flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg',
    icon: 'w-4 h-4 text-indigo-600 dark:text-indigo-400',
    content: 'flex-1 min-w-0',
    header: 'flex items-center gap-1.5 mb-0.5',
    monto: 'text-base font-bold text-gray-900 dark:text-white',
    badge: 'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
    footer: 'flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400',
    footerIcon: 'w-3 h-3',
    observaciones: 'text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate',
  },

  // Empty state
  empty: {
    container: 'text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg',
    icon: 'w-10 h-10 text-gray-400 mx-auto mb-2',
    text: 'text-xs text-gray-600 dark:text-gray-400',
  },

  // Total
  total: {
    container: 'mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700',
    row: 'flex items-center justify-between',
    label: 'text-xs font-medium text-gray-600 dark:text-gray-400',
    value: 'text-base font-bold text-gray-900 dark:text-white',
  },
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtener configuración de método de pago
 */
export function getMetodoPagoConfig(metodoPago: string) {
  return METODOS_PAGO_CONFIG[metodoPago as keyof typeof METODOS_PAGO_CONFIG] || {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
  }
}

/**
 * Construir className de badge según método
 */
export function getBadgeMetodoClassName(metodoPago: string): string {
  const config = getMetodoPagoConfig(metodoPago)
  return `${ultimosAbonosSectionStyles.item.badge} ${config.bg} ${config.text}`
}
