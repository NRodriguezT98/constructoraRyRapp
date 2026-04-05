/**
 * ============================================
 * ESTILOS: UltimosAbonosSection
 * ============================================
 */

export const ultimosAbonosSectionStyles = {
  container:
    'p-4 rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50',

  header: {
    container: 'flex items-center justify-between mb-3',
    title:
      'text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2',
    verTodos:
      'text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors',
  },

  card: {
    container:
      'p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-all',
    monto: 'text-lg font-bold text-green-600 dark:text-green-400',
    fecha: 'flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400',
  },

  empty: {
    container: 'text-center py-8',
    icon: 'w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600',
    text: 'text-sm text-gray-600 dark:text-gray-400',
  },
} as const
