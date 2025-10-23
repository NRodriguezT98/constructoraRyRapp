/**
 * 🎨 ESTILOS CENTRALIZADOS - SELECCIÓN DE CLIENTE
 *
 * Sistema de diseño premium con glassmorphism para la vista de selección de cliente.
 * Inspirado en el diseño moderno de la lista de abonos.
 *
 * Características:
 * - Glassmorphism con backdrop-blur-xl
 * - Gradientes vibrantes (blue→indigo→purple, orange→amber)
 * - Animaciones fluidas con Framer Motion
 * - Responsive design (mobile, tablet, desktop)
 * - Dark mode compatible
 * - Shadows premium con tints de color
 */

export const seleccionClienteStyles = {
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

  // 🔍 BÚSQUEDA
  search: {
    container: 'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-2xl shadow-blue-500/10',
    inputWrapper: 'relative',
    iconLeft: 'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none',
    input: 'w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
    clearButton: 'absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer',
    clearIcon: 'w-3.5 h-3.5 text-gray-600 dark:text-gray-400',
    footer: 'flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700',
    resultCount: 'text-xs text-gray-600 dark:text-gray-400 font-medium'
  },

  // 💳 CLIENTE CARD
  card: {
    container: 'group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 p-5 shadow-md hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer',
    glow: 'absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
    content: 'relative z-10',

    // Top section: Cliente + Financiero
    topRow: 'flex items-start justify-between gap-6 mb-4',

    // Cliente (left)
    clienteSection: 'flex items-start gap-3 flex-1 min-w-0',
    avatarCircle: 'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0',
    avatarIcon: 'w-6 h-6 text-white',
    clienteInfo: 'flex-1 min-w-0',
    clienteNombre: 'text-lg font-bold text-gray-900 dark:text-white mb-1 truncate',
    clienteDocumento: 'text-xs text-gray-500 dark:text-gray-400 mb-2',

    // Vivienda info (badges)
    viviendaBadges: 'flex items-center gap-2 flex-wrap',
    proyectoBadge: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm',
    viviendaBadge: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-xs font-bold text-white shadow-md shadow-orange-500/30',
    badgeIcon: 'w-3.5 h-3.5',

    // Financiero (right)
    financieroGrid: 'grid grid-cols-3 gap-2',
    metricBox: 'backdrop-blur-sm rounded-xl px-3 py-2 text-center border border-white/50 dark:border-gray-700/50 shadow-sm',
    metricLabel: 'text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-medium',
    metricValue: 'text-sm font-bold',

    // Progress bar (bottom)
    progressSection: 'pt-3 border-t border-gray-200 dark:border-gray-700',
    progressHeader: 'flex justify-between items-center mb-2',
    progressLabel: 'text-xs font-semibold text-gray-600 dark:text-gray-400',
    progressPercent: 'text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent',
    progressBar: 'h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-inner',
    progressFill: 'h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-lg shadow-orange-500/50 transition-all duration-700',

    // Arrow icon
    arrowIcon: 'w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0'
  },

  // 🎭 EMPTY STATE
  empty: {
    container: 'text-center py-16',
    iconWrapper: 'relative inline-block mb-6',
    iconCircle: 'w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mx-auto',
    icon: 'w-12 h-12 text-blue-500 dark:text-blue-400',
    iconGlow: 'absolute inset-0 blur-3xl bg-blue-500/20 rounded-full',
    title: 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-2',
    description: 'text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto'
  },

  // ⏳ LOADING STATE
  loading: {
    container: 'space-y-6',
    headerSkeleton: 'h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-3xl animate-pulse',
    metricsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    metricSkeleton: 'h-28 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse',
    searchSkeleton: 'h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse',
    cardSkeleton: 'h-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse'
  },

  // 🎨 GRADIENTES Y COLORES
  gradients: {
    primary: 'from-blue-600 via-indigo-600 to-purple-600',
    secondary: 'from-orange-500 to-amber-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-orange-600 to-amber-600',
    danger: 'from-red-500 to-rose-600',
    muted: 'from-gray-500 to-slate-600'
  }
}

/**
 * 🎨 Colores para iconos de métricas
 */
export const metricasIconColors = {
  clientes: {
    gradient: 'from-blue-500 to-indigo-600',
    textGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    glowColor: 'from-blue-500/20 to-indigo-500/20'
  },
  abonado: {
    gradient: 'from-green-500 to-emerald-600',
    textGradient: 'from-green-600 via-emerald-600 to-teal-600',
    glowColor: 'from-green-500/20 to-emerald-500/20'
  },
  ventas: {
    gradient: 'from-purple-500 to-pink-600',
    textGradient: 'from-purple-600 via-pink-600 to-rose-600',
    glowColor: 'from-purple-500/20 to-pink-500/20'
  },
  pendiente: {
    gradient: 'from-orange-500 to-amber-600',
    textGradient: 'from-orange-600 via-amber-600 to-yellow-600',
    glowColor: 'from-orange-500/20 to-amber-500/20'
  }
}

/**
 * 🎨 Colores para avatares de clientes (basado en iniciales)
 */
export const avatarGradients = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-amber-600',
  'from-green-500 to-emerald-600',
  'from-red-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-yellow-500 to-orange-600',
  'from-teal-500 to-cyan-600'
]

/**
 * 🎯 Función helper para obtener gradient de avatar basado en nombre
 */
export const getAvatarGradient = (nombre: string): string => {
  const index = nombre.charCodeAt(0) % avatarGradients.length
  return avatarGradients[index]
}
