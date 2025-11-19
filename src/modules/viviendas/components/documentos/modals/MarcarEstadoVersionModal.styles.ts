/**
 * Estilos centralizados para MarcarEstadoVersionModal
 * Evita strings de Tailwind > 80 caracteres inline
 */

export const marcarEstadoVersionStyles = {
  // Backdrop
  backdrop:
    'fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4',

  // Contenedor modal
  container:
    'relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden',

  // Header
  header: {
    wrapper: 'px-6 py-4',
    iconContainer:
      'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    icon: 'w-5 h-5 text-white',
    title: 'text-lg font-bold text-white',
    subtitle: 'text-xs text-white/90',
  },

  // Body
  body: {
    wrapper: 'p-6 space-y-4',
    descripcion: 'text-sm text-gray-600 dark:text-gray-400',
  },

  // Labels
  label:
    'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2',

  // Botones de motivos predefinidos
  motivoButton: {
    base: 'w-full text-left px-4 py-2.5 rounded-lg border-2 transition-all text-sm',
    selected: 'border-${COLOR}-500 bg-${COLOR}-50 dark:bg-${COLOR}-950/30',
    unselected:
      'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
    personalizado:
      'w-full text-left px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm text-gray-600 dark:text-gray-400',
  },

  // Textarea
  textarea:
    'w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-600',

  // Select
  select:
    'w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-600',

  // Helper text
  helperText: 'mt-1.5 text-xs text-gray-500 dark:text-gray-400',

  // Link de volver
  link: 'mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',

  // Alert de confirmaciÃ³n (restaurar)
  alert: {
    container:
      'rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4',
    iconWrapper: 'flex gap-3',
    icon: 'w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5',
    title: 'font-semibold text-green-900 dark:text-green-100 text-sm',
    text: 'text-xs text-green-700 dark:text-green-300 mt-1',
  },

  // Botones de acciÃ³n
  buttons: {
    wrapper: 'flex gap-3 pt-2',
    cancel:
      'flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50',
    submit: {
      base: 'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
      loading: 'flex items-center justify-center gap-2',
      loadingIcon: 'w-4 h-4 animate-spin',
    },
  },
}

