/**
 * Estilos centralizados para la página de Crear Negociación
 * Siguiendo el patrón de separación de responsabilidades
 */

export const pageStyles = {
  // Contenedor principal
  container: 'min-h-screen bg-gray-50 dark:bg-gray-900',
  inner: 'container mx-auto px-4 py-6 space-y-6',

  // Stepper
  stepper: {
    container: 'mb-6',
    wrapper: 'max-w-3xl mx-auto',
  },

  // Layout principal con sidebar
  mainLayout: {
    container: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
    content: 'lg:col-span-2 space-y-4',
    sidebar: 'lg:col-span-1',
  },

  // Alertas
  alert: {
    error:
      'flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800',
    icon: 'w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5',
    content: 'flex-1',
    title: 'text-sm font-semibold',
    message: 'text-sm mt-1',
  },

  // Card principal de contenido
  card: {
    base: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
  },

  // Botones (Footer)
  button: {
    ghost:
      'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors',
    secondary:
      'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors',
    primary:
      'px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    success:
      'px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
  },
}
