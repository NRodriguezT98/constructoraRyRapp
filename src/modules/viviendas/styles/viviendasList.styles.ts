/**
 * Estilos centralizados para el listado de viviendas
 * Todas las clases de Tailwind en un solo lugar
 */

export const viviendasListStyles = {
  // ============================================
  // CONTENEDOR PRINCIPAL
  // ============================================
  container: 'container mx-auto px-4 py-6 sm:px-6 lg:px-8',
  content: 'space-y-6',

  // ============================================
  // HEADER
  // ============================================
  header: {
    container: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
    title: 'text-3xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-sm text-gray-600 dark:text-gray-400',
    buttonContainer: 'flex gap-2',
    button:
      'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
  },

  // ============================================
  // ESTADÍSTICAS
  // ============================================
  stats: {
    container: 'grid grid-cols-2 gap-4 lg:grid-cols-5',
    card: 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    label: 'text-xs font-medium text-gray-600 dark:text-gray-400',
    value: 'mt-1 text-2xl font-bold text-gray-900 dark:text-white',
    icon: 'text-gray-400 dark:text-gray-500',
  },

  // ============================================
  // FILTROS
  // ============================================
  filters: {
    container:
      'rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
    label: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
    input:
      'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400',
    select:
      'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400',
    buttonClear:
      'text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
  },

  // ============================================
  // GRID / LISTA
  // ============================================
  grid: {
    container: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
    list: 'space-y-4',
  },

  // ============================================
  // CARD DE VIVIENDA
  // ============================================
  card: {
    container:
      'group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800',
    header: 'border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-750',
    headerTitle: 'flex items-center justify-between',
    numero: 'text-lg font-bold text-gray-900 dark:text-white',
    estado: {
      base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      Disponible: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Apartada: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      Vendida: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Escriturada: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    },
    body: 'space-y-3 p-4',
    info: 'flex items-start gap-2',
    infoIcon: 'mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500',
    infoText: 'text-sm text-gray-700 dark:text-gray-300',
    infoLabel: 'text-xs text-gray-500 dark:text-gray-400',
    divider: 'border-t border-gray-200 dark:border-gray-700',
    footer: 'flex items-center justify-between p-4',
    valor: 'text-lg font-bold text-blue-600 dark:text-blue-400',
    actions: 'flex gap-2',
    actionButton: {
      base: 'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
      view: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
      edit: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800',
      delete:
        'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800',
    },
  },

  // ============================================
  // ESTADOS VACÍOS Y CARGA
  // ============================================
  empty: {
    container: 'rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600',
    icon: 'mx-auto h-12 w-12 text-gray-400 dark:text-gray-500',
    title: 'mt-4 text-lg font-semibold text-gray-900 dark:text-white',
    description: 'mt-2 text-sm text-gray-600 dark:text-gray-400',
    button:
      'mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
  },

  skeleton: {
    container: 'space-y-4',
    card: 'animate-pulse rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800',
    header: 'h-4 w-1/4 rounded bg-gray-300 dark:bg-gray-600',
    line: 'h-3 rounded bg-gray-200 dark:bg-gray-700',
    button: 'h-8 w-20 rounded bg-gray-200 dark:bg-gray-700',
  },

  // ============================================
  // MODAL
  // ============================================
  modal: {
    overlay: 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
    container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    content:
      'relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800',
    header: 'border-b border-gray-200 p-6 dark:border-gray-700',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    description: 'mt-1 text-sm text-gray-600 dark:text-gray-400',
    body: 'p-6',
    footer: 'border-t border-gray-200 p-6 dark:border-gray-700',
    closeButton:
      'absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300',
  },

  // ============================================
  // MODAL ELIMINAR
  // ============================================
  deleteModal: {
    warning:
      'rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20',
    warningText: 'text-sm text-red-800 dark:text-red-300',
    actions: 'flex justify-end gap-3 pt-4',
    cancelButton:
      'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    deleteButton:
      'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50',
  },
}
