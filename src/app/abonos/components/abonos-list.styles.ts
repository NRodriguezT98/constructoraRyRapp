/**
 * 🎨 ESTILOS CENTRALIZADOS - Lista de Abonos
 *
 * Diseño moderno y compacto siguiendo ESTANDAR-DISENO-UI.md
 * Compatible con modo claro y oscuro
 */

export const abonosListStyles = {
  // 📦 CONTENEDOR PRINCIPAL
  container: 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900',
  page: 'max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-4',

  // ✨ HEADER MODERNO
  header: {
    container: 'relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 p-6 sm:p-8 shadow-xl',
    pattern: 'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]',
    content: 'relative z-10',
    titleGroup: 'space-y-2',
    title: 'text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-3',
    titleIcon: 'w-8 h-8 sm:w-10 sm:h-10',
    subtitle: 'text-sm sm:text-base text-blue-100 dark:text-blue-200',
    badge: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium',
    badgeIcon: 'w-3.5 h-3.5',
  },

  // 📊 MÉTRICAS CARDS (Glassmorphism)
  metricas: {
    container: 'grid grid-cols-2 lg:grid-cols-4 gap-3',
    card: 'group relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 p-4 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl',
    cardGlow: 'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    content: 'relative z-10 flex items-center justify-between',
    info: 'flex-1 min-w-0',
    value: 'text-xl sm:text-2xl font-bold mb-1 bg-gradient-to-br bg-clip-text text-transparent',
    label: 'text-xs text-gray-600 dark:text-gray-400 font-medium',
    iconContainer: 'relative',
    iconCircle: 'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg',
    icon: 'w-6 h-6 text-white',
    iconGlow: 'absolute inset-0 rounded-xl blur-xl opacity-50',
  },

  // 🔍 FILTROS (Floating Card)
  filtros: {
    container: 'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-4',
    header: 'flex items-center gap-2 mb-3',
    headerIcon: 'w-5 h-5 text-blue-600 dark:text-blue-400',
    headerTitle: 'text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent',
    grid: 'grid grid-cols-1 md:grid-cols-3 gap-3',

    inputGroup: 'space-y-2',
    label: 'text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide',
    inputWrapper: 'relative',
    searchIcon: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400',
    input: 'w-full h-10 pl-10 pr-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all text-sm',
    clearButton: 'absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors',
    clearIcon: 'w-4 h-4 text-gray-400',

    radioGroup: 'space-y-2',
    radioOptions: 'flex flex-wrap gap-2',
    radioButton: 'px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all cursor-pointer hover:scale-105',
    radioActive: 'border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30',
    radioInactive: 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-gray-800',

    footer: 'flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-800',
    resultados: 'text-xs font-medium text-gray-600 dark:text-gray-400',
    limpiarButton: 'text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
  },

  // 🃏 ABONO CARD (Premium Design)
  card: {
    wrapper: 'group',
    container: 'relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1',
    glow: 'absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
    content: 'relative z-10 p-4',

    header: 'flex justify-between items-start mb-3 pb-3 border-b border-gray-100 dark:border-gray-800',
    referencia: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30',
    fecha: 'flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium',
    fechaIcon: 'w-3.5 h-3.5',

    monto: 'text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent',

    infoGrid: 'grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3',
    infoItem: 'flex items-start gap-2.5',
    iconCircle: 'w-9 h-9 rounded-lg flex items-center justify-center shadow-md',
    icon: 'w-4 h-4 text-white',
    infoText: 'flex-1 min-w-0',
    infoLabel: 'text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mb-0.5',
    infoValue: 'text-sm font-semibold text-gray-900 dark:text-gray-100 truncate',

    metodo: 'flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800',
    metodoIcon: 'w-5 h-5 text-purple-600 dark:text-purple-400',
    metodoText: 'text-sm font-semibold text-purple-900 dark:text-purple-100',

    footer: 'flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800',
    button: 'flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all hover:scale-105',
    buttonPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30',
    buttonDanger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/30',
    buttonIcon: 'w-4 h-4',

    badge: 'px-2.5 py-1 text-[10px] rounded-full font-bold uppercase tracking-wide',
    badgeActiva: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30',
    badgeSuspendida: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30',
    badgeCerrada: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30',
    badgeCompletada: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30',
  },

  // 🎈 FAB (Floating Action Button - Superior Derecho)
  fab: {
    container: 'fixed top-6 right-6 z-50',
    button: 'group relative overflow-hidden flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-600/60 hover:scale-110 transition-all duration-300',
    buttonGlow: 'absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-50 group-hover:opacity-75 transition-opacity',
    buttonContent: 'relative z-10 flex items-center gap-2',
    icon: 'w-5 h-5',
    text: 'text-sm font-bold',
  },

  // 🎭 EMPTY STATE
  empty: {
    container: 'text-center py-16',
    iconWrapper: 'relative inline-block mb-4',
    icon: 'w-20 h-20 text-gray-400 dark:text-gray-600',
    iconGlow: 'absolute inset-0 blur-2xl opacity-20',
    title: 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-2',
    description: 'text-sm text-gray-600 dark:text-gray-400 mb-6',
    button: 'inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105',
  },

  // 🔄 LOADING STATE
  loading: {
    container: 'animate-pulse space-y-4',
    header: 'h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-2xl',
    metricas: 'grid grid-cols-2 lg:grid-cols-4 gap-3',
    metricaSkeleton: 'h-24 bg-gray-200 dark:bg-gray-800 rounded-xl',
    filtros: 'h-32 bg-gray-200 dark:bg-gray-800 rounded-xl',
    cards: 'space-y-3',
    cardSkeleton: 'h-48 bg-gray-200 dark:bg-gray-800 rounded-xl',
  },

  // 🎨 GRADIENTES Y COLORES
  gradients: {
    primary: 'from-blue-600 via-indigo-600 to-purple-600',
    success: 'from-green-600 via-emerald-600 to-teal-600',
    danger: 'from-red-600 via-rose-600 to-pink-600',
    warning: 'from-yellow-600 via-orange-600 to-amber-600',
  },
}

// 🎨 Colores para iconos de métricas
export const metricasIconColors = {
  total: {
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'bg-blue-500/50',
    text: 'from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400',
  },
  monto: {
    gradient: 'from-green-500 to-emerald-600',
    glow: 'bg-green-500/50',
    text: 'from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400',
  },
  mes: {
    gradient: 'from-purple-500 to-pink-600',
    glow: 'bg-purple-500/50',
    text: 'from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400',
  },
  recaudado: {
    gradient: 'from-orange-500 to-red-600',
    glow: 'bg-orange-500/50',
    text: 'from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400',
  },
}

// 🎨 Colores para iconos de info cards
export const infoIconColors = {
  cliente: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  vivienda: 'bg-gradient-to-br from-green-500 to-emerald-600',
  proyecto: 'bg-gradient-to-br from-purple-500 to-pink-600',
  estado: 'bg-gradient-to-br from-orange-500 to-red-600',
}
