// ============================================
// ESTILOS CENTRALIZADOS: Documentos Cliente
// ============================================

/**
 * ⭐ ESTILOS DE DOCUMENTOS
 *
 * Para componentes de:
 * - Upload de documentos
 * - Lista de documentos
 * - Filtros
 * - Categorías
 */

// ===================
// UPLOAD DE DOCUMENTOS
// ===================

export const uploadStyles = {
  // Contenedor principal del upload
  container: 'border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20',

  // Header del upload
  header: 'flex items-start gap-4 mb-6',

  iconWrapper: 'flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center',

  icon: 'text-white',

  titleSection: 'flex-1',

  title: 'text-xl font-bold text-gray-900 dark:text-white mb-1',

  subtitle: 'text-sm text-gray-600 dark:text-gray-400',

  badge: 'px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium',

  // Zona de drag & drop
  dropzone: {
    idle: 'border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-all hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10',
    active: 'border-2 border-dashed border-purple-500 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20 rounded-xl p-8 text-center',
    error: 'border-2 border-dashed border-red-300 dark:border-red-700 rounded-xl p-8 text-center bg-red-50/50 dark:bg-red-900/10',
  },

  dropzoneIcon: 'mx-auto mb-3 text-gray-400',

  dropzoneTitle: 'font-semibold text-gray-900 dark:text-white mb-1',

  dropzoneDescription: 'text-sm text-gray-500 dark:text-gray-400',

  // Archivo seleccionado
  filePreview: 'flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',

  fileIcon: 'text-purple-600 dark:text-purple-400',

  fileInfo: 'flex-1',

  fileName: 'font-semibold text-gray-900 dark:text-white',

  fileSize: 'text-sm text-gray-500 dark:text-gray-400',

  removeButton: 'p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors',
}

// ===================
// FORMULARIO DE UPLOAD
// ===================

export const uploadFormStyles = {
  label: 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2',

  input: 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all',

  select: 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all',

  textarea: 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none',

  // Alert de advertencia
  warning: 'flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg',

  warningIcon: 'text-yellow-600 dark:text-yellow-400',

  warningText: 'text-sm text-yellow-800 dark:text-yellow-200',
}

// ===================
// BOTONES DE UPLOAD
// ===================

export const uploadButtonStyles = {
  cancel: 'px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed',

  submit: 'px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',

  loading: 'cursor-wait opacity-75',

  icon: 'w-5 h-5',
}

// ===================
// LISTA DE DOCUMENTOS
// ===================

export const listStyles = {
  // Contenedor
  container: 'space-y-6',

  // Controles superiores
  controls: 'flex items-center justify-between gap-4 mb-4',

  // Toggle de vista
  viewToggle: {
    base: 'flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all',
    active: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md',
    inactive: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
  },

  // Grid de documentos
  grid: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',

  // Lista de documentos
  list: 'space-y-3',

  // Estado vacío
  empty: 'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-800/50',

  emptyIcon: 'mb-4 h-16 w-16 text-gray-400',

  emptyTitle: 'mb-2 text-lg font-semibold text-gray-900 dark:text-white',

  emptyDescription: 'text-sm text-gray-500 dark:text-gray-400',
}

// ===================
// FILTROS
// ===================

export const filterStyles = {
  container: 'space-y-4',

  // Barra de búsqueda
  searchWrapper: 'relative',

  searchIcon: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400',

  searchInput: 'w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all',

  // Filtros en fila
  filtersRow: 'flex flex-wrap items-center gap-3',

  // Select de categoría
  categorySelect: 'px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all',

  // Toggle "Solo importantes"
  importantToggle: {
    base: 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer',
    active: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-300 dark:border-yellow-700',
    inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600',
  },

  // Botón limpiar filtros
  clearButton: 'px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors',
}

// ===================
// CARD DE DOCUMENTO
// ===================

export const documentCardStyles = {
  // Card horizontal
  horizontal: {
    container: 'flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all',
    iconWrapper: 'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
    content: 'flex-1 min-w-0',
    title: 'font-semibold text-gray-900 dark:text-white truncate',
    description: 'text-sm text-gray-500 dark:text-gray-400 truncate',
    metadata: 'flex items-center gap-2 mt-1',
    actions: 'flex items-center gap-2',
  },

  // Card vertical (grid)
  vertical: {
    container: 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all',
    header: 'flex items-start justify-between mb-4',
    iconWrapper: 'w-14 h-14 rounded-xl flex items-center justify-center',
    title: 'font-bold text-gray-900 dark:text-white mb-1',
    description: 'text-sm text-gray-500 dark:text-gray-400 mb-3',
    footer: 'flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700',
  },

  // Badges/Tags en cards
  badge: {
    importante: 'inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium',
    categoria: 'inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium',
    requerido: 'inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium',
  },

  // Botones de acción
  actionButton: 'p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors',
}

// ===================
// VISTA AGRUPADA
// ===================

export const groupedViewStyles = {
  container: 'space-y-6',

  // Grupo de categoría
  group: 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden',

  // Header del grupo
  header: 'bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700',

  title: 'font-bold text-gray-900 dark:text-white',

  count: 'ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium',

  // Contenido del grupo
  content: 'p-4 space-y-3',
}

// ===================
// MODALES DE DOCUMENTOS
// ===================

export const documentModalStyles = {
  // Modal de renombrar
  renameInput: 'w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all',

  // Modal de categorías
  categoryOption: {
    base: 'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
    selected: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    unselected: 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600',
  },

  categoryIcon: 'w-10 h-10 rounded-lg flex items-center justify-center',

  categoryName: 'font-semibold text-gray-900 dark:text-white',

  categoryDescription: 'text-sm text-gray-500 dark:text-gray-400',
}
