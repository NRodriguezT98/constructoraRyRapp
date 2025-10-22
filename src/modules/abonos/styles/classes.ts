/**
 * Estilos centralizados para el módulo de Abonos
 * Siguiendo arquitectura limpia: separación completa de estilos
 * Soporte completo para dark mode
 */

// Estilos para cards
export const cardStyles = {
  base: 'group hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-200 dark:hover:border-orange-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden',
  header: 'pb-3',
  content: 'space-y-4',
  footer: 'flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700',
}

// Estilos para botones
export const buttonStyles = {
  primary:
    'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300',
  secondary:
    'border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-400 transition-colors',
  danger:
    'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20',
}

// Estilos para inputs
export const inputStyles = {
  base: 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400',
  search:
    'pl-10 bg-gray-50/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400',
  large:
    'pl-12 h-12 text-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400 transition-colors',
}

// Estilos para badges
export const badgeStyles = {
  base: 'px-2 py-1 rounded-full text-xs font-medium',
  success:
    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  warning:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
}

// Estilos para contenedores
export const containerStyles = {
  page: 'space-y-4',
  section: 'container mx-auto px-4 py-4 sm:px-4 lg:px-6',
  card: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl',
}

// Estilos para texto
export const textStyles = {
  title:
    'text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
  subtitle: 'text-sm text-gray-600 dark:text-gray-400 mt-1',
  heading: 'text-lg font-bold text-gray-900 dark:text-white',
  subheading: 'text-base font-semibold text-gray-800 dark:text-gray-200',
  muted: 'text-sm text-gray-500 dark:text-gray-400',
  small: 'text-xs text-gray-600 dark:text-gray-400',
}

// Estilos para estadísticas
export const statsStyles = {
  container:
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4',
  card: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-lg transition-all',
  value:
    'text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent',
  label: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5',
  icon: 'w-5 h-5 text-orange-500 dark:text-orange-400',
}

// Estilos para filtros
export const filterStyles = {
  container:
    'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6',
  grid: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  label: 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
}

// Estilos para progreso
export const progressStyles = {
  container: 'w-full',
  bar: 'h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden',
  fill: 'h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500',
  label: 'flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1',
}

// Estilos para tablas
export const tableStyles = {
  container: 'overflow-x-auto',
  wrapper:
    'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl',
  header:
    'bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700',
  headerCell:
    'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
  row: 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
  cell: 'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
}
