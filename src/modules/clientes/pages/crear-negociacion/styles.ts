/**
 * Sistema de Diseño Minimalista - Crear Negociación
 *
 * Principios:
 * - Espaciado generoso y consistente
 * - Tipografía limpia y legible
 * - Colores sutiles con buenos contrastes
 * - Micro-interacciones suaves
 */

export const pageStyles = {
  // Layout principal - Minimalista con grid
  container: 'min-h-screen bg-white dark:bg-gray-950',

  inner: 'container mx-auto px-4 py-3 max-w-7xl',

  // Header minimalista
  header: {
    container: 'mb-3',
    title: 'text-xl font-light text-gray-900 dark:text-white tracking-tight',
    subtitle: 'mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-normal',
  },

  // Breadcrumbs discretos
  breadcrumbs: {
    container: 'flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-600 mb-3',
    link: 'hover:text-gray-600 dark:hover:text-gray-400 transition-colors',
    separator: 'text-gray-300 dark:text-gray-700',
    current: 'text-gray-600 dark:text-gray-400',
  },

  // Layout principal con sidebar
  mainLayout: {
    container: 'grid grid-cols-1 lg:grid-cols-12 gap-3',
    content: 'lg:col-span-8 space-y-3',
    sidebar: 'lg:col-span-4',
  },

  // Stepper minimalista
  stepper: {
    container: 'bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3 border border-gray-100 dark:border-gray-800',
    wrapper: 'max-w-4xl mx-auto',
  },

  // Card de contenido limpio
  card: {
    base: 'bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-4',
    section: 'space-y-3',
    sectionTitle: 'text-sm font-medium text-gray-900 dark:text-white mb-2.5',
  },

  // Sidebar sticky
  sidebar: {
    container: 'lg:sticky lg:top-3 space-y-2.5',
    card: 'bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-3',
    title: 'text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-2.5',
    value: 'text-lg font-light text-gray-900 dark:text-white',
    label: 'text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider',
    divider: 'border-t border-gray-200 dark:border-gray-800 my-2.5',
  },

  // Inputs modernos y limpios
  input: {
    wrapper: 'space-y-1',
    label: 'text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5',
    labelIcon: 'w-3 h-3 text-gray-400',
    field: 'w-full px-3 py-1.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all',
    fieldSuccess: 'border-green-500 dark:border-green-600 ring-2 ring-green-500/10',
    fieldError: 'border-red-500 dark:border-red-600 ring-2 ring-red-500/10',
    fieldReadonly: 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    validation: 'flex items-center gap-1 text-[10px] mt-0.5',
    validationSuccess: 'text-green-600 dark:text-green-400',
    validationError: 'text-red-600 dark:text-red-400',
    validationIcon: 'w-3 h-3',
  },

  // Botones minimalistas
  button: {
    primary: 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-xs hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed',

    secondary: 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-lg font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all',

    ghost: 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 rounded-lg font-medium text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-all',

    success: 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg font-medium text-xs hover:bg-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed',
  },

  // Footer de navegación
  footer: {
    container: 'flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-800',
    actions: 'flex items-center gap-1.5',
  },

  // Progress bar por paso
  progress: {
    container: 'space-y-1 mb-2.5',
    label: 'flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400',
    bar: 'w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden',
    fill: 'h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500',
  },

  // Estados y alertas minimalistas
  alert: {
    info: 'bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg p-2.5 flex items-start gap-1.5',
    success: 'bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-lg p-2.5 flex items-start gap-1.5',
    warning: 'bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-100 dark:border-yellow-900/50 rounded-lg p-2.5 flex items-start gap-1.5',
    error: 'bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg p-2.5 flex items-start gap-1.5',
    icon: 'w-3.5 h-3.5 flex-shrink-0',
    content: 'flex-1',
    title: 'font-medium text-xs mb-0.5',
    message: 'text-[10px] opacity-90',
  },
}

export const animations = {
  page: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  content: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.25, ease: 'easeInOut' },
  },

  sidebar: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, delay: 0.1 },
  },

  validation: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 },
  },
}
