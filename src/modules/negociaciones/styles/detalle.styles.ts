/**
 * Estilos Centralizados: Detalle de Negociación
 *
 * Siguiendo principios de arquitectura limpia:
 * - Todos los estilos en un solo lugar
 * - Fácil de mantener y modificar
 * - Consistencia visual garantizada
 */

// ============================================
// LAYOUT
// ============================================
export const layoutClasses = {
  container: 'container mx-auto px-4 py-6 sm:px-6 lg:px-8',
  inner: 'space-y-6',
  grid: 'grid grid-cols-1 gap-6 lg:grid-cols-3',
  gridFull: 'lg:col-span-3',
  gridSidebar: 'lg:col-span-1',
  gridMain: 'lg:col-span-2',
}

// ============================================
// HEADER
// ============================================
export const headerClasses = {
  container: 'rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6 text-white shadow-2xl overflow-hidden relative',
  pattern: 'absolute inset-0 opacity-10 bg-[url("/pattern.svg")]',
  content: 'relative z-10',
  top: 'flex items-start justify-between mb-6',
  titleSection: 'space-y-2',
  title: 'text-3xl font-bold',
  subtitle: 'text-purple-100 text-sm',
  idBadge: 'inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-mono',
  statsGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
  statCard: 'rounded-xl bg-white/10 p-4 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all',
  statLabel: 'flex items-center gap-2 text-white/80 text-xs mb-2',
  statIcon: 'h-4 w-4',
  statValue: 'text-2xl font-bold',
  statSubtext: 'text-white/70 text-xs mt-1',
}

// ============================================
// BREADCRUMBS
// ============================================
export const breadcrumbsClasses = {
  container: 'flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400',
  link: 'hover:text-purple-600 dark:hover:text-purple-400 transition-colors',
  separator: 'h-4 w-4',
  current: 'text-gray-900 dark:text-gray-100 font-medium',
}

// ============================================
// TABS
// ============================================
export const tabsClasses = {
  container: 'border-b border-gray-200 dark:border-gray-700',
  nav: 'flex gap-1 overflow-x-auto scrollbar-hide',
  tab: 'relative pb-3 px-4 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2',
  tabActive: 'text-purple-600 dark:text-purple-400',
  tabInactive: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
  tabUnderline: 'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full',
  tabIcon: 'h-4 w-4',
  tabBadge: 'ml-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
  tabContent: 'flex items-center gap-2',
}

// ============================================
// CARDS
// ============================================
export const cardClasses = {
  container: 'rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow',
  containerLarge: 'rounded-xl border bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800',
  title: 'text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3',
  titleIcon: 'h-6 w-6 text-purple-600',
  subtitle: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
  section: 'space-y-4',
  divider: 'border-t border-gray-200 dark:border-gray-700 my-6',
}

// ============================================
// INFO ROWS
// ============================================
export const infoClasses = {
  row: 'flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0',
  label: 'text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2',
  labelIcon: 'h-4 w-4',
  value: 'text-sm font-semibold text-gray-900 dark:text-white text-right',
  valueLarge: 'text-lg font-bold text-gray-900 dark:text-white',
  valueSuccess: 'text-green-600 dark:text-green-400 font-semibold',
  valueDanger: 'text-red-600 dark:text-red-400 font-semibold',
  valueWarning: 'text-orange-600 dark:text-orange-400 font-semibold',
}

// ============================================
// PROGRESS BAR
// ============================================
export const progressClasses = {
  container: 'space-y-2',
  label: 'flex items-center justify-between text-sm',
  labelText: 'text-gray-700 dark:text-gray-300 font-medium',
  labelValue: 'text-purple-600 dark:text-purple-400 font-bold',
  barContainer: 'h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
  bar: 'h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500',
  barGreen: 'h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500',
}

// ============================================
// BUTTONS
// ============================================
export const buttonClasses = {
  primary: 'inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'inline-flex items-center gap-2 rounded-lg border-2 border-purple-600 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  success: 'inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
  warning: 'inline-flex items-center gap-2 rounded-lg border-2 border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-all',
  icon: 'h-4 w-4',
}

// ============================================
// BADGES
// ============================================
export const badgeClasses = {
  base: 'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
  // Estados de negociación (según DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md)
  activa: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  suspendida: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  completada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  renuncia: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
}

// ============================================
// TIMELINE
// ============================================
export const timelineClasses = {
  container: 'space-y-4',
  step: 'flex items-start gap-4',
  iconContainer: 'flex flex-col items-center',
  icon: 'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
  iconCompleted: 'border-green-500 bg-green-500',
  iconActive: 'border-purple-600 bg-purple-600 animate-pulse',
  iconPending: 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800',
  iconInside: 'h-5 w-5 text-white',
  iconDot: 'h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600',
  line: 'h-12 w-0.5 bg-gray-200 dark:bg-gray-700',
  content: 'flex-1 pb-8',
  label: 'font-semibold text-gray-900 dark:text-white',
  labelActive: 'font-semibold text-purple-600 dark:text-purple-400',
  description: 'text-sm text-gray-600 dark:text-gray-400 mt-1',
  date: 'text-xs text-gray-500 dark:text-gray-500 mt-2',
}

// ============================================
// EMPTY STATES
// ============================================
export const emptyClasses = {
  container: 'rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-12 text-center',
  icon: 'mx-auto mb-4 h-16 w-16 text-gray-400',
  title: 'text-lg font-semibold text-gray-900 dark:text-white mb-2',
  description: 'text-sm text-gray-600 dark:text-gray-400 mb-6',
}

// ============================================
// LOADING
// ============================================
export const loadingClasses = {
  container: 'flex min-h-[400px] items-center justify-center',
  inner: 'text-center space-y-4',
  spinner: 'mx-auto h-12 w-12 animate-spin text-purple-600',
  text: 'text-gray-600 dark:text-gray-400',
}

// ============================================
// ANIMATIONS
// ============================================
export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },
}

// ============================================
// MODALS
// ============================================
export const modalClasses = {
  overlay: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
  container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  content: 'w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800',
  title: 'text-xl font-bold text-gray-900 dark:text-white mb-4',
  description: 'text-sm text-gray-600 dark:text-gray-400 mb-4',
  input: 'w-full rounded-lg border border-gray-300 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
  textarea: 'w-full rounded-lg border border-gray-300 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none',
  footer: 'mt-6 flex gap-3',
  footerButtonCancel: 'flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors',
  footerButtonConfirm: 'flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors',
}
