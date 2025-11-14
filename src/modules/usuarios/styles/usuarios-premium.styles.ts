/**
 * 🎨 ESTILOS PREMIUM - MÓDULO USUARIOS
 *
 * Sistema de diseño premium con glassmorphism para gestión de usuarios.
 * Identidad visual: Violet→Purple (administración/sistema)
 *
 * Características:
 * - Glassmorphism con backdrop-blur-xl
 * - Gradientes violet→purple (identidad del módulo)
 * - Animaciones fluidas con Framer Motion
 * - Responsive design (mobile, tablet, desktop)
 * - Dark mode compatible
 * - Shadows premium con violet tints
 */

// 🎨 Colores de métricas
export const metricasUsuariosColors = {
  total: {
    gradient: 'from-violet-500 to-purple-600',
    glowColor: 'from-violet-500/20 to-purple-600/20',
    textGradient: 'from-violet-600 to-purple-700 dark:from-violet-400 dark:to-purple-500'
  },
  administradores: {
    gradient: 'from-red-500 to-rose-600',
    glowColor: 'from-red-500/20 to-rose-600/20',
    textGradient: 'from-red-600 to-rose-700 dark:from-red-400 dark:to-rose-500'
  },
  activos: {
    gradient: 'from-green-500 to-emerald-600',
    glowColor: 'from-green-500/20 to-emerald-600/20',
    textGradient: 'from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500'
  },
  bloqueados: {
    gradient: 'from-gray-500 to-slate-600',
    glowColor: 'from-gray-500/20 to-slate-600/20',
    textGradient: 'from-gray-600 to-slate-700 dark:from-gray-400 dark:to-slate-500'
  }
}

export const usuariosPremiumStyles = {
  // 🎨 HEADER HERO
  header: {
    container: 'relative overflow-visible rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-700 dark:via-purple-700 dark:to-indigo-800 p-8 shadow-2xl shadow-violet-500/20 mb-6 z-10',
    pattern: 'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10',
    topRow: 'flex items-center justify-between',
    titleGroup: 'flex items-center gap-4',
    iconCircle: 'w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-violet-500/30',
    icon: 'w-7 h-7 text-white',
    titleWrapper: 'space-y-1',
    title: 'text-3xl font-bold text-white',
    subtitle: 'text-violet-100 dark:text-violet-200 text-sm',
    badge: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium shadow-lg'
  },

  // 🎈 FAB (Floating Action Button - Superior derecho)
  fab: {
    container: 'fixed top-6 right-6 z-50',
    button: 'group relative overflow-hidden flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-2xl shadow-violet-500/50 hover:shadow-violet-600/60 hover:scale-110 transition-all duration-300',
    buttonGlow: 'absolute inset-0 bg-gradient-to-r from-violet-400 to-indigo-400 blur-xl opacity-50 group-hover:opacity-75 transition-opacity',
    buttonContent: 'relative z-10 flex items-center gap-2',
    icon: 'w-5 h-5',
    text: 'text-sm font-bold'
  },

  // 📊 MÉTRICAS (4 cards)
  metricas: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6',
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
    container: 'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-2xl shadow-violet-500/10 mb-6',
    wrapper: 'flex flex-wrap items-center gap-3',

    // Input de búsqueda
    searchWrapper: 'relative flex-1 min-w-[250px]',
    searchIconLeft: 'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    searchInput: 'w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',

    // Selects
    select: 'px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all text-sm appearance-none cursor-pointer min-w-[140px]',

    // Botón limpiar
    clearButton: 'px-4 py-2.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors',

    // Botón crear
    createButton: 'group relative overflow-hidden flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-600/40 transition-all duration-300',
    createButtonGlow: 'absolute inset-0 bg-gradient-to-r from-violet-400 to-indigo-400 blur-lg opacity-30 group-hover:opacity-50 transition-opacity',
    createButtonContent: 'relative z-10 flex items-center gap-2',
    createIcon: 'w-4 h-4',
    createText: 'text-sm font-bold'
  },

  // 📋 TABLA
  tabla: {
    container: 'backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden',
    wrapper: 'overflow-x-auto',
    table: 'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
    thead: 'bg-gray-50 dark:bg-gray-900/50',
    th: 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300',
    tbody: 'divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800',
    tr: 'hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors',
    td: 'whitespace-nowrap px-4 py-3 text-sm',

    // Avatar
    avatarCell: 'flex items-center gap-3',
    avatar: 'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-medium text-white shadow-lg',
    avatarInfo: 'min-w-0',
    avatarNombre: 'font-medium text-gray-900 dark:text-white truncate',
    avatarWarning: 'text-xs text-orange-600 dark:text-orange-400',

    // Email
    email: 'text-gray-600 dark:text-gray-400',

    // Badges
    badgeBase: 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
    badgeRol: {
      Administrador: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30',
      Gerente: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30',
      Vendedor: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30',
    },
    badgeEstado: {
      Activo: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30',
      Inactivo: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-md shadow-gray-500/30',
      Bloqueado: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30',
    },

    // Acciones
    actionButton: 'p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all',
  },

  // 🚫 EMPTY STATE
  empty: {
    wrapper: 'flex flex-col items-center justify-center py-16 text-center backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-gray-200/50 dark:border-gray-700/50',
    icon: 'h-12 w-12 text-gray-400 dark:text-gray-600 mb-4',
    title: 'text-lg font-medium text-gray-900 dark:text-white mb-2',
    description: 'text-sm text-gray-600 dark:text-gray-400',
  },

  // ⏳ LOADING
  loading: {
    wrapper: 'flex items-center justify-center py-16',
    spinner: 'h-8 w-8 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-violet-600',
  }
}
