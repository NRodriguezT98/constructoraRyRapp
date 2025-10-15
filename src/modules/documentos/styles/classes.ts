/**
 * Clases de estilos centralizadas para el módulo de Documentos
 * Evita strings de Tailwind > 100 caracteres inline
 */

export const documentoClasses = {
  // Cards
  card: {
    base: 'rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800',
    interactive: 'group relative flex h-full min-h-[400px] flex-col overflow-hidden',
  },

  // Badges
  badge: {
    important: 'flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-xs font-medium text-white shadow-lg',
    vencido: 'flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white shadow-lg',
    porVencer: 'flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white shadow-lg',
  },

  // Upload zone
  upload: {
    dropzone: 'relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300',
    dropzoneActive: 'scale-[1.02] border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    dropzoneIdle: 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500',
    dropzoneError: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    filePreview: 'rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-purple-900/20',
  },

  // Form fields
  input: {
    base: 'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-400',
    textarea: 'w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-400',
    select: 'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-400',
  },

  // Buttons
  button: {
    primary: 'flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50',
    secondary: 'rounded-xl px-6 py-2.5 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800',
    icon: 'rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
    danger: 'rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20',
  },

  // Menu dropdown
  menu: {
    container: 'absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800',
    item: 'flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
    itemDanger: 'flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
  },

  // Filtros
  filtros: {
    container: 'rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    searchInput: 'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-blue-400',
  },

  // Empty states
  empty: {
    container: 'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50',
    icon: 'mx-auto h-16 w-16 text-gray-400 dark:text-gray-600',
    title: 'mt-4 text-lg font-semibold text-gray-900 dark:text-white',
    description: 'mt-2 text-sm text-gray-500 dark:text-gray-400',
  },

  // Categorías
  categoria: {
    card: 'flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800',
    icon: 'rounded-lg bg-gray-50 p-3 dark:bg-gray-900',
  },
}

export const documentoAnimations = {
  // Card animations
  card: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    whileHover: { y: -4 },
  },

  // List item animations
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  // Grid item animations
  gridItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Modal animations
  modal: {
    initial: { opacity: 0, scale: 0.95, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
  },

  // Collapse animations
  collapse: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
  },
}
