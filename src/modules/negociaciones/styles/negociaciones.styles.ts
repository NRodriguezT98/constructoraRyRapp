/**
 * Estilos centralizados del módulo de Negociaciones
 *
 * Siguiendo arquitectura limpia - todos los estilos en un solo lugar
 * Tema oscuro profesional con gradientes sutiles
 */

// ============================================
// LAYOUT PRINCIPAL
// ============================================
export const layoutClasses = {
  container: 'min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/30 p-4',
  inner: 'container mx-auto px-4 py-6',
}

// ============================================
// HEADER
// ============================================
export const headerClasses = {
  container: 'mb-6',
  title: 'mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent dark:from-purple-400 dark:to-indigo-400',
  description: 'text-gray-600 dark:text-gray-300',
  actions: 'mt-4 flex flex-wrap items-center gap-4',
}

// ============================================
// MÉTRICAS (CARDS COMPACTAS)
// ============================================
export const metricasClasses = {
  grid: 'mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7',
  card: 'group rounded-xl border bg-white/90 p-3 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-lg dark:bg-gray-800/90',
  iconContainer: 'mx-auto mb-2 w-fit rounded-lg p-2 transition-transform duration-300 group-hover:scale-110',
  icon: 'h-5 w-5 text-white',
  value: 'mb-0.5 text-center bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent',
  label: 'text-center text-xs font-medium text-gray-600 dark:text-gray-300',
}

// Colores por métrica
export const metricasColores = {
  total: {
    gradient: 'from-purple-500 to-indigo-600',
    bg: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    border: 'border-purple-200 dark:border-purple-700',
    valueGradient: 'from-purple-900 to-indigo-600 dark:from-purple-400 dark:to-indigo-400',
  },
  activas: {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
    border: 'border-green-200 dark:border-green-700',
    valueGradient: 'from-green-900 to-emerald-600 dark:from-green-400 dark:to-emerald-400',
  },
  suspendidas: {
    gradient: 'from-yellow-500 to-orange-600',
    bg: 'bg-gradient-to-r from-yellow-500 to-orange-600',
    border: 'border-yellow-200 dark:border-yellow-700',
    valueGradient: 'from-yellow-900 to-orange-600 dark:from-yellow-400 dark:to-orange-400',
  },
  completadas: {
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    border: 'border-blue-200 dark:border-blue-700',
    valueGradient: 'from-blue-900 to-cyan-600 dark:from-blue-400 dark:to-cyan-400',
  },
  cerradas_renuncia: {
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-gradient-to-r from-red-500 to-rose-600',
    border: 'border-red-200 dark:border-red-700',
    valueGradient: 'from-red-900 to-rose-600 dark:from-red-400 dark:to-rose-400',
  },
}

// ============================================
// FILTROS
// ============================================
export const filtrosClasses = {
  container: 'mb-6 rounded-xl border bg-white/90 p-4 shadow-sm backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/90',
  grid: 'grid grid-cols-1 gap-4 md:grid-cols-3',
  label: 'mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300',
  select: 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
  input: 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
  buttonReset: 'rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
}

// ============================================
// LISTA DE NEGOCIACIONES
// ============================================
export const listaClasses = {
  grid: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
  empty: 'rounded-xl border border-dashed border-gray-300 bg-white/50 p-12 text-center backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50',
  emptyIcon: 'mx-auto mb-4 h-16 w-16 text-gray-400',
  emptyTitle: 'mb-2 text-lg font-semibold text-gray-900 dark:text-white',
  emptyDescription: 'text-gray-600 dark:text-gray-400',
}

// ============================================
// CARD DE NEGOCIACIÓN
// ============================================
export const cardClasses = {
  container: 'group cursor-pointer rounded-xl border bg-white/90 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800/90',
  header: 'mb-3 flex items-start justify-between',
  headerInfo: 'flex-1',
  cliente: 'font-semibold text-gray-900 dark:text-white',
  documento: 'text-sm text-gray-600 dark:text-gray-400',
  estadoBadge: 'rounded-full px-3 py-1 text-xs font-semibold',

  divider: 'my-3 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600',

  info: 'grid grid-cols-2 gap-3',
  infoItem: 'flex items-start gap-2',
  infoIcon: 'mt-0.5 h-4 w-4 shrink-0',
  infoLabel: 'text-xs text-gray-600 dark:text-gray-400',
  infoValue: 'text-sm font-semibold text-gray-900 dark:text-white',

  footer: 'mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700',
  footerLabel: 'text-xs text-gray-600 dark:text-gray-400',
  footerValue: 'text-sm font-semibold',

  progress: 'mt-2',
  progressBar: 'h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  progressFill: 'h-full transition-all duration-500',
}

// ============================================
// SKELETON LOADING
// ============================================
export const skeletonClasses = {
  card: 'rounded-xl border bg-white/90 p-4 backdrop-blur-md dark:bg-gray-800/90',
  header: 'mb-3 flex items-start justify-between',
  line: 'h-4 rounded bg-gray-200 dark:bg-gray-700',
  circle: 'h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700',
}

// ============================================
// BOTONES
// ============================================
export const buttonClasses = {
  primary: 'inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl',
  secondary: 'inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
  icon: 'h-4 w-4',
}
