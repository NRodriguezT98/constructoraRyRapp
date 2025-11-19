/**
 * Estilos centralizados para DocumentoReemplazarArchivoModal
 * Cumple con regla de separaciÃ³n de responsabilidades
 */

export const reemplazarArchivoModalStyles = {
  // Contenedor principal
  backdrop: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  backdropOverlay: 'absolute inset-0 bg-black/60 backdrop-blur-sm',
  modal: 'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 shadow-2xl',

  // Header
  header: {
    container: 'sticky top-0 z-10 bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3',
    content: 'flex items-center justify-between',
    leftSection: 'flex items-center gap-2.5',
    icon: 'rounded-lg bg-white/20 p-1.5',
    title: 'text-base font-bold text-white flex items-center gap-2',
    badge: 'text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/20',
    subtitle: 'text-xs text-orange-100',
    closeButton: 'rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50'
  },

  // Advertencia
  warning: {
    container: 'mx-4 mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/50 dark:bg-orange-900/20',
    content: 'flex gap-2',
    icon: 'flex-shrink-0 text-orange-600 dark:text-orange-400 mt-0.5',
    title: 'text-sm font-semibold text-orange-900 dark:text-orange-300',
    list: 'mt-1.5 space-y-0.5 text-xs text-orange-800 dark:text-orange-400'
  },

  // Formulario
  form: {
    container: 'p-4 space-y-3',
    label: 'flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5',
    input: 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900',
    textarea: 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 resize-none',
    helperText: 'mt-1 text-[10px] text-gray-500'
  },

  // Archivo actual
  currentFile: {
    container: 'rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50',
    label: 'flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5',
    filename: 'text-sm font-semibold text-gray-900 dark:text-white',
    size: 'text-xs text-gray-500 dark:text-gray-500 mt-1'
  },

  // Drag & Drop
  dragDrop: {
    containerBase: 'relative rounded-lg border-2 border-dashed p-4 text-center transition-all',
    containerActive: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    containerInactive: 'border-gray-300 hover:border-gray-400 dark:border-gray-700',
    containerDisabled: 'opacity-50 pointer-events-none',
    input: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed',
    content: 'flex flex-col items-center gap-1.5',
    iconWrapper: 'rounded-full bg-orange-100 p-2 dark:bg-orange-900/30',
    icon: 'text-orange-600 dark:text-orange-400',
    filename: 'text-xs font-medium text-gray-900 dark:text-white',
    fileSize: 'text-[10px] text-gray-500',
    changeButton: 'text-[10px] text-orange-600 hover:text-orange-700 dark:text-orange-400 mt-0.5',
    emptyTitle: 'text-xs font-medium text-gray-900 dark:text-white',
    emptySubtitle: 'text-[10px] text-gray-500'
  },

  // Barra de progreso
  progress: {
    container: 'space-y-1.5',
    header: 'flex items-center justify-between text-xs',
    label: 'text-gray-600 dark:text-gray-400',
    percentage: 'font-medium text-orange-600 dark:text-orange-400',
    bar: 'h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
    fill: 'h-full bg-gradient-to-r from-orange-500 to-red-500'
  },

  // Botones
  buttons: {
    container: 'flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200 dark:border-gray-700',
    cancel: 'flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700',
    submit: 'w-full rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5',
    tooltipWrapper: 'flex-1 relative group'
  },

  // Tooltip
  tooltip: {
    container: 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-10',
    arrow: 'absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700'
  }
} as const

