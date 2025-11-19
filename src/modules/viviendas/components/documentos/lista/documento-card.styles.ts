/**
 * 🎨 Estilos Centralizados - DocumentoCard
 *
 * Todas las clases de Tailwind para el componente DocumentoCard
 * organizadas por sección para fácil mantenimiento.
 */

export const documentoCardStyles = {
  // 📦 Container Principal
  container: {
    base: 'group relative flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800',
    menuAbierto: 'z-50',
    menuCerrado: 'z-0',
  },

  // 📄 Content
  content: {
    wrapper: 'flex flex-1 flex-col p-4',
  },

  // 🎯 Header
  header: {
    wrapper: 'mb-3 flex items-start justify-between gap-3',
    left: 'flex items-center gap-3 flex-1 min-w-0',
    iconContainer: 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br',
    iconContainerEmpty: 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700',
    categoryName: 'text-xs font-semibold text-gray-600 dark:text-gray-400 truncate',
    actions: 'flex items-center gap-1.5 flex-shrink-0',
  },

  // ⭐ Botones de Acción
  buttons: {
    star: {
      active: 'rounded-md p-1.5 text-yellow-500 transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
      inactive: 'rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:text-gray-600 dark:hover:bg-gray-700',
    },
    menu: 'rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700',
  },

  // 📝 Título
  title: {
    wrapper: 'mb-2 flex items-start gap-2',
    text: 'flex-1 min-w-0 text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 line-clamp-2 leading-snug',
  },

  // 🏷️ Badges
  badges: {
    wrapper: 'flex items-center gap-1.5 mb-3 flex-wrap',
    importante: 'inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    proceso: 'inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    versiones: 'inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    protegido: 'inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
  },

  // 📅 Metadata Grid
  metadata: {
    grid: 'grid grid-cols-2 gap-x-4 gap-y-3 mb-3',
    item: 'flex flex-col gap-0.5',
    label: 'text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide',
    content: 'flex items-center gap-1.5 text-gray-600 dark:text-gray-400',
    contentText: 'truncate',
  },

  // ⚠️ Alertas de Vencimiento
  vencimiento: {
    vencido: 'inline-flex items-center gap-1 rounded-md bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400',
    proximo: 'inline-flex items-center gap-1 rounded-md bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  },

  // 📊 Footer
  footer: {
    wrapper: 'mt-auto pt-3 border-t border-gray-100 dark:border-gray-700',
    actions: 'flex items-center gap-2',
    button: {
      primary: 'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md',
      secondary: 'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    },
  },

  // 🎛️ Menu Dropdown
  menu: {
    container: 'absolute right-0 top-full mt-1 z-50 min-w-[220px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-2xl dark:border-gray-700 dark:bg-gray-800',
    item: {
      base: 'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors',
      default: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
      primary: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20',
      warning: 'text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20',
      danger: 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
    },
    separator: 'my-1.5 h-px bg-gray-200 dark:bg-gray-700',
  },
}
