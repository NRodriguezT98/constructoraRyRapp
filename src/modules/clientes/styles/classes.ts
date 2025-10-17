/**
 * Clases de estilos centralizadas para el módulo de clientes
 * Siguiendo GUIA-ESTILOS.md
 */

export const clientesStyles = {
  // Contenedores principales
  pageContainer:
    'min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/30',
  contentContainer: 'container mx-auto px-6 py-6',

  // Headers
  headerWrapper: 'mb-8',
  headerTitle:
    'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-4xl font-bold text-transparent',
  headerSubtitle: 'mt-2 text-lg text-gray-600 dark:text-gray-400',

  // Cards
  card: 'rounded-2xl border border-purple-200 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-purple-800 dark:bg-gray-800/80 transition-all hover:shadow-2xl',
  cardHeader: 'mb-4 flex items-center justify-between',
  cardTitle: 'text-xl font-semibold text-gray-900 dark:text-white',
  cardBody: 'space-y-4',

  // Badges de estado
  badge: 'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
  badgeInteresado:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  badgeActivo:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  badgeInactivo:
    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',

  // Formularios
  formGroup: 'space-y-2',
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
  input:
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-purple-400',
  select:
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-purple-400',
  textarea:
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-purple-400 min-h-[100px]',

  // Botones
  button:
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
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
    'px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300',
  tableRow:
    'border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50',
  tableCell: 'px-4 py-4 text-sm text-gray-900 dark:text-gray-100',

  // Estados vacíos
  emptyState: 'py-12 text-center',
  emptyIcon:
    'mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4',
  emptyTitle: 'text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2',
  emptyDescription: 'text-gray-500 dark:text-gray-400 mb-6',

  // Skeletons
  skeleton: 'animate-pulse',
  skeletonLine: 'h-4 bg-gray-200 dark:bg-gray-700 rounded',
  skeletonCircle: 'rounded-full bg-gray-200 dark:bg-gray-700',

  // Grid
  grid: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
  gridFull: 'grid grid-cols-1 gap-6',

  // Stats
  statsGrid: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8',
  statCard:
    'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
  statLabel: 'text-sm font-medium text-gray-600 dark:text-gray-400',
  statValue:
    'mt-2 text-3xl font-bold text-gray-900 dark:text-white',
  statIcon: 'h-10 w-10 text-purple-600 dark:text-purple-400',

  // Filtros
  filtersContainer:
    'mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800',
  filtersGrid: 'grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4',
} as const
