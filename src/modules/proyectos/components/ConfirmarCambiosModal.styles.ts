/**
 * Estilos centralizados para ConfirmarCambiosModal
 * ✅ Separación de responsabilidades
 * ✅ Modo oscuro completo
 * ✅ Diseño premium con gradientes naranja/ámbar
 */

export const confirmarCambiosStyles = {
  // Overlay
  overlay: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  overlayBg: 'absolute inset-0 bg-black/50 backdrop-blur-sm',

  // Modal Container
  modal: 'relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl',

  // Header
  header: {
    container: 'relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-yellow-800 p-6',
    pattern: "absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]",
    content: 'relative z-10 flex items-center justify-between',
    left: 'flex items-center gap-4',
    icon: 'w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    iconSvg: 'w-6 h-6 text-white',
    textContainer: '',
    title: 'text-2xl font-bold text-white',
    subtitle: 'text-orange-100 dark:text-orange-200 text-sm mt-1',
    closeButton: 'w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all flex items-center justify-center',
    closeIcon: 'w-5 h-5',
  },

  // Body
  body: {
    container: 'p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto',

    // Resumen Badge
    resumen: {
      container: 'flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800',
      icon: 'w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0',
      text: 'text-sm text-blue-900 dark:text-blue-100 font-medium',
      strong: 'font-bold',
    },

    // Secciones
    section: {
      container: 'space-y-2',
      header: 'flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white',
      headerIcon: 'w-4 h-4 text-orange-600 dark:text-orange-400',
      list: 'space-y-2',
    },
  },

  // Cards de Cambios
  cards: {
    // Card de cambio de proyecto
    proyecto: {
      container: 'p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700',
      header: 'flex items-center gap-2 mb-2',
      headerIcon: 'w-3.5 h-3.5 text-blue-600 dark:text-blue-400',
      label: 'text-xs font-bold text-gray-900 dark:text-white',
      grid: 'grid grid-cols-2 gap-3',

      // Columna anterior
      anterior: {
        container: 'space-y-1',
        label: 'text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold',
        value: 'text-xs text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200 dark:border-red-800 line-clamp-2',
      },

      // Columna nuevo
      nuevo: {
        container: 'space-y-1',
        label: 'text-[10px] text-green-600 dark:text-green-400 uppercase font-semibold',
        value: 'text-xs text-gray-900 dark:text-white bg-green-50 dark:bg-green-950/30 p-2 rounded border border-green-200 dark:border-green-800 font-medium line-clamp-2',
      },
    },

    // Card de cambio de manzana
    manzana: {
      // Contenedores por tipo
      agregada: 'p-3 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
      eliminada: 'p-3 rounded-lg border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      modificada: 'p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',

      header: 'flex items-center gap-2',

      // Íconos por tipo
      iconAgregada: 'w-4 h-4 text-green-600 dark:text-green-400',
      iconEliminada: 'w-4 h-4 text-red-600 dark:text-red-400',
      iconModificada: 'w-4 h-4 text-blue-600 dark:text-blue-400',

      nombre: 'text-xs font-bold',

      // Badges por tipo
      badgeAgregada: 'ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200',
      badgeEliminada: 'ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200',
      badgeModificada: 'ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200',

      // Detalles de cambios
      detalles: {
        container: 'mt-2 pt-2 border-t border-current/20 space-y-1',
        text: 'text-xs',
        label: 'text-gray-600 dark:text-gray-400',
        valorAnterior: 'line-through text-red-600 dark:text-red-400',
        valorNuevo: 'font-bold text-green-600 dark:text-green-400',
        separador: ' → ',
      },
    },
  },

  // Footer
  footer: {
    container: 'border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50',
    buttonsContainer: 'flex justify-end gap-3',

    cancelButton: 'px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed',

    confirmButton: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 transition-all text-sm font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
  },

  // Animaciones Framer Motion
  animations: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    modal: {
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 20 },
    },
  },
}
