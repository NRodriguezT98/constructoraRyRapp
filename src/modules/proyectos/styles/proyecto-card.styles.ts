/**
 * Estilos centralizados para ProyectoCard
 * Separación de presentación del componente
 */

export const proyectoCardStyles = {
  // Contenedores principales por vista (compactos)
  container: {
    grid: 'group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl overflow-hidden',
    lista:
      'group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-md overflow-hidden',
  },

  // Layout interno compacto
  layout: {
    padding: 'p-4',
    flexRow: 'flex items-start justify-between gap-3',
    flexCol: 'flex-1 min-w-0',
    actions: 'flex items-center gap-1.5',
  },

  // Header del card compacto
  header: {
    wrapper: 'flex items-center gap-2.5 mb-1.5',
    iconWrapper:
      'flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md',
    iconWrapperGrid:
      'flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-3',
    icon: 'w-4 h-4 text-white',
    iconGrid: 'w-6 h-6 text-white',
    titleWrapper: 'flex-1 min-w-0',
  },

  // Textos compactos
  text: {
    title: 'text-base font-bold text-gray-900 dark:text-gray-100 truncate',
    titleGrid: 'text-lg font-bold text-gray-900 dark:text-gray-100 mb-1.5',
    description: 'text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3',
    descriptionGrid:
      'text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3',
    ubicacion:
      'text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1',
    ubicacionIcon: 'w-3 h-3',
    ubicacionText: 'truncate',
  },

  // Estadísticas compactas
  stats: {
    container: 'flex items-center gap-3 text-xs',
    containerGrid: 'grid grid-cols-2 gap-3 mb-3',
    item: 'flex items-center gap-1 text-gray-600 dark:text-gray-400',
    itemGrid:
      'flex items-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md',
    icon: 'w-3.5 h-3.5',
    iconGrid: 'w-4 h-4 text-blue-500',
    label: 'font-medium',
    separator: 'w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600',
    value: 'font-semibold text-gray-900 dark:text-gray-100',
    valueLabel: 'text-xs text-gray-600 dark:text-gray-400',
  },

  // Badge de estado compacto
  badge: {
    base: 'px-2 py-0.5 rounded-full text-[10px] font-medium',
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

  // Barra de progreso compacta
  progress: {
    container: 'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5',
    bar: 'h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500',
    label: 'text-[10px] text-gray-600 dark:text-gray-400 mb-1',
  },

  // Botones de acción compactos
  button: {
    base: 'p-1.5 rounded-md transition-colors',
    view: 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400',
    edit: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    delete:
      'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400',
    deleteConfirm:
      'hover:bg-red-600 dark:hover:bg-red-700 text-white bg-red-500',
    icon: 'w-3.5 h-3.5',
  },

  // Efectos y estados
  effects: {
    gradient:
      'absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
    border:
      'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300',
  },

  // Grid específico compacto
  gridOnly: {
    container: 'space-y-3',
    footer: 'pt-3 border-t border-gray-200 dark:border-gray-700',
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
