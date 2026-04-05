/**
 * ============================================
 * ESTILOS: AccionesSection
 * ============================================
 */

export const accionesSectionStyles = {
  container: 'grid grid-cols-1 sm:grid-cols-3 gap-2',

  button: {
    base: 'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-md',
    primary:
      'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-cyan-500/20 hover:shadow-lg',
    secondary:
      'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/20 hover:shadow-lg',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/20 hover:shadow-lg',
    disabled:
      'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed',
  },

  icon: 'w-4 h-4',
} as const
