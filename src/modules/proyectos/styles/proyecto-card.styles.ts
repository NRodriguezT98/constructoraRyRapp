/**
 * Estilos centralizados para ProyectoCard
 * Separación de presentación del componente
 */

export const proyectoCardStyles = {
  // Contenedores principales por vista
  container: {
    grid: 'group relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-2xl overflow-hidden',
    lista:
      'group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg overflow-hidden',
  },

  // Layout interno
  layout: {
    padding: 'p-6',
    flexRow: 'flex items-start justify-between gap-4',
    flexCol: 'flex-1 min-w-0',
    actions: 'flex items-center gap-2',
  },

  // Header del card
  header: {
    wrapper: 'flex items-center gap-3 mb-2',
    iconWrapper:
      'flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg',
    iconWrapperGrid:
      'flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl mb-4',
    icon: 'w-6 h-6 text-white',
    iconGrid: 'w-8 h-8 text-white',
    titleWrapper: 'flex-1 min-w-0',
  },

  // Textos
  text: {
    title: 'text-lg font-bold text-gray-900 dark:text-gray-100 truncate',
    titleGrid: 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-2',
    description: 'text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4',
    descriptionGrid:
      'text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4',
    ubicacion:
      'text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5',
    ubicacionIcon: 'w-3.5 h-3.5',
    ubicacionText: 'truncate',
  },

  // Estadísticas
  stats: {
    container: 'flex items-center gap-4 text-sm',
    containerGrid: 'grid grid-cols-2 gap-4 mb-4',
    item: 'flex items-center gap-1.5 text-gray-600 dark:text-gray-400',
    itemGrid:
      'flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg',
    icon: 'w-4 h-4',
    iconGrid: 'w-5 h-5 text-blue-500',
    label: 'font-medium',
    separator: 'w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600',
    value: 'font-semibold text-gray-900 dark:text-gray-100',
    valueLabel: 'text-sm text-gray-600 dark:text-gray-400',
  },

  // Badge de estado
  badge: {
    base: 'px-3 py-1 rounded-full text-xs font-medium',
    estados: {
      planificacion:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      en_construccion:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pausado:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      finalizado:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    },
  },

  // Barra de progreso
  progress: {
    container: 'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2',
    bar: 'h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500',
    label: 'text-xs text-gray-600 dark:text-gray-400 mb-1',
  },

  // Botones de acción
  button: {
    base: 'p-2 rounded-lg transition-colors',
    view: 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400',
    edit: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    delete:
      'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400',
    deleteConfirm:
      'hover:bg-red-600 dark:hover:bg-red-700 text-white bg-red-500',
    icon: 'w-4 h-4',
  },

  // Efectos y estados
  effects: {
    gradient:
      'absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
    border:
      'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300',
  },

  // Grid específico
  gridOnly: {
    container: 'space-y-4',
    footer: 'pt-4 border-t border-gray-200 dark:border-gray-700',
  },
}

// Labels de estado
export const estadoLabels = {
  planificacion: 'Planificación',
  en_construccion: 'En Construcción',
  pausado: 'Pausado',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
} as const
