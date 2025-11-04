/**
 * ============================================
 * ESTILOS CENTRALIZADOS - MÓDULO USUARIOS
 * ============================================
 * Siguiendo lineamientos de diseño con tema claro/oscuro
 */

export const usuariosStyles = {
  // Contenedores
  container: 'p-4 sm:p-6',
  card: 'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm',
  cardHeader: 'border-b border-slate-200 dark:border-slate-700 p-4',
  cardBody: 'p-4',

  // Header
  header: {
    wrapper: 'mb-6',
    title: 'text-2xl font-bold text-slate-900 dark:text-white',
    subtitle: 'mt-1 text-sm text-slate-600 dark:text-slate-400',
    actions: 'mt-3 flex flex-wrap items-center gap-2',
  },

  // Búsqueda y filtros
  search: {
    wrapper: 'flex flex-wrap items-center gap-2',
    input: 'flex-1 min-w-[200px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    select: 'rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
  },

  // Tabla
  table: {
    wrapper: 'overflow-x-auto',
    table: 'min-w-full divide-y divide-slate-200 dark:divide-slate-700',
    thead: 'bg-slate-50 dark:bg-slate-900/50',
    th: 'px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300',
    tbody: 'divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800',
    tr: 'hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors',
    td: 'whitespace-nowrap px-3 py-2.5 text-sm',
  },

  // Badges
  badge: {
    base: 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
    rol: {
      Administrador: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800',
      Gerente: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
      Vendedor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    },
    estado: {
      Activo: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800',
      Inactivo: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-800',
      Bloqueado: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800',
    },
  },

  // Botones
  button: {
    primary: 'rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
    secondary: 'rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
    danger: 'rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
    icon: 'rounded-lg p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
  },

  // Formularios
  form: {
    group: 'space-y-1.5',
    label: 'block text-sm font-medium text-slate-700 dark:text-slate-300',
    labelRequired: 'text-red-500 dark:text-red-400',
    input: 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    select: 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    textarea: 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none',
    error: 'mt-1 text-xs text-red-600 dark:text-red-400',
    hint: 'mt-1 text-xs text-slate-500 dark:text-slate-400',
  },

  // Modal
  modal: {
    overlay: 'fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm',
    wrapper: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    content: 'w-full rounded-lg bg-white dark:bg-slate-800 shadow-xl',
    header: 'border-b border-slate-200 dark:border-slate-700 px-4 py-3',
    title: 'text-lg font-semibold text-slate-900 dark:text-white',
    body: 'px-4 py-3 max-h-[70vh] overflow-y-auto',
    footer: 'border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-end gap-2',
  },

  // Stats Cards
  statsCard: {
    wrapper: 'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm',
    icon: 'rounded-lg p-2',
    label: 'mt-2 text-xs font-medium text-slate-600 dark:text-slate-400',
    value: 'mt-1 text-2xl font-bold text-slate-900 dark:text-white',
    change: 'mt-1 flex items-center gap-1 text-xs',
  },

  // Empty State
  empty: {
    wrapper: 'flex flex-col items-center justify-center py-8 text-center',
    icon: 'h-10 w-10 text-slate-400 dark:text-slate-600',
    title: 'mt-3 text-base font-medium text-slate-900 dark:text-white',
    description: 'mt-1 text-sm text-slate-600 dark:text-slate-400',
  },

  // Loading
  loading: {
    spinner: 'h-6 w-6 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600',
    wrapper: 'flex items-center justify-center py-8',
  },

  // Avatar
  avatar: {
    wrapper: 'flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-medium text-white',
    colors: [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
    ],
  },
}
