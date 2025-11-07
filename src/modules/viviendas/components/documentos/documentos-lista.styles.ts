/**
 * 🎨 ESTILOS: documentos-lista-vivienda
 *
 * Sistema de diseño mejorado con agrupación inteligente
 */

export const documentosListaStyles = {
  // Contenedor principal - COMPACTO (space-y-6 → space-y-4)
  container: 'space-y-4',

  // Sección de importantes - COMPACTO
  importantes: {
    container: 'space-y-2',
    header: 'flex items-center justify-between mb-3',
    title: 'text-base font-bold text-gray-900 dark:text-white flex items-center gap-2',
    badge: 'text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium',
    empty: 'text-sm text-gray-500 dark:text-gray-400 italic'
  },

  // Sección de recientes - COMPACTO
  recientes: {
    container: 'space-y-1',
    header: 'flex items-center justify-between mb-2',
    title: 'text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2',
    subtitle: 'text-xs text-gray-400',
    item: 'flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group',
    info: 'flex-1 min-w-0',
    nombre: 'text-sm font-medium text-gray-900 dark:text-white truncate',
    meta: 'text-xs text-gray-500 dark:text-gray-400',
    actions: 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'
  },

  // Agrupación por categorías - COMPACTO
  categorias: {
    container: 'space-y-2',
    header: 'text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2'
  },

  // Accordion de categoría - COMPACTO (p-4 → p-3)
  accordion: {
    container: 'rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden transition-all',
    trigger: 'w-full flex items-center justify-between p-3 bg-gradient-to-r hover:opacity-90 transition-opacity cursor-pointer',
    triggerContent: 'flex items-center gap-2',
    icon: 'w-4 h-4',
    title: 'font-bold text-white text-sm',
    counter: 'text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 font-medium text-white',
    chevron: 'w-4 h-4 text-white transition-transform duration-200',
    content: 'bg-white dark:bg-gray-800 p-2 space-y-1'
  },

  // Card de documento compacto - OBSOLETO (usar DocumentoCardCompacto en su lugar)
  docCard: {
    container: 'group flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 transition-all',
    iconContainer: 'flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center',
    icon: 'w-5 h-5 text-orange-600 dark:text-orange-400',
    content: 'flex-1 min-w-0',
    title: 'font-semibold text-sm text-gray-900 dark:text-white truncate',
    meta: 'flex items-center gap-2 mt-1 flex-wrap',
    badge: 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
    actions: 'flex items-center gap-1 flex-shrink-0'
  },

  // Botones de acción compactos
  actionButton: {
    base: 'p-2 rounded-lg transition-colors',
    ver: 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50',
    descargar: 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50',
    nuevaVersion: 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50',
    historial: 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50',
    eliminar: 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50',
    menu: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
  },

  // Estadísticas - COMPACTO (gap-3, p-4 → gap-2.5, p-3)
  estadisticas: {
    container: 'grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700',
    item: 'text-center',
    value: 'text-xl font-bold text-gray-900 dark:text-white',
    label: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5'
  },

  // Banner de advertencia - COMPACTO (p-4 → p-3)
  warningBanner: {
    container: 'relative overflow-hidden rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 p-3 shadow-lg dark:border-yellow-700 dark:from-yellow-950/30 dark:to-amber-950/30',
    content: 'flex items-start gap-3',
    iconContainer: 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-500 text-white shadow-lg',
    icon: 'h-5 w-5',
    textContainer: 'flex-1',
    title: 'mb-1 font-bold text-sm text-yellow-900 dark:text-yellow-100',
    description: 'mb-2 text-xs text-yellow-800 dark:text-yellow-200',
    button: 'inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-yellow-700 shadow-lg'
  },

  // Filtros avanzados (Fase 2) - COMPACTO Y HORIZONTAL
  filtrosAvanzados: {
    container: 'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-orange-500/10',

    // Grid de 12 columnas horizontal (en vez de stack vertical)
    filaSuperior: 'grid grid-cols-12 gap-2 items-center',

    busqueda: {
      container: 'relative col-span-12 sm:col-span-5', // 5 columnas en desktop
      label: 'sr-only',
      icon: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
      input: 'w-full pl-10 pr-10 h-9 py-0 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm placeholder:text-gray-400',
      clearButton: 'absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
      clearIcon: 'w-3.5 h-3.5 text-gray-400'
    },

    categoria: {
      container: 'relative col-span-12 sm:col-span-3', // 3 columnas
      label: 'sr-only',
      select: 'w-full h-9 px-3 py-0 pr-8 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm appearance-none cursor-pointer',
      icon: 'absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none'
    },

    toggleImportantes: {
      container: 'col-span-12 sm:col-span-2', // 2 columnas
      button: 'w-full h-9 inline-flex items-center justify-center gap-1.5 px-3 py-0 rounded-lg border-2 transition-all text-sm font-medium whitespace-nowrap',
      buttonActive: 'bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-400',
      buttonInactive: 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-400',
      icon: 'w-3.5 h-3.5'
    },

    ordenamiento: {
      container: 'col-span-12 sm:col-span-2', // 2 columnas
      label: 'sr-only',
      select: 'w-full h-9 px-3 py-0 pr-8 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm appearance-none cursor-pointer'
    },

    filaInferior: 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700',

    chips: {
      container: 'flex items-center gap-1.5 flex-wrap',
      chip: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 text-xs font-medium transition-all hover:bg-orange-200 dark:hover:bg-orange-900/50 cursor-pointer',
      chipIcon: 'w-3 h-3',
      removeButton: 'ml-0.5 p-0.5 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors',
      removeIcon: 'w-2.5 h-2.5'
    },

    contador: 'text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap'
  }
}
