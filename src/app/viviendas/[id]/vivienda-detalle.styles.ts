// Estilos centralizados para vivienda-detalle-client.tsx
// Siguiendo la arquitectura del proyecto

// ==============================================
// HEADER STYLES
// ==============================================
export const headerClasses = {
  container:
    'relative overflow-hidden rounded-xl p-8 text-white shadow-2xl backdrop-blur-sm',
  backgroundPattern: 'absolute inset-0 opacity-20',
  breadcrumb: 'relative z-10 flex items-center gap-2 text-sm text-white/80',
  breadcrumbIcon: 'h-4 w-4',
  breadcrumbCurrent: 'font-medium text-white',
  contentWrapper: 'relative z-10 mt-6 flex items-start justify-between',
  leftSection: 'flex items-start gap-4',
  iconContainer:
    'flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm',
  icon: 'h-8 w-8',
  titleSection: 'flex flex-col',
  title: 'text-3xl font-bold',
  location: 'mt-2 flex items-center gap-2 text-white/90',
  locationIcon: 'h-4 w-4',
  actionsContainer: 'flex gap-2',
  actionButton:
    'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30',
  deleteButton:
    'bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-sm border-red-400/30',
  statusBadge:
    'inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm',
  statusDot: 'h-2 w-2 rounded-full animate-pulse',
  statusText: 'text-white/95',
}

// ==============================================
// PROGRESS BAR STYLES
// ==============================================
export const progressClasses = {
  container:
    'rounded-xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-800/30 dark:bg-gray-800/50',
  header: 'mb-6 flex items-center justify-between',
  leftSection: 'flex items-center gap-4',
  iconContainer:
    'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg',
  icon: 'h-6 w-6',
  titleSection: 'flex flex-col',
  title: 'text-lg font-bold text-gray-900 dark:text-gray-100',
  subtitle: 'text-sm text-gray-600 dark:text-gray-400',
  rightSection: 'text-right',
  percentage: 'text-3xl font-bold text-emerald-600 dark:text-emerald-400',
  percentageLabel: 'text-xs text-gray-600 dark:text-gray-400',
  bar: 'relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  barFill:
    'absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 shadow-lg transition-all duration-1000',
  shimmer:
    'absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent',
  milestones: 'mt-6 flex justify-between gap-4',
  milestone: 'flex-1 rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-700/30',
  milestoneValue:
    'text-lg font-bold text-emerald-600 dark:text-emerald-400',
  milestoneLabel: 'text-xs text-gray-600 dark:text-gray-400',
}

// ==============================================
// TABS STYLES
// ==============================================
export const tabsClasses = {
  container:
    'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/50',
  nav: 'flex overflow-x-auto',
  tab: 'relative flex-1 cursor-pointer border-b-2 px-6 py-4 text-center transition-colors',
  tabActive: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
  tabInactive:
    'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
  tabContent: 'flex items-center justify-center gap-2 text-sm font-medium',
  tabIcon: 'h-4 w-4',
  tabBadge:
    'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  tabUnderline: 'absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500',
}

// ==============================================
// INFO CARDS STYLES
// ==============================================
export const infoCardClasses = {
  card: 'border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-800/50',
  header: 'flex items-center gap-3',
  iconContainer:
    'flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-md',
  icon: 'h-5 w-5',
  title: 'text-lg font-bold text-gray-900 dark:text-gray-100',
  content: 'space-y-4',
  label: 'text-xs font-semibold uppercase text-gray-500 dark:text-gray-400',
  value: 'text-base font-medium text-gray-900 dark:text-gray-100',
  row: 'flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400',
  rowIcon: 'h-4 w-4',
}

// ==============================================
// GRADIENTS
// ==============================================
export const gradients = {
  tecnica: 'from-blue-500 to-indigo-600',
  financiera: 'from-emerald-500 to-teal-600',
  cliente: 'from-purple-500 to-pink-600',
  fechas: 'from-orange-500 to-red-600',
}

// ==============================================
// ANIMATIONS
// ==============================================
export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  hoverScale: {
    whileHover: { scale: 1.05 },
    transition: { type: 'spring' as const, stiffness: 300 },
  },
}
