// Estilos centralizados para cliente-detalle-client.tsx
// Siguiendo la arquitectura del proyecto
// Color principal: purple (consistente con módulo clientes)

// ==============================================
// HEADER STYLES
// ==============================================
export const headerClasses = {
  container:
    'relative overflow-hidden rounded-xl p-5 text-white shadow-xl backdrop-blur-sm',
  backgroundPattern: 'absolute inset-0 opacity-20',
  breadcrumb: 'relative z-10 flex items-center gap-1.5 text-xs text-white/80',
  breadcrumbIcon: 'h-3 w-3',
  breadcrumbCurrent: 'font-medium text-white',
  contentWrapper: 'relative z-10 mt-4 flex items-start justify-between',
  leftSection: 'flex items-start gap-3',
  iconContainer:
    'flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm',
  icon: 'h-6 w-6',
  titleSection: 'flex flex-col',
  title: 'text-2xl font-bold',
  subtitle: 'mt-1 flex items-center gap-1.5 text-sm text-white/90',
  subtitleIcon: 'h-3.5 w-3.5',
  actionsContainer: 'flex gap-1.5',
  actionButton:
    'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30',
  deleteButton:
    'bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-sm border-red-400/30',
  statusBadge:
    'inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-sm',
  statusDot: 'h-1.5 w-1.5 rounded-full animate-pulse',
  statusText: 'text-white/95',
}

// ==============================================
// TABS STYLES
// ==============================================
export const tabsClasses = {
  container:
    'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/50',
  nav: 'flex overflow-x-auto',
  tab: 'relative flex-1 min-w-max cursor-pointer border-b-2 px-4 py-3 text-center transition-colors',
  tabActive: 'border-purple-500 text-purple-600 dark:text-purple-400',
  tabInactive:
    'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
  tabContent: 'flex items-center justify-center gap-1.5 text-xs font-medium',
  tabIcon: 'h-3.5 w-3.5',
  tabBadge:
    'rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  tabUnderline: 'absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500',
}

// ==============================================
// INFO CARDS STYLES
// ==============================================
export const infoCardClasses = {
  card: 'rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-800/50',
  header: 'mb-4 flex items-center gap-2.5',
  iconContainer:
    'flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-md',
  icon: 'h-4 w-4',
  title: 'text-base font-bold text-gray-900 dark:text-gray-100',
  content: 'space-y-3',
  grid: 'grid grid-cols-1 gap-3 md:grid-cols-2',
  fieldContainer: 'flex items-start gap-2.5',
  fieldIconContainer:
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30',
  fieldIcon: 'h-4 w-4 text-purple-600 dark:text-purple-400',
  fieldContent: 'flex-1',
  fieldLabel: 'text-xs font-medium text-gray-500 dark:text-gray-400',
  fieldValue: 'mt-0.5 text-sm font-semibold text-gray-900 dark:text-white',
  fieldValueEmpty: 'mt-0.5 text-sm font-semibold text-gray-400 dark:text-gray-600 italic',
}

// ==============================================
// EMPTY STATE STYLES
// ==============================================
export const emptyStateClasses = {
  container: 'flex flex-col items-center justify-center py-10 text-center',
  icon: 'mb-3 h-12 w-12 text-gray-400 dark:text-gray-600',
  title: 'mb-1.5 text-base font-semibold text-gray-900 dark:text-gray-100',
  description: 'mb-4 text-xs text-gray-600 dark:text-gray-400',
  button:
    'inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700',
}

// ==============================================
// WARNING STATE STYLES
// ==============================================
export const warningStateClasses = {
  container:
    'rounded-xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800/30 dark:bg-amber-900/10',
  header: 'mb-3 flex items-center gap-2.5',
  icon: 'h-5 w-5 text-amber-600 dark:text-amber-400',
  title: 'text-base font-bold text-amber-900 dark:text-amber-100',
  description: 'mb-3 text-xs text-amber-800 dark:text-amber-200',
  list: 'mb-3 space-y-1.5',
  listItem: 'flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-200',
  listIcon: 'mt-0.5 text-amber-600 dark:text-amber-400',
  button:
    'inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700',
}

// ==============================================
// GRADIENTS
// ==============================================
export const gradients = {
  personal: 'from-purple-500 to-pink-600',
  contacto: 'from-blue-500 to-indigo-600',
  intereses: 'from-rose-500 to-red-600',
  documentos: 'from-emerald-500 to-teal-600',
  negociaciones: 'from-amber-500 to-orange-600',
  actividad: 'from-cyan-500 to-blue-600',
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
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideIn: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 },
  },
  hoverScale: {
    whileHover: { scale: 1.02 },
    transition: { type: 'spring' as const, stiffness: 300 },
  },
}
