/**
 * 🎨 ESTILOS - FORMULARIO DE PLANTILLA
 *
 * Estilos centralizados para el formulario de creación/edición de plantillas.
 */

export const formularioPlantillaStyles = {
  // Página completa
  page: 'min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',

  // Contenedor principal
  content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',

  // Header
  header: {
    container: 'relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 mb-8 shadow-xl',
    pattern: 'absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]',
    content: 'relative z-10 flex items-center gap-6',
    backButton: 'p-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors',
    icon: 'w-6 h-6 text-white',
    textContainer: 'flex-1',
    title: 'text-3xl font-bold text-white mb-2',
    subtitle: 'text-blue-100'
  },

  // Cards
  card: {
    base: 'rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/50 p-8 mb-6 shadow-lg',
    header: {
      container: 'flex items-center justify-between mb-6',
      left: 'flex items-center gap-3',
      iconBox: 'p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600',
      icon: 'w-6 h-6 text-white',
      textContainer: '',
      title: 'text-xl font-semibold text-gray-900',
      subtitle: 'text-sm text-gray-500'
    }
  },

  // Formulario de información básica
  infoBasica: {
    container: 'space-y-6',
    label: 'block text-sm font-semibold text-gray-700 mb-2',
    input: 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all',
    textarea: 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none',
    checkboxContainer: 'flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100',
    checkbox: 'w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20',
    checkboxLabel: 'text-sm font-medium text-gray-700 cursor-pointer'
  },

  // Botones
  button: {
    primary: 'flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl',
    secondary: 'flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md',
    danger: 'px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors',
    add: 'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors'
  },

  // Estado vacío
  empty: {
    container: 'text-center py-12',
    iconContainer: 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4',
    icon: 'w-8 h-8 text-gray-400',
    text: 'text-gray-600 mb-4',
    link: 'text-blue-600 hover:text-blue-700 font-medium'
  },

  // Footer de acciones
  footer: {
    container: 'fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 py-4 shadow-2xl z-50',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4'
  },

  // Paso Item
  pasoItem: {
    container: (hasErrors: boolean) => `rounded-lg border-2 transition-all duration-200 ${
      hasErrors
        ? 'border-red-300 bg-red-50/50'
        : 'border-gray-200 bg-white hover:border-blue-300'
    }`,
    header: {
      container: 'flex items-center gap-3 p-4 cursor-pointer',
      gripIcon: 'w-5 h-5 text-gray-400 flex-shrink-0 cursor-grab active:cursor-grabbing hover:text-blue-500 transition-colors',
      numberBadge: 'flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex-shrink-0',
      content: 'flex-1 min-w-0',
      title: 'font-medium text-gray-900 truncate',
      titleEmpty: 'text-gray-400 italic',
      subtitle: 'text-sm text-gray-500 truncate',
      badges: {
        container: 'flex items-center gap-2',
        obligatorio: 'px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700',
        documentos: 'px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700'
      }
    },
    expanded: {
      container: 'border-t border-gray-200 overflow-hidden',
      content: 'p-6 space-y-6',
      grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
      gridFull: 'md:col-span-2'
    },
    form: {
      label: 'block text-sm font-medium text-gray-700 mb-2',
      input: 'w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      textarea: 'w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none',
      checkbox: 'w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500',
      checkboxLabel: 'flex items-center gap-2 cursor-pointer',
      checkboxText: 'text-sm text-gray-700'
    },
    documento: {
      container: 'flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200',
      icon: 'w-4 h-4 text-gray-400 flex-shrink-0 mt-1',
      content: 'flex-1 space-y-2',
      input: 'w-full px-3 py-1.5 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      checkboxContainer: 'flex items-center gap-2',
      checkbox: 'w-3 h-3 rounded border-gray-300 text-blue-600',
      checkboxLabel: 'flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer',
      deleteButton: 'p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors flex-shrink-0'
    }
  }
} as const
