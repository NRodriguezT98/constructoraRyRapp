/**
 * 🎨 ESTILOS - TIMELINE DE PROCESO
 *
 * Estilos centralizados para el componente TimelineProceso.
 * Diseño moderno con soporte completo para modo claro y oscuro.
 * Glassmorphism, gradientes y animaciones suaves.
 */

export const timelineProcesoStyles = {
  // Container principal
  container: 'space-y-6',

  // Header con progreso
  header: {
    container: `rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600
                dark:from-purple-700 dark:via-violet-700 dark:to-indigo-700
                p-6 shadow-xl dark:shadow-2xl`,
    topRow: 'mb-4 flex items-center justify-between',
    title: 'text-2xl font-bold text-white',

    actions: 'flex items-center gap-3',
    badge: `rounded-full bg-white/20 dark:bg-white/30 backdrop-blur-xl px-4 py-2
            text-sm font-semibold text-white shadow-lg`,

    devButton: `flex items-center gap-2 px-4 py-2 rounded-lg
                bg-amber-500/20 hover:bg-amber-500/30
                dark:bg-amber-600/30 dark:hover:bg-amber-600/40
                text-white border border-amber-400/50 dark:border-amber-500/60
                backdrop-blur-xl transition-all
                disabled:opacity-50 disabled:cursor-not-allowed`,
    devButtonText: 'text-xs font-medium',

    progressBar: {
      container: `mb-4 h-3 overflow-hidden rounded-full
                  bg-white/20 dark:bg-white/10 backdrop-blur-xl`,
      fill: `h-full bg-gradient-to-r from-green-400 to-emerald-500
             dark:from-green-500 dark:to-emerald-600 shadow-lg
             transition-all duration-500 ease-out`
    },

    stats: {
      grid: 'grid grid-cols-5 gap-4 text-white',
      item: 'text-center',
      value: 'text-2xl font-bold drop-shadow-sm',
      label: 'text-xs text-white/80 dark:text-white/90'
    }
  },

  // Error alert
  error: {
    container: `rounded-xl bg-red-50 dark:bg-red-900/20
                border border-red-200 dark:border-red-800/50
                p-4 flex items-start gap-3
                backdrop-blur-sm`,
    icon: 'w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5',
    content: 'flex-1',
    title: 'text-sm font-semibold text-red-900 dark:text-red-200 mb-1',
    message: 'text-sm text-red-700 dark:text-red-300',
    close: `p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/50
            transition-colors`,
    closeIcon: 'w-4 h-4 text-red-600 dark:text-red-400'
  },

  // Loading
  loading: {
    container: 'flex items-center justify-center min-h-[400px]',
    spinner: 'w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin'
  },

  // Empty state
  empty: {
    container: `rounded-2xl bg-white/60 dark:bg-gray-800/60
                backdrop-blur-xl border-2 border-dashed
                border-gray-300 dark:border-gray-600
                p-12 text-center`,
    icon: 'w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4',
    title: 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-2',
    description: 'text-gray-600 dark:text-gray-400'
  },

  // Timeline
  timeline: {
    container: 'relative',
    list: 'relative space-y-6',
    line: `absolute left-4 top-0 bottom-0 w-0.5
           bg-gradient-to-b from-purple-400 via-violet-400 to-indigo-400
           dark:from-purple-500 dark:via-violet-500 dark:to-indigo-500
           opacity-50 dark:opacity-40`
  },

  // Paso Item
  paso: {
    container: 'relative flex gap-4',

    dot: {
      base: `relative z-10 flex-shrink-0 w-8 h-8 rounded-full
             flex items-center justify-center text-white text-sm font-bold
             shadow-lg ring-4 ring-white dark:ring-gray-900
             transition-all duration-300`,

      completado: `bg-gradient-to-br from-green-500 to-emerald-600
                   dark:from-green-500 dark:to-emerald-600
                   shadow-lg shadow-green-500/60`,

      enProceso: `bg-gradient-to-br from-blue-500 to-cyan-500
                  dark:from-blue-500 dark:to-cyan-500
                  shadow-2xl shadow-blue-500/80
                  ring-2 ring-white dark:ring-blue-300`,

      omitido: 'bg-gray-400 dark:bg-gray-500 shadow-md shadow-gray-500/50',
      bloqueado: 'bg-gray-400 dark:bg-gray-600 opacity-40',
      pendiente: `bg-gradient-to-br from-amber-400 to-orange-400
                  dark:from-amber-500 dark:to-orange-500
                  shadow-lg shadow-amber-500/60`
    },

    content: 'flex-1 pb-2',

    card: {
      base: `rounded-xl backdrop-blur-xl border-2
             p-4 transition-all duration-300`,

      // Estados específicos con colores muy distintivos
      completado: `bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100
                   dark:from-green-950/50 dark:via-emerald-950/50 dark:to-teal-950/50
                   border-green-400 dark:border-green-600
                   shadow-lg shadow-green-500/30 dark:shadow-green-500/20
                   hover:shadow-xl hover:shadow-green-500/40 dark:hover:shadow-green-500/30
                   hover:border-green-500 dark:hover:border-green-500
                   cursor-pointer
                   ring-2 ring-green-200 dark:ring-green-900/50`,

      enProceso: `bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100
                  dark:from-blue-950/60 dark:via-sky-950/60 dark:to-cyan-950/60
                  border-blue-500 dark:border-blue-400
                  shadow-2xl shadow-blue-500/40 dark:shadow-blue-500/30
                  ring-4 ring-blue-300/60 dark:ring-blue-800/60
                  hover:shadow-3xl hover:shadow-blue-500/50 dark:hover:shadow-blue-500/40
                  hover:border-blue-600 dark:hover:border-blue-300
                  cursor-pointer
                  animate-pulse-subtle`,

      pendiente: `bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50
                  dark:from-amber-950/40 dark:via-yellow-950/40 dark:to-orange-950/40
                  border-amber-300 dark:border-amber-700
                  shadow-md shadow-amber-500/20 dark:shadow-amber-500/10
                  hover:shadow-lg hover:shadow-amber-500/30 dark:hover:shadow-amber-500/20
                  hover:border-amber-400 dark:hover:border-amber-600
                  cursor-pointer
                  ring-1 ring-amber-200 dark:ring-amber-900/50`,

      bloqueado: `bg-gradient-to-br from-gray-200 via-slate-200 to-gray-300
                  dark:from-gray-900/70 dark:via-slate-900/70 dark:to-gray-900/70
                  border-gray-400 dark:border-gray-700
                  opacity-50 cursor-not-allowed
                  shadow-sm shadow-gray-500/10`,

      clickable: 'cursor-pointer'
    },

    header: {
      container: 'flex items-start justify-between mb-2',
      left: 'flex-1',
      iconRow: 'flex items-center gap-3 mb-2',
      title: 'font-semibold text-gray-900 dark:text-gray-100',
      titleBloqueado: 'font-semibold text-gray-500 dark:text-gray-500',
      description: 'text-sm text-gray-600 dark:text-gray-400 mt-1',
      descriptionBloqueado: 'text-sm text-gray-400 dark:text-gray-600 mt-1',
      toggleButton: `p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                     transition-colors`
    },

    badges: {
      container: 'flex flex-wrap items-center gap-2 mb-3',

      completado: `px-3 py-1.5 rounded-full bg-gradient-to-r from-green-200 to-emerald-200
                   dark:from-green-800 dark:to-emerald-800
                   text-green-800 dark:text-green-100 text-xs font-bold
                   border-2 border-green-400 dark:border-green-600
                   shadow-md shadow-green-500/30`,

      enProceso: `px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-200 to-cyan-200
                  dark:from-blue-800 dark:to-cyan-800
                  text-blue-800 dark:text-blue-100 text-xs font-extrabold
                  flex items-center gap-1.5
                  border-2 border-blue-500 dark:border-blue-400
                  shadow-lg shadow-blue-500/40`,

      pulseDot: `w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-300
                 shadow-xl shadow-blue-500/70 animate-pulse`,

      omitido: `px-3 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700
                text-gray-700 dark:text-gray-300 text-xs font-medium
                border border-gray-400 dark:border-gray-600`,

      bloqueado: `px-3 py-1.5 rounded-full bg-gray-300 dark:bg-gray-800
                  text-gray-600 dark:text-gray-400 text-xs font-medium
                  flex items-center gap-1
                  border border-gray-400 dark:border-gray-700`,

      pendiente: `px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-200 to-orange-200
                  dark:from-amber-800 dark:to-orange-800
                  text-amber-900 dark:text-amber-100 text-xs font-bold
                  border-2 border-amber-400 dark:border-amber-600
                  shadow-md shadow-amber-500/30`,

      obligatorio: `px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30
                    text-red-700 dark:text-red-300 text-xs font-medium
                    border border-red-200 dark:border-red-800/50`
    },

    bloqueoAlert: {
      container: `mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20
                  border border-amber-200 dark:border-amber-800/50`,
      content: 'flex items-start gap-2',
      icon: 'w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0',
      text: 'text-sm text-amber-800 dark:text-amber-200',
      title: 'font-medium mb-1',
      subtitle: 'text-xs',
      list: 'mt-1 space-y-0.5',
      listItem: 'text-xs'
    },

    fechas: {
      container: `flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400
                  pt-3 border-t border-gray-200 dark:border-gray-700`
    }
  },

  // Expanded content
  expanded: {
    container: 'overflow-hidden',
    content: `mt-3 rounded-xl bg-gray-50 dark:bg-gray-900/50
              p-4 space-y-4 border border-gray-100 dark:border-gray-800`,

    alertPendiente: {
      container: `p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20
                  border border-blue-200 dark:border-blue-800/50`,
      content: 'flex items-start gap-2',
      icon: 'w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0',
      text: 'text-sm text-blue-800 dark:text-blue-200',
      title: 'font-semibold mb-1',
      subtitle: 'text-xs'
    },

    section: {
      title: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2',
      list: 'space-y-2'
    },

    documento: {
      container: `flex items-center justify-between p-3 rounded-lg
                  bg-white dark:bg-gray-800/50
                  border border-gray-200 dark:border-gray-700
                  hover:border-gray-300 dark:hover:border-gray-600
                  transition-colors`,
      left: 'flex items-center gap-2',
      icon: 'w-4 h-4 text-gray-400 dark:text-gray-500',
      content: 'flex-1',
      nombre: 'text-sm font-medium text-gray-900 dark:text-gray-100',
      obligatorioMark: 'ml-2 text-xs text-red-600 dark:text-red-400',
      descripcion: 'text-xs text-gray-500 dark:text-gray-400',

      actions: 'flex items-center gap-2',
      downloadButton: `p-2 rounded-lg bg-green-100 dark:bg-green-900/30
                       text-green-600 dark:text-green-400
                       hover:bg-green-200 dark:hover:bg-green-900/50
                       transition-colors`,
      deleteButton: `p-2 rounded-lg bg-red-100 dark:bg-red-900/30
                     text-red-600 dark:text-red-400
                     hover:bg-red-200 dark:hover:bg-red-900/50
                     transition-colors disabled:opacity-50`,

      uploadInput: 'hidden',
      uploadLabel: {
        base: 'p-2 rounded-lg transition-colors inline-flex items-center gap-2',
        uploading: 'bg-blue-100 dark:bg-blue-900/30 text-blue-400',
        disabled: `bg-gray-100 dark:bg-gray-800/50
                   text-gray-400 dark:text-gray-600 cursor-not-allowed`,
        active: `bg-gray-100 dark:bg-gray-800/50
                 text-gray-600 dark:text-gray-400
                 hover:bg-blue-100 dark:hover:bg-blue-900/30
                 hover:text-blue-600 dark:hover:text-blue-400
                 cursor-pointer`
      }
    },

    notas: {
      title: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2',
      content: `text-sm text-gray-600 dark:text-gray-400
                bg-white dark:bg-gray-800/50
                rounded-lg p-3 border border-gray-200 dark:border-gray-700`
    },

    acciones: {
      container: `flex items-center gap-2 pt-3
                  border-t border-gray-200 dark:border-gray-700`,

      buttonIniciar: `px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-700
                      text-white text-sm font-medium
                      hover:bg-blue-700 dark:hover:bg-blue-800
                      transition-colors disabled:opacity-50
                      flex items-center gap-2
                      shadow-sm hover:shadow-md`,

      buttonCompletar: `px-4 py-2 rounded-lg bg-green-600 dark:bg-green-700
                        text-white text-sm font-medium
                        hover:bg-green-700 dark:hover:bg-green-800
                        transition-colors disabled:opacity-50
                        disabled:cursor-not-allowed flex items-center gap-2
                        shadow-sm hover:shadow-md`,

      buttonDescartar: `px-4 py-2 rounded-lg bg-red-600 dark:bg-red-700
                        text-white text-sm font-medium
                        hover:bg-red-700 dark:hover:bg-red-800
                        transition-colors disabled:opacity-50
                        flex items-center gap-2
                        shadow-sm hover:shadow-md`,

      buttonOmitir: `px-4 py-2 rounded-lg bg-amber-600 dark:bg-amber-700
                     text-white text-sm font-medium
                     hover:bg-amber-700 dark:hover:bg-amber-800
                     transition-colors disabled:opacity-50
                     flex items-center gap-2
                     shadow-sm hover:shadow-md`,

      helpText: `text-xs text-amber-600 dark:text-amber-400
                 flex items-center gap-1`
    }
  }
} as const
