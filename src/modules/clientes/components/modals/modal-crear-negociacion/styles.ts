/**
 * Estilos centralizados para Modal de Crear Negociación
 */

export const modalStyles = {
  backdrop: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]',
  container: 'fixed inset-0 flex items-center justify-center z-[9999] p-4 sm:p-6',
  modal: 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800',

  header: {
    container: 'relative px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900',
    title: 'text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3',
    subtitle: 'text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2',
    closeButton: 'absolute top-4 right-4 p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors',
  },

  stepper: {
    container: 'py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700',
  },

  content: {
    container: 'flex-1 overflow-y-auto px-6 py-6',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    fullWidth: 'space-y-6',
  },

  field: {
    label: 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2',
    input: 'w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    inputReadonly: 'w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 cursor-not-allowed',
    select: 'w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    textarea: 'w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none',
    error: 'mt-1 text-sm text-red-600 dark:text-red-400',
  },

  card: {
    base: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm',
    info: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6',
    warning: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6',
    error: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6',
  },

  validation: {
    success: 'flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400',
    error: 'flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400',
    info: 'flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400',
  },

  footer: {
    container: 'px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between gap-4',
    buttonGroup: 'flex gap-3',
  },

  button: {
    primary: 'px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'px-6 py-2.5 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2',
    success: 'px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
  },

  summary: {
    row: 'flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-0',
    label: 'text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2',
    value: 'text-sm font-semibold text-gray-900 dark:text-white',
    highlight: 'text-base font-bold text-blue-600 dark:text-blue-400',
  },

  error: {
    container: 'p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg',
    text: 'text-sm text-red-700 dark:text-red-400',
  },
}

export const animations = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
  step: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  },
}
