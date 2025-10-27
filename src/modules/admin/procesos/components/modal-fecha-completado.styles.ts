/**
 * 🎨 ESTILOS - MODAL FECHA COMPLETADO
 *
 * Estilos centralizados para el modal de selección de fecha.
 */

export const modalFechaStyles = {
  overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4',

  container: 'bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden',

  header: {
    container: 'bg-gradient-to-r from-green-600 to-emerald-600 p-6',
    topRow: 'flex items-center justify-between',
    left: 'flex items-center gap-3',

    iconCircle: 'p-2.5 rounded-xl bg-white/20 backdrop-blur-xl',
    icon: 'w-5 h-5 text-white',

    content: 'flex-1',
    title: 'text-lg font-bold text-white',
    subtitle: 'text-sm text-white/80 mt-0.5',

    closeButton: 'p-2 rounded-lg hover:bg-white/10 transition-colors',
    closeIcon: 'w-5 h-5 text-white'
  },

  body: {
    container: 'p-6 space-y-4',

    label: 'block text-sm font-semibold text-gray-700 mb-2',
    description: 'text-xs text-gray-500 mb-3',

    input: `w-full px-4 py-3 rounded-xl border-2 border-gray-200
            focus:border-green-500 focus:ring-4 focus:ring-green-500/10
            transition-all outline-none text-gray-900 font-medium`,

    info: {
      container: 'mt-3 space-y-2',
      item: 'text-xs text-gray-500'
    },

    error: 'mt-2 text-sm text-red-600 font-medium'
  },

  footer: {
    container: 'bg-gray-50 px-6 py-4 flex items-center justify-end gap-3',

    buttonCancel: `px-4 py-2.5 rounded-xl text-gray-700 font-medium
                   hover:bg-gray-200 transition-colors`,

    buttonConfirm: `px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600
                    text-white font-semibold shadow-lg hover:shadow-xl
                    hover:from-green-700 hover:to-emerald-700 transition-all`
  }
} as const
