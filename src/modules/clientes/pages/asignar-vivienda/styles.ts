/**
 * 🎨 SISTEMA DE DISEÑO ESTÁNDAR - ASIGNAR VIVIENDA
 *
 * ✅ Sigue el mismo patrón que nueva-vivienda-view
 * ✅ Paleta: Cyan→Blue→Indigo (módulo Clientes)
 * ✅ Diseño compacto y consistente
 * ✅ Modo oscuro completo
 */

export const pageStyles = {
  // ==================== CONTENEDOR PRINCIPAL ====================
  container: 'min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50/30 to-blue-50/30 dark:from-gray-950 dark:via-cyan-950/20 dark:to-blue-950/20',

  inner: 'container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4',

  // ==================== HEADER CON BREADCRUMBS ====================
  header: {
    container: 'relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 p-6 shadow-2xl shadow-cyan-500/20',
    pattern: 'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10',

    // Breadcrumbs
    breadcrumbs: 'flex items-center gap-2 mb-4 text-xs text-cyan-100 dark:text-cyan-200',
    breadcrumbItem: 'hover:text-white transition-colors cursor-pointer',
    breadcrumbSeparator: 'text-cyan-300 dark:text-cyan-400',
    breadcrumbCurrent: 'text-white font-medium',

    // Título
    topRow: 'flex items-center justify-between',
    titleGroup: 'flex items-center gap-3',
    iconCircle: 'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    icon: 'w-6 h-6 text-white',
    titleWrapper: 'space-y-0.5',
    title: 'text-2xl font-bold text-white',
    subtitle: 'text-cyan-100 dark:text-cyan-200 text-xs',
  },

  // 📍 BREADCRUMBS DISCRETOS (si se usan por separado)
  breadcrumbs: {
    container: 'flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4',
    link: 'hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors',
    separator: 'text-gray-300 dark:text-gray-600',
    current: 'text-gray-700 dark:text-gray-300 font-medium',
  },

  // 📐 LAYOUT PRINCIPAL CON SIDEBAR - COMPACTO
  mainLayout: {
    container: 'grid grid-cols-1 lg:grid-cols-12 gap-3',
    content: 'lg:col-span-8 space-y-3',
    sidebar: 'lg:col-span-4',
  },

  // ==================== STEPPER HORIZONTAL ====================
  stepper: {
    container: 'backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700 p-3 shadow-2xl shadow-cyan-500/10',
    wrapper: 'flex items-center justify-between gap-2',

    step: {
      container: 'flex flex-col items-center flex-1 relative',
      iconWrapper: 'relative flex items-center justify-center',
      iconCircle: 'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
      iconCircleCompleted: 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30',
      iconCircleActive: 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30',
      iconCircleInactive: 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700',
      icon: 'w-5 h-5',
      checkIcon: 'w-5 h-5',

      label: 'mt-2 text-xs font-medium text-center transition-colors',
      labelCompleted: 'text-green-600 dark:text-green-400',
      labelActive: 'text-cyan-600 dark:text-cyan-400',
      labelInactive: 'text-gray-500 dark:text-gray-400',

      // Conector (línea entre pasos)
      connector: 'absolute top-5 left-1/2 w-full h-0.5 -z-10 hidden sm:block',
      connectorCompleted: 'bg-gradient-to-r from-green-500 to-emerald-500',
      connectorInactive: 'bg-gray-200 dark:bg-gray-700',
    },
  },

  // ==================== CARD DE CONTENIDO ====================
  card: {
    base: 'backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700 p-3 shadow-xl min-h-[300px]',
    section: 'space-y-3',
    sectionTitle: 'text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2',
    sectionIcon: 'w-4 h-4 text-cyan-600 dark:text-cyan-400',
  },

  // ==================== SIDEBAR STICKY ====================
  sidebar: {
    container: 'lg:sticky lg:top-4 space-y-3',
    card: 'backdrop-blur-xl bg-gradient-to-br from-cyan-50/80 to-blue-50/80 dark:from-cyan-950/70 dark:to-blue-950/70 rounded-xl border border-cyan-200/50 dark:border-cyan-700 p-4 shadow-lg',
    title: 'text-xs font-bold text-cyan-900 dark:text-cyan-100 mb-3 flex items-center gap-2 uppercase tracking-wider',
    titleIcon: 'w-4 h-4',
    value: 'text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent',
    label: 'text-xs text-cyan-700 dark:text-cyan-300 font-medium mt-1',
    divider: 'border-t border-cyan-200 dark:border-cyan-700 my-3',
    item: 'flex items-center justify-between py-2',
    itemLabel: 'text-xs text-gray-600 dark:text-gray-400',
    itemValue: 'text-sm font-bold text-gray-900 dark:text-white',
  },

  // ==================== LABELS DE FORMULARIO ====================
  label: {
    base: 'flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300',
    required: 'text-red-500',
    optional: 'text-xs text-gray-500 dark:text-gray-400 font-normal',
  },

  // ==================== INPUTS DE FORMULARIO ====================
  input: {
    base: 'w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none text-sm',
    success: 'w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-green-500 dark:border-green-500 ring-2 ring-green-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all text-sm',
    error: 'w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-red-500 dark:border-red-500 ring-2 ring-red-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all text-sm',
    readonly: 'w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-not-allowed',
  },

  // ==================== NAVEGACIÓN ====================
  navigation: {
    container: 'backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700 p-3 shadow-2xl shadow-cyan-500/10',
    content: 'flex items-center justify-between',

    backButton: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
    backIcon: 'w-4 h-4',

    nextButton: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed',
    nextIcon: 'w-4 h-4',

    submitButton: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40',
    submitIcon: 'w-4 h-4',

    stepIndicator: 'text-xs text-gray-600 dark:text-gray-400 font-medium',
  },

  // Compatibilidad con código existente (alias)
  button: {
    primary: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30',
    secondary: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all',
    success: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/30',
    danger: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/30',
  },

  footer: {
    container: 'flex items-center justify-between pt-4 mt-6 border-t-2 border-gray-200 dark:border-gray-700',
    actions: 'flex items-center gap-2',
  },

  // 📊 PROGRESS BAR PREMIUM
  progress: {
    container: 'space-y-2 mb-3',
    label: 'flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300',
    bar: 'w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden shadow-inner',
    fill: 'h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-500 shadow-lg',
  },

  // ⚠️ ALERTAS PREMIUM - COMPACTO
  alert: {
    info: 'backdrop-blur-xl bg-blue-50/90 dark:bg-blue-950/80 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-3 flex items-start gap-2.5 shadow-lg',
    success: 'backdrop-blur-xl bg-green-50/90 dark:bg-green-950/80 border-2 border-green-200 dark:border-green-700 rounded-lg p-3 flex items-start gap-2.5 shadow-lg',
    warning: 'backdrop-blur-xl bg-yellow-50/90 dark:bg-yellow-950/80 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-3 flex items-start gap-2.5 shadow-lg',
    error: 'backdrop-blur-xl bg-red-50/90 dark:bg-red-950/80 border-2 border-red-200 dark:border-red-700 rounded-lg p-3 flex items-start gap-2.5 shadow-lg',
    icon: 'w-4 h-4 flex-shrink-0 mt-0.5',
    content: 'flex-1',
    title: 'font-bold text-xs mb-0.5',
    message: 'text-xs leading-relaxed',
  },
}

export const animations = {
  page: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  content: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  sidebar: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, delay: 0.15, ease: 'easeOut' },
  },

  validation: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  card: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
}
