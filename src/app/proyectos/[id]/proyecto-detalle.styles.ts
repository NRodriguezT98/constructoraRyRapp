/**
 * Estilos centralizados para Proyecto Detalle
 * Sistema de diseño moderno con glassmorphism y animaciones
 */

// Header con gradiente y glassmorphism
export const headerClasses = {
  container: 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-2xl',
  backgroundPattern: 'absolute inset-0 opacity-10',
  breadcrumb: 'relative z-10 mb-4 flex items-center gap-2 text-sm text-white/80',
  breadcrumbIcon: 'h-4 w-4',
  breadcrumbCurrent: 'font-semibold text-white',
  contentWrapper: 'relative z-10 flex items-start justify-between',
  leftSection: 'flex items-center gap-4',
  iconContainer: 'rounded-2xl bg-white/20 p-4 backdrop-blur-xl transition-transform hover:scale-105',
  icon: 'h-10 w-10 text-white',
  titleSection: 'space-y-2',
  title: 'text-4xl font-bold text-white',
  location: 'flex items-center gap-2 text-white/90',
  locationIcon: 'h-4 w-4',
  actionsContainer: 'flex gap-3',
  actionButton: 'bg-white/20 backdrop-blur-xl transition-all hover:bg-white/30 hover:scale-105',
  deleteButton: 'bg-white/20 backdrop-blur-xl transition-all hover:bg-red-500',
  statusBadge: 'mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-xl',
  statusDot: 'h-2 w-2 rounded-full',
  statusText: 'text-sm font-medium text-white',
}

// Stats Cards mejorados
export const statsCardClasses = {
  container: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4',
  card: 'group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-blue-400 hover:shadow-2xl hover:-translate-y-2 dark:border-gray-700 dark:bg-gray-800/80',
  gradientOverlay: 'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5',
  header: 'relative mb-4 flex items-center justify-between',
  iconWrapper: 'rounded-xl p-3 shadow-lg transition-transform group-hover:rotate-12',
  icon: 'h-6 w-6 text-white',
  trend: 'flex items-center gap-1 text-xs',
  trendIcon: 'h-3 w-3',
  trendUp: 'text-green-600 dark:text-green-400',
  trendDown: 'text-red-600 dark:text-red-400',
  content: 'relative',
  label: 'mb-1 text-sm font-medium text-gray-600 dark:text-gray-400',
  value: 'text-3xl font-bold text-gray-900 dark:text-white',
  progressBar: 'mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  progressFill: 'h-full transition-all duration-1000',
}

// Barra de progreso mejorada
export const progressClasses = {
  container: 'rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80',
  header: 'mb-4 flex items-center justify-between',
  leftSection: 'flex items-center gap-3',
  iconContainer: 'rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2',
  icon: 'h-5 w-5 text-white',
  titleSection: 'space-y-1',
  title: 'font-semibold text-gray-900 dark:text-white',
  subtitle: 'text-sm text-gray-600 dark:text-gray-400',
  rightSection: 'text-right',
  percentage: 'text-3xl font-bold text-blue-600 dark:text-blue-400',
  percentageLabel: 'text-sm text-gray-600 dark:text-gray-400',
  bar: 'relative h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  barFill: 'h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1500',
  shimmer: 'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent',
  milestones: 'mt-4 grid grid-cols-3 gap-4',
  milestone: 'text-center',
  milestoneValue: 'mb-1 text-2xl font-bold text-gray-900 dark:text-white',
  milestoneLabel: 'text-xs text-gray-600 dark:text-gray-400',
}

// Tabs mejorados
export const tabsClasses = {
  container: 'border-b border-gray-200 dark:border-gray-700',
  nav: 'flex gap-8',
  tab: 'relative pb-4 pt-2 text-sm font-medium transition-all',
  tabActive: 'text-blue-600 dark:text-blue-400',
  tabInactive: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
  tabContent: 'flex items-center gap-2',
  tabIcon: 'h-4 w-4',
  tabBadge: 'ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700',
  tabUnderline: 'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600',
}

// Info Cards
export const infoCardClasses = {
  card: 'group rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900',
  header: 'mb-4 flex items-center gap-3',
  iconContainer: 'rounded-lg bg-gradient-to-br p-2',
  icon: 'h-5 w-5 text-white',
  title: 'text-lg font-bold text-gray-900 dark:text-white',
  content: 'space-y-3 text-gray-700 dark:text-gray-300',
  row: 'flex items-center gap-2',
  rowIcon: 'h-4 w-4 text-gray-400',
  label: 'text-sm text-gray-600 dark:text-gray-400',
  value: 'font-semibold text-gray-900 dark:text-white',
}

// Gradientes por tipo de stat
export const gradients = {
  presupuesto: 'from-blue-500 to-indigo-600',
  manzanas: 'from-green-500 to-emerald-600',
  viviendas: 'from-purple-500 to-violet-600',
  fecha: 'from-orange-500 to-amber-600',
  descripcion: 'from-blue-500 to-indigo-600',
  contacto: 'from-purple-500 to-violet-600',
  progreso: 'from-blue-500 to-purple-600',
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
