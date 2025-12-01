/**
 * ============================================
 * ESTILOS: FuentesPagoSection
 * ============================================
 *
 * Estilos centralizados para sección de fuentes de pago
 */

export const fuentesPagoSectionStyles = {
  container: 'backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg',

  header: {
    container: 'flex items-start justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700',
    title: 'text-base font-bold text-gray-900 dark:text-white flex items-center gap-2',
    icon: 'w-5 h-5 text-cyan-600 dark:text-cyan-400',
    subtitle: 'text-xs text-gray-600 dark:text-gray-400 mt-1',
    button: 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-medium transition-all shadow-md hover:shadow-lg',
  },

  grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',

  loadingContainer: 'flex flex-col items-center justify-center py-12',
  loadingSpinner: 'w-8 h-8 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin',
  loadingText: 'mt-3 text-sm text-gray-600 dark:text-gray-400',

  emptyContainer: 'flex flex-col items-center justify-center py-12',
  emptyIcon: 'w-12 h-12 text-gray-400 dark:text-gray-600 mb-3',
  emptyTitle: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
  emptySubtitle: 'text-xs text-gray-500 dark:text-gray-500 mt-1',
}
