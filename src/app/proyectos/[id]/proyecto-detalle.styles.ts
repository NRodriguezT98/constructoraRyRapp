/**
 * Estilos centralizados para Proyecto Detalle
 * Sistema de diseño moderno con glassmorphism y animaciones
 */

// Header con gradiente y glassmorphism
export const headerClasses = {
  container: 'relative overflow-hidden rounded-xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800 p-4 shadow-2xl shadow-green-500/20',
  backgroundPattern: 'absolute inset-0 opacity-10',
  breadcrumb: 'relative z-10 mb-2 flex items-center gap-1.5 text-xs text-white/80',
  breadcrumbIcon: 'h-3 w-3',
  breadcrumbCurrent: 'font-semibold text-white',
  contentWrapper: 'relative z-10 flex items-start justify-between',
  leftSection: 'flex items-center gap-3',
  iconContainer: 'rounded-xl bg-white/20 p-2.5 backdrop-blur-xl transition-transform hover:scale-105',
  icon: 'h-6 w-6 text-white',
  titleSection: 'space-y-0.5',
  title: 'text-xl font-bold text-white',
  location: 'flex items-center gap-1.5 text-sm text-white/90',
  locationIcon: 'h-3.5 w-3.5',
  actionsContainer: 'flex gap-2',
  actionButton: 'bg-white/20 backdrop-blur-xl transition-all hover:bg-white/30 hover:scale-105',
  deleteButton: 'bg-white/20 backdrop-blur-xl transition-all hover:bg-red-500',
  statusBadge: 'mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-xl',
  statusDot: 'h-1.5 w-1.5 rounded-full',
  statusText: 'text-xs font-medium text-white',
}

// Stats Cards mejorados
export const statsCardClasses = {
  container: 'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4',
  card: 'group relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-3 shadow-md backdrop-blur-sm transition-all hover:border-green-400 hover:shadow-lg hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-800/80',
  gradientOverlay: 'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5',
  header: 'relative mb-2.5 flex items-center justify-between',
  iconWrapper: 'rounded-lg p-2 shadow-md transition-transform group-hover:rotate-12',
  icon: 'h-5 w-5 text-white',
  trend: 'flex items-center gap-1 text-xs',
  trendIcon: 'h-3 w-3',
  trendUp: 'text-green-600 dark:text-green-400',
  trendDown: 'text-red-600 dark:text-red-400',
  content: 'relative',
  label: 'mb-0.5 text-xs font-medium text-gray-600 dark:text-gray-400',
  value: 'text-xl font-bold text-gray-900 dark:text-white',
  progressBar: 'mt-2.5 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  progressFill: 'h-full transition-all duration-1000',
}

// Barra de progreso mejorada
export const progressClasses = {
  container: 'rounded-xl border border-gray-200 bg-white/80 p-3 shadow-md backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80',
  header: 'mb-2.5 flex items-center justify-between',
  leftSection: 'flex items-center gap-2.5',
  iconContainer: 'rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-1.5',
  icon: 'h-4 w-4 text-white',
  titleSection: 'space-y-0.5',
  title: 'text-sm font-semibold text-gray-900 dark:text-white',
  subtitle: 'text-xs text-gray-600 dark:text-gray-400',
  rightSection: 'text-right',
  percentage: 'text-xl font-bold text-green-600 dark:text-green-400',
  percentageLabel: 'text-xs text-gray-600 dark:text-gray-400',
  bar: 'relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  barFill: 'h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 transition-all duration-1500',
  shimmer: 'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent',
  milestones: 'mt-2.5 grid grid-cols-3 gap-3',
  milestone: 'text-center',
  milestoneValue: 'mb-0.5 text-lg font-bold text-gray-900 dark:text-white',
  milestoneLabel: 'text-xs text-gray-600 dark:text-gray-400',
}

// Tabs mejorados (PILLS MODERNAS - MÁS VISIBLES)
export const tabsClasses = {
  container: 'mb-4', // Separación del contenido
  nav: 'flex gap-3',
  tab: 'relative px-4 py-2.5 text-sm font-semibold transition-all rounded-lg cursor-pointer',
  tabActive: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30',
  tabInactive: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
  tabContent: 'flex items-center gap-2',
  tabIcon: 'h-4 w-4',
  tabBadge: 'ml-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold',
  tabUnderline: '', // No usado en pills pero mantenido para compatibilidad
}

// Info Cards
export const infoCardClasses = {
  card: 'group rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-3 shadow-md transition-all hover:shadow-lg hover:-translate-y-1 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900',
  header: 'mb-2.5 flex items-center gap-2.5',
  iconContainer: 'rounded-lg bg-gradient-to-br p-1.5',
  icon: 'h-4 w-4 text-white',
  title: 'text-sm font-semibold text-gray-900 dark:text-white',
  content: 'space-y-2 text-sm text-gray-700 dark:text-gray-300',
  row: 'flex items-center gap-1.5 text-xs',
  rowIcon: 'h-3.5 w-3.5 text-gray-400',
  label: 'text-xs text-gray-600 dark:text-gray-400',
  value: 'text-sm font-semibold text-gray-900 dark:text-white',
}

// Gradientes por tipo de stat (VERDE/ESMERALDA/TEAL - consistente con módulo)
export const gradients = {
  presupuesto: 'from-green-500 to-emerald-600',
  manzanas: 'from-emerald-500 to-teal-600',
  viviendas: 'from-teal-500 to-cyan-600',
  fecha: 'from-green-600 to-emerald-700',
  descripcion: 'from-green-500 to-emerald-600',
  contacto: 'from-emerald-500 to-teal-600',
  progreso: 'from-green-500 to-emerald-600',
  ubicacion: 'from-teal-500 to-cyan-600',
  detalles: 'from-green-600 to-emerald-700',
  cronograma: 'from-emerald-600 to-teal-700',
}

// Animaciones Framer Motion
export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  hoverLift: {
    whileHover: { y: -8, scale: 1.02 },
  },
  hoverScale: {
    whileHover: { scale: 1.05 },
  },
  hoverRotate: {
    whileHover: { rotate: 360 },
    transition: { duration: 0.6 },
  },
  statusPulse: {
    animate: { scale: [1, 1.05, 1] },
    transition: { repeat: Infinity, duration: 2 },
  },
}
