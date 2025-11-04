/**
 * 🎨 ESTILOS CENTRALIZADOS - AUDITORÍAS
 *
 * Sistema de diseño premium con glassmorphism basado en el módulo de Abonos.
 * Color principal: Azul/Púrpura (para diferenciar de Abonos)
 *
 * Características:
 * - Glassmorphism con backdrop-blur-xl
 * - Gradientes vibrantes (azul→índigo→púrpura)
 * - Animaciones fluidas con Framer Motion
 * - Responsive design (mobile, tablet, desktop)
 * - Dark mode compatible
 * - Shadows premium con tints de color
 */

export const auditoriasStyles = {
  // 🎯 CONTENEDOR PRINCIPAL
  container: {
    page: 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'
  },

  // 🎨 HEADER HERO
  header: {
    container: 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 p-8 shadow-2xl shadow-blue-500/20',
    pattern: 'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10',
    topRow: 'flex items-center justify-between mb-4',
    titleGroup: 'flex items-center gap-4',
    iconCircle: 'w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    icon: 'w-7 h-7 text-white',
    titleWrapper: 'space-y-1',
    title: 'text-3xl font-bold text-white',
    subtitle: 'text-blue-100 dark:text-blue-200 text-sm',
    badge: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium'
  },

  // 📊 MÉTRICAS (4 cards)
  metricas: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    card: 'group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300',
    cardGlow: 'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    content: 'relative z-10 flex items-center gap-4',
    iconCircle: 'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg',
    icon: 'w-6 h-6 text-white',
    textGroup: 'flex-1',
    value: 'text-2xl font-bold bg-gradient-to-br bg-clip-text text-transparent',
    label: 'text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium'
  },

  // 🔍 FILTROS
  filtros: {
    container: 'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-2xl shadow-blue-500/10',
    grid: 'grid grid-cols-1 md:grid-cols-3 gap-3',
    selectWrapper: 'relative',
    label: 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5',
    select: 'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-sm',
    footer: 'flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700',
    resultCount: 'text-xs text-gray-600 dark:text-gray-400 font-medium',
    clearButton: 'text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer'
  },

  // 📋 TABLA
  tabla: {
    container: 'backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-lg',
    wrapper: 'overflow-x-auto',
    table: 'w-full',
    thead: 'bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700',
    th: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider',
    tbody: 'divide-y divide-gray-200 dark:divide-gray-700',
    tr: 'hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors',
    td: 'px-4 py-4 text-sm',
    tdTexto: 'text-gray-900 dark:text-gray-100',
    tdSubtexto: 'text-gray-500 dark:text-gray-400'
  },

  // 🎭 EMPTY STATE
  empty: {
    container: 'text-center py-16',
    iconWrapper: 'relative inline-block mb-6',
    iconCircle: 'w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mx-auto',
    icon: 'w-12 h-12 text-blue-500 dark:text-blue-400',
    iconGlow: 'absolute inset-0 blur-3xl bg-blue-500/20 rounded-full',
    title: 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-2',
    description: 'text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6',
    button: 'inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30'
  },

  // ⏳ LOADING STATE
  loading: {
    container: 'space-y-6',
    headerSkeleton: 'h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-3xl animate-pulse',
    metricsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    metricSkeleton: 'h-28 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse',
    filtrosSkeleton: 'h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse',
    tablaSkeleton: 'h-96 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse'
  },

  // 🎭 MODAL (si aplica)
  modal: {
    overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
    container: 'fixed inset-0 flex items-center justify-center z-50 p-4',
    content: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden',
    header: 'px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    closeButton: 'w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors',
    body: 'px-6 py-4 overflow-y-auto max-h-[60vh]',
    footer: 'px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3'
  }
}

/**
 * 🎨 Colores para iconos de métricas (Auditorías)
 */
export const metricasIconColors = {
  totalEventos: {
    gradient: 'from-blue-500 to-indigo-600',
    textGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    glowColor: 'from-blue-500/20 to-indigo-500/20'
  },
  creates: {
    gradient: 'from-green-500 to-emerald-600',
    textGradient: 'from-green-600 via-emerald-600 to-teal-600',
    glowColor: 'from-green-500/20 to-emerald-500/20'
  },
  updates: {
    gradient: 'from-purple-500 to-pink-600',
    textGradient: 'from-purple-600 via-pink-600 to-rose-600',
    glowColor: 'from-purple-500/20 to-pink-500/20'
  },
  deletes: {
    gradient: 'from-orange-500 to-amber-600',
    textGradient: 'from-orange-600 via-amber-600 to-yellow-600',
    glowColor: 'from-orange-500/20 to-amber-500/20'
  }
}

/**
 * 🎨 Función helper para obtener badge variant basado en acción
 */
export const getAccionBadgeStyles = (accion: string): string => {
  const styles: Record<string, string> = {
    CREATE: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/30',
    UPDATE: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/30',
    DELETE: 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/30'
  }
  return styles[accion] || 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
}
