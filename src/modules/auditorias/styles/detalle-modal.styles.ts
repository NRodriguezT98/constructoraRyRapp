/**
 * Estilos centralizados para DetalleAuditoriaModal
 *
 * ✅ SOLO strings de Tailwind
 * ✅ Organizados por secciones
 */

export const detalleModalStyles = {
  // Overlay
  overlay: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',

  // Modal container
  modalContainer: 'fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none',

  modalContent: `
    w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl
    bg-white dark:bg-gray-800 shadow-2xl
    border border-gray-200 dark:border-gray-700
    pointer-events-auto
  `.trim(),

  // Header
  header: {
    container: `
      relative overflow-hidden
      bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
      dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800
      px-8 py-6
    `.trim(),

    pattern: `
      absolute inset-0
      bg-grid-white/10
      [mask-image:linear-gradient(0deg,transparent,black,transparent)]
    `.trim(),

    content: 'relative z-10 flex items-center justify-between',

    iconBox: `
      w-12 h-12 rounded-xl
      bg-white/20 backdrop-blur-sm
      flex items-center justify-center
      border border-white/30
    `.trim(),

    title: 'text-2xl font-bold text-white',
    subtitle: 'text-blue-100 text-sm mt-0.5 capitalize',

    closeButton: `
      w-10 h-10 rounded-xl
      bg-white/20 backdrop-blur-sm
      hover:bg-white/30 transition-colors
      flex items-center justify-center
      border border-white/30
    `.trim()
  },

  // Body
  body: 'overflow-y-auto max-h-[calc(90vh-180px)] p-4',

  // Sección de acción
  accion: {
    container: `
      flex items-center justify-between p-3 rounded-lg
      bg-gradient-to-br from-gray-50 to-gray-100
      dark:from-gray-900 dark:to-gray-800
      border border-gray-200 dark:border-gray-700
    `.trim(),

    usuario: {
      label: 'text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide',
      email: 'text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 truncate',
      rolBadge: `
        text-[10px] px-1.5 py-0.5 rounded-full
        bg-gray-200 dark:bg-gray-700
        text-gray-600 dark:text-gray-400
        font-medium capitalize flex-shrink-0
      `.trim()
    },

    fecha: {
      label: 'text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide',
      valor: 'text-xs text-gray-900 dark:text-white whitespace-nowrap'
    }
  },

  // Footer
  footer: `
    px-8 py-4
    border-t border-gray-200 dark:border-gray-700
    bg-gray-50 dark:bg-gray-900/50
    flex justify-end gap-3
  `.trim(),

  closeButtonFooter: `
    px-6 py-2.5 rounded-xl
    bg-gradient-to-r from-gray-200 to-gray-300
    hover:from-gray-300 hover:to-gray-400
    dark:from-gray-700 dark:to-gray-600
    dark:hover:from-gray-600 dark:hover:to-gray-500
    text-gray-900 dark:text-white
    font-bold transition-all
    shadow-lg hover:shadow-xl
  `.trim(),

  // Sección de detalles
  detalles: {
    container: 'space-y-2',
    titulo: `
      text-sm font-bold text-gray-900 dark:text-white
      flex items-center gap-2
      border-b border-gray-200 dark:border-gray-700 pb-2
    `.trim()
  },

  // Sección JSON colapsable
  json: {
    button: `
      w-full flex items-center justify-between
      px-4 py-3 rounded-xl
      bg-gray-100 hover:bg-gray-200
      dark:bg-gray-800 dark:hover:bg-gray-700
      transition-colors
      border border-gray-200 dark:border-gray-700
    `.trim(),

    label: 'text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2',

    content: 'space-y-3',

    codeBlock: `
      bg-gray-50 dark:bg-gray-900/50
      rounded-xl p-4 overflow-auto max-h-64
      border border-gray-200 dark:border-gray-700
    `.trim(),

    pre: 'text-xs text-gray-900 dark:text-gray-100 font-mono'
  }
}
