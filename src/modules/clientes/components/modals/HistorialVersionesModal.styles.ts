/**
 * ============================================
 * ESTILOS: Historial de Versiones Modal
 * ============================================
 * Tema: Clientes (Cyan/Azul/Índigo)
 * Centralización de todas las clases de Tailwind
 */

export const historialVersionesModalStyles = {
  // Overlay
  overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50',

  // Container Modal
  modalContainer: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  modal:
    'w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col',

  // Header (Tema Clientes: Cyan → Azul → Índigo)
  header: {
    container:
      'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 px-6 py-4',
    content: 'flex items-center justify-between',
    iconContainer:
      'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    icon: 'w-6 h-6 text-white',
    titleGroup: 'flex items-center gap-3',
    title: 'text-xl font-bold text-white',
    subtitle: 'text-cyan-100 dark:text-cyan-200 text-sm',
    closeButton: 'p-2 hover:bg-white/20 rounded-lg transition-colors',
  },

  // Content
  content: {
    container: 'flex-1 overflow-y-auto p-6',
    emptyState: 'text-center py-12',
    emptyIcon: 'w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4',
    emptyTitle: 'text-lg font-semibold text-gray-600 dark:text-gray-400',
    emptySubtitle: 'text-sm text-gray-500 dark:text-gray-500',
  },

  // Timeline
  timeline: {
    container: 'space-y-4',
  },

  // Version Card
  versionCard: {
    container:
      'group relative rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg',

    // Header
    header: {
      container: 'px-4 py-3 cursor-pointer',
      content: 'flex items-start justify-between',
      leftSection: 'flex-1',
      versionBadge:
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold',
      typeLabel: 'text-sm font-semibold text-gray-900 dark:text-white mt-1',
      reasonText:
        'text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2',
      dateText: 'text-xs text-gray-500 dark:text-gray-500 mt-1',
      expandButton:
        'p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors',
      expandIcon: 'w-5 h-5 text-gray-400 transition-transform',
      expandIconRotated:
        'w-5 h-5 text-gray-400 transition-transform rotate-180',
    },

    // Expanded Content
    expanded: {
      container: 'p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50',
      badgeContainer: 'flex flex-wrap gap-2',
      badge:
        'px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-xs font-medium text-blue-700 dark:text-blue-300',
    },
  },

  // Fuentes de Pago
  fuentesPago: {
    title:
      'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2',
    titleIcon: 'w-4 h-4',
    container: 'space-y-2',
    card: 'p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    cardHeader: 'flex items-center justify-between mb-2',
    cardType: 'text-sm font-semibold text-gray-900 dark:text-white',
    cardEntidad: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5',
    cardMonto: 'text-sm font-bold text-gray-900 dark:text-white',
    cardRecibido:
      'text-xs text-green-600 dark:text-green-400 flex items-center gap-1',
    cardRecibidoIcon: 'w-3 h-3',
  },

  // Resumen de Cambios
  resumen: {
    container: 'space-y-3',
    motivoBox:
      'p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800',
    motivoLabel:
      'text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-1.5',
    motivoIcon: 'w-3.5 h-3.5',
    motivoText: 'text-sm text-blue-900 dark:text-blue-100',
    statsGrid: 'grid grid-cols-3 gap-2',
    statCard: {
      agregada:
        'p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-center',
      eliminada:
        'p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-center',
      modificada:
        'p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 text-center',
    },
    statValue: {
      agregada: 'text-lg font-bold text-green-700 dark:text-green-300',
      eliminada: 'text-lg font-bold text-red-700 dark:text-red-300',
      modificada: 'text-lg font-bold text-yellow-700 dark:text-yellow-300',
    },
    statLabel: {
      agregada: 'text-xs text-green-600 dark:text-green-400',
      eliminada: 'text-xs text-red-600 dark:text-red-400',
      modificada: 'text-xs text-yellow-600 dark:text-yellow-400',
    },
  },

  // Cambio Visual
  cambio: {
    container: 'space-y-2',
    title: 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2',
    cambioCard:
      'p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800',
    cambioLabel: 'text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2',
    cambioContent: 'flex items-center gap-3',
    valorAnterior: {
      container:
        'flex-1 p-2 rounded bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800',
      label: 'text-xs text-red-600 dark:text-red-400 font-medium mb-1',
      value: 'text-sm text-red-900 dark:text-red-100 font-semibold',
    },
    arrow: 'flex-shrink-0',
    arrowIcon: 'w-5 h-5 text-gray-400 transform rotate-[-90deg]',
    valorNuevo: {
      container:
        'flex-1 p-2 rounded bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800',
      label: 'text-xs text-green-600 dark:text-green-400 font-medium mb-1',
      value: 'text-sm text-green-900 dark:text-green-100 font-semibold',
    },
  },

  // Footer
  footer: {
    container:
      'px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end',
    button:
      'px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium',
  },
}
