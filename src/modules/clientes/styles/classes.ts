/**
 * Clases de estilos centralizadas para el módulo de clientes
 * Siguiendo GUIA-ESTILOS.md
 */

export const clientesStyles = {
  // Contenedores principales
  pageContainer:
    'min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/30',
  contentContainer: 'container mx-auto px-4 py-4',

  // Headers
  headerWrapper: 'mb-6',
  headerTitle:
    'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-3xl font-bold text-transparent',
  headerSubtitle: 'mt-1 text-base text-gray-600 dark:text-gray-400',

  // Cards
  card: 'rounded-xl border border-purple-200 bg-white/80 p-4 shadow-lg backdrop-blur-sm dark:border-purple-800 dark:bg-gray-800/80 transition-all hover:shadow-xl',
  cardHeader: 'mb-3 flex items-center justify-between',
  cardTitle: 'text-lg font-semibold text-gray-900 dark:text-white',
  cardBody: 'space-y-3',

  // Badges de estado
  badge: 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
  badgeInteresado:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  badgeActivo:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  badgeInactivo:
    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',

  // Formularios
  formGroup: 'space-y-1.5',
  label: 'block text-xs font-medium text-gray-700 dark:text-gray-300',
  input:
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-purple-400',
  select:
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-purple-400',
  textarea:
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-purple-400 min-h-[80px]',

  // Botones
  button:
    'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  buttonPrimary:
    'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 focus:ring-purple-500',
  buttonSecondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700',
  buttonDanger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  buttonSuccess:
    'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',

  // Tablas
  table: 'w-full border-collapse',
  tableHeader:
    'border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50',
  tableHeaderCell:
    'px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300',
  tableRow:
    'border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50',
  tableCell: 'px-3 py-3 text-xs text-gray-900 dark:text-gray-100',

  // Estados vacíos
  emptyState: 'py-10 text-center',
  emptyIcon:
    'mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3',
  emptyTitle: 'text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1.5',
  emptyDescription: 'text-sm text-gray-500 dark:text-gray-400 mb-4',

  // Skeletons
  skeleton: 'animate-pulse',
  skeletonLine: 'h-3.5 bg-gray-200 dark:bg-gray-700 rounded',
  skeletonCircle: 'rounded-full bg-gray-200 dark:bg-gray-700',

  // Grid
  grid: 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
  gridFull: 'grid grid-cols-1 gap-4',

  // Stats
  statsGrid: 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6',
  statCard:
    'rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800',
  statLabel: 'text-xs font-medium text-gray-600 dark:text-gray-400',
  statValue:
    'mt-1.5 text-2xl font-bold text-gray-900 dark:text-white',
  statIcon: 'h-8 w-8 text-purple-600 dark:text-purple-400',

  // Filtros
  filtersContainer:
    'mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800',
  filtersGrid: 'grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4',
} as const
