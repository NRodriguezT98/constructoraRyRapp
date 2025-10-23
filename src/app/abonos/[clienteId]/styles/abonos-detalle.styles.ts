/**
 * 🎨 ESTILOS CENTRALIZADOS - Abonos Detalle
 * Todas las clases de Tailwind organizadas por sección
 */

export const containerStyles = {
  page: 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950',
  wrapper: 'max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6',
}

export const headerStyles = {
  container: 'relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-4 sm:p-6 md:p-8 shadow-2xl',
  backgroundPattern: 'absolute inset-0 opacity-10',
  patternInner: 'absolute inset-0',
  lightEffect1: 'absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-white/20 rounded-full blur-3xl',
  lightEffect2: 'absolute bottom-0 left-0 w-48 h-48 sm:w-96 sm:h-96 bg-purple-300/20 rounded-full blur-3xl',
  content: 'relative z-10',

  // Breadcrumb
  breadcrumb: 'flex items-center gap-1.5 sm:gap-2 text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 md:mb-6 flex-wrap',
  breadcrumbButton: 'flex items-center gap-1 hover:text-white transition-colors',
  breadcrumbCurrent: 'text-white font-medium truncate max-w-[150px] sm:max-w-none',

  // Info
  infoWrapper: 'flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4',
  clienteSection: 'flex items-start sm:items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto',
  avatar: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center shadow-xl',
  avatarIcon: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white',

  title: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3 flex-wrap',
  sparkle: 'w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse flex-shrink-0',

  metaInfo: 'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/90',
  metaItem: 'flex items-center gap-1.5 sm:gap-2',
  metaIcon: 'w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0',
  metaText: 'text-xs sm:text-sm truncate',

  projectInfo: 'flex items-center gap-1.5 sm:gap-2 text-white/80 text-xs sm:text-sm flex-wrap',
  projectIcon: 'w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0',

  backButton: 'bg-white/20 backdrop-blur-xl border-white/30 text-white hover:bg-white/30 text-sm w-full sm:w-auto',
}

export const metricasStyles = {
  grid: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4',
  card: 'relative overflow-hidden rounded-xl p-3 sm:p-4 shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
  cardLightEffect: 'absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 opacity-20 rounded-full blur-3xl',
  cardContent: 'relative z-10',

  iconWrapper: 'flex items-center justify-between mb-2 sm:mb-3',
  iconCircle: 'w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-md',
  icon: 'w-4 h-4 sm:w-5 sm:h-5 text-white',
  iconSecondary: 'w-4 h-4',

  label: 'text-gray-600 dark:text-gray-400 text-xs font-medium mb-0.5',
  value: 'text-xl sm:text-2xl font-bold text-gray-900 dark:text-white',

  progressWrapper: 'mt-2 flex items-center gap-2',
  progressBar: 'flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
  progressFill: 'h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-sm',
  progressText: 'text-gray-700 dark:text-gray-300 text-xs font-semibold',
}

export const fuentesStyles = {
  section: 'space-y-3',
  header: 'flex items-center justify-between mb-3',
  title: 'text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2',
  titleIcon: 'w-5 h-5 sm:w-6 sm:h-6 text-orange-500',

  grid: 'grid grid-cols-1 gap-3',
  card: 'relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all',
  cardCompletada: 'opacity-75 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800',
  cardBorder: 'absolute top-0 left-0 w-1 h-full bg-gradient-to-b',
  cardContent: 'p-3 sm:p-4',

  cardHeader: 'flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-3 mb-3',
  iconSection: 'flex items-center gap-2 sm:gap-3 w-full sm:w-auto',
  iconCircle: 'w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0',
  iconImage: 'w-5 h-5 sm:w-6 sm:h-6 text-white',

  infoWrapper: 'space-y-0.5 flex-1 min-w-0',
  infoTitle: 'text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate',
  infoSubtitle: 'text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1',
  infoIcon: 'w-3 h-3 flex-shrink-0',

  button: 'px-3 py-1.5 sm:py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto whitespace-nowrap',
  buttonIcon: 'w-3.5 h-3.5 sm:w-4 sm:h-4',

  metricsGrid: 'grid grid-cols-3 gap-2 sm:gap-3 mb-2.5 sm:mb-3',
  metricItem: 'space-y-0.5',
  metricLabel: 'text-[10px] sm:text-xs text-gray-500 dark:text-gray-400',
  metricValue: 'text-xs sm:text-sm md:text-base font-bold truncate',

  progressSection: 'space-y-1',
  progressHeader: 'flex items-center justify-between text-xs',
  progressLabel: 'text-gray-600 dark:text-gray-400 font-medium',
  progressPercent: 'font-bold',
  progressBar: 'h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
  progressFill: 'h-full bg-gradient-to-r rounded-full relative overflow-hidden',
  progressShine: 'absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12',

  emptyState: 'text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700',
  emptyIcon: 'w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400',
  emptyText: 'text-sm sm:text-base text-gray-600 dark:text-gray-400',
}

export const timelineStyles = {
  section: 'space-y-3',
  header: 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3',
  title: 'text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2',
  titleIcon: 'w-5 h-5 sm:w-6 sm:h-6 text-orange-500',

  exportButton: 'flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center',
  exportIcon: 'w-3.5 h-3.5 sm:w-4 sm:h-4',

  timelineWrapper: 'relative',
  timelineLine: 'absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-pink-500 to-purple-500 hidden sm:block',
  timelineContent: 'space-y-2.5 sm:space-y-3',

  itemWrapper: 'relative flex gap-2 sm:gap-3',
  itemDot: 'relative flex-shrink-0 hidden sm:block',
  dotCircle: 'w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg z-10 relative',
  dotIcon: 'w-5 h-5 sm:w-6 sm:h-6 text-white',
  dotPulse: 'absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-500',

  card: 'flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all',
  cardHeader: 'flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3',

  badgeWrapper: 'flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 mb-1.5',
  badge: 'px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold',
  date: 'text-xs text-gray-500 dark:text-gray-400',

  amount: 'text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400',

  methodBadge: 'flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700',
  methodIcon: 'w-3.5 h-3.5 text-gray-600 dark:text-gray-400',
  methodText: 'text-xs font-medium text-gray-700 dark:text-gray-300',

  notesWrapper: 'p-2 sm:p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600',
  notesText: 'text-xs text-gray-600 dark:text-gray-400 italic',

  emptyState: 'text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
  emptyIcon: 'w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-gray-400',
  emptyTitle: 'text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2',
  emptySubtitle: 'text-xs sm:text-sm text-gray-500 dark:text-gray-500',

  loadingState: 'space-y-2.5',
  loadingCard: 'animate-pulse bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 h-16 sm:h-20',
}

export const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  hoverScale: {
    whileHover: { scale: 1.02, y: -5 },
  },
  hoverScaleSmall: {
    whileHover: { scale: 1.01, y: -2 },
  },
  tap: {
    whileTap: { scale: 0.95 },
  },
}

export const colorSchemes = {
  'Cuota Inicial': {
    from: 'rgb(59, 130, 246)', // blue-500
    to: 'rgb(37, 99, 235)', // blue-600
  },
  'Crédito Hipotecario': {
    from: 'rgb(168, 85, 247)', // purple-500
    to: 'rgb(147, 51, 234)', // purple-600
  },
  'Subsidio Mi Casa Ya': {
    from: 'rgb(34, 197, 94)', // green-500
    to: 'rgb(16, 185, 129)', // green-600
  },
  'Subsidio Caja Compensación': {
    from: 'rgb(251, 146, 60)', // orange-400
    to: 'rgb(249, 115, 22)', // orange-500
  },
  'Subsidio': {
    from: 'rgb(34, 197, 94)', // green-500 (fallback)
    to: 'rgb(16, 185, 129)', // green-600
  },
}
