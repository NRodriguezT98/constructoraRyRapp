/**
 * Estilos centralizados para la Vista de Crear Negociación
 */

export const pageStyles = {
  // Layout principal con espaciado generoso
  container: 'min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20',

  inner: 'container mx-auto px-6 py-10 max-w-6xl', // Centrado con max-w-6xl

  // Header con mejor espaciado
  header: {
    container: 'mb-10',
    title: 'text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-4',
    subtitle: 'mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-3xl',
  },

  // Breadcrumbs más visibles
  breadcrumbs: {
    container: 'flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700',
    link: 'hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2',
    separator: 'text-gray-400',
    current: 'text-gray-900 dark:text-white font-semibold',
  },

  // Card con más espacio interno
  card: {
    wrapper: 'bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6',

    stepper: 'px-12 py-10 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700',

    content: 'px-12 py-12 min-h-[600px]', // Más padding para centrar mejor

    footer: 'px-12 py-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800/95 dark:via-gray-850/95 dark:to-gray-800/95 border-t-2 border-gray-200 dark:border-gray-700 shadow-lg',
  },

  // Botones más grandes y visibles
  button: {
    back: 'inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5',

    cancel: 'inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl',

    next: 'inline-flex items-center gap-3 px-8 py-4 text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl transform hover:-translate-y-0.5',

    submit: 'inline-flex items-center gap-3 px-8 py-4 text-base font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5',
  },

  // Error más visible
  error: {
    container: 'mx-10 mb-8 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-start gap-4 shadow-lg',
    icon: 'w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5',
    text: 'text-base font-medium text-red-700 dark:text-red-300',
  },
}

export const animations = {
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },

  content: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  },
}
