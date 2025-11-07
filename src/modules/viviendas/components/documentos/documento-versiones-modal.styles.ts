/**
 * 🎨 ESTILOS: documento-versiones-modal
 *
 * Clases de Tailwind centralizadas para el modal de versiones
 */

export const documentoVersionesModalStyles = {
  // Overlay - ✅ CORREGIDO: z-index aumentado para estar sobre todo
  overlay: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4',

  // Contenedor principal
  container: 'relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col',

  // Header
  header: {
    container: 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 px-6 py-4',
    content: 'flex items-center justify-between',
    title: 'text-2xl font-bold text-white flex items-center gap-2',
    subtitle: 'text-sm text-white/90 mt-1',
    closeButton: 'p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors'
  },

  // Content
  content: {
    container: 'flex-1 overflow-y-auto p-6',
    loading: 'flex items-center justify-center py-12',
    loadingIcon: 'w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin',
    empty: 'py-12 text-center',
    emptyIcon: 'mx-auto mb-4 h-16 w-16 text-gray-400',
    emptyText: 'text-gray-600 dark:text-gray-400'
  },

  // Version card
  versionCard: {
    container: 'rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 dark:border-orange-800 dark:from-orange-950/30 dark:to-amber-950/30',
    header: 'flex items-start justify-between mb-3',
    badges: 'flex items-center gap-2 flex-wrap',
    versionBadge: 'inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    actualBadge: 'inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400',
    originalBadge: 'inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',

    metadata: 'space-y-2',
    metadataRow: 'flex items-center gap-2 text-sm',
    metadataIcon: 'w-4 h-4 text-gray-400',
    metadataText: 'text-gray-600 dark:text-gray-400',

    description: 'mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50',
    descriptionText: 'text-sm text-gray-700 dark:text-gray-300',

    actions: 'flex items-center gap-2 flex-wrap'
  },

  // Botones de acción
  buttons: {
    ver: 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors',
    descargar: 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors',
    restaurar: 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    eliminar: 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    spinner: 'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'
  },

  // Modal de confirmación - ✅ CORREGIDO: z-index mayor que overlay principal
  modalMotivo: {
    overlay: 'fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4',
    container: 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6',
    title: 'text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2',
    description: 'text-sm text-gray-600 dark:text-gray-400 mb-4',
    label: 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2',
    textarea: 'w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm',
    hint: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
    buttonsContainer: 'flex gap-3',
    cancelButton: 'flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    confirmButton: 'flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white font-medium hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
    confirmButtonContent: 'flex items-center justify-center gap-2'
  }
}
