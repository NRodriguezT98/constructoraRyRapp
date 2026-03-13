/**
 * Estilos: TipoFuentePagoFormModal
 *
 * Clases de Tailwind centralizadas para el modal.
 * Facilita mantenimiento y consistencia visual.
 */

export const tipoFuentePagoFormModalStyles = {
  backdrop: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  backdropOverlay: 'absolute inset-0 bg-black/60 backdrop-blur-sm',

  modal: 'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl',

  header: {
    container: 'sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between',
    title: 'text-xl font-bold text-white',
    closeButton: 'p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50',
    closeIcon: 'w-5 h-5 text-white',
  },

  form: {
    container: 'p-6 space-y-6',
    section: 'space-y-4',
    sectionTitle: 'text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide',
  },

  input: {
    container: 'space-y-1.5',
    label: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
    required: 'text-red-500',
    hint: 'ml-2 text-xs text-gray-500',
    field: 'w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400',
    fieldMono: 'w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 font-mono',
    textarea: 'w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 resize-none',
    error: 'mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1',
    errorIcon: 'w-4 h-4',
  },

  checkbox: {
    container: 'flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer',
    field: 'w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20',
    fieldActive: 'w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500/20',
    labelContainer: 'flex-1',
    label: 'text-sm font-medium text-gray-900 dark:text-white',
    description: 'text-xs text-gray-500 dark:text-gray-400',
  },

  grid: {
    twoColumns: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    threeColumns: 'grid grid-cols-1 sm:grid-cols-3 gap-4',
  },

  actions: {
    container: 'flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700',
    cancelButton: 'px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50',
    submitButton: 'px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
    icon: 'w-5 h-5',
    iconSpin: 'w-5 h-5 animate-spin',
  },
} as const
