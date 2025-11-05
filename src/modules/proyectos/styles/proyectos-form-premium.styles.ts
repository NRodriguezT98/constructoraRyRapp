/**
 * Estilos Premium para ProyectosForm
 * ✅ Diseño premium con gradientes naranja/ámbar
 * ✅ Modo oscuro completo
 * ✅ Animaciones Framer Motion
 * ✅ Responsive design
 */

export const proyectosFormPremiumStyles = {
  // ==================== CONTENEDOR ====================
  form: 'space-y-6',

  // ==================== BADGE STICKY SUPERIOR ====================
  badgeSticky: {
    container: 'sticky -top-6 z-50 -mx-6 -mt-6 px-6 py-4 mb-4 bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-900 dark:via-amber-900 dark:to-yellow-900 backdrop-blur-2xl border-b border-orange-200/50 dark:border-orange-800/50 shadow-2xl shadow-orange-500/20',
    content: 'flex items-center justify-between',
    badges: 'flex items-center gap-3',

    // Badge de manzanas (naranja)
    manzanasBadge: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/30',
    manzanasIcon: 'w-4 h-4',
    manzanasCount: '',
    manzanasLabel: 'font-normal opacity-90',

    // Badge de viviendas (verde)
    viviendasBadge: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-green-500/30',
    viviendasIcon: 'w-4 h-4',
    viviendasCount: '',
    viviendasLabel: 'font-normal opacity-90',

    // Badge "EDITANDO"
    editingBadge: 'px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider',
  },

  // ==================== LAYOUT ====================
  grid: 'grid grid-cols-1 gap-6 lg:grid-cols-2',

  // ==================== SECCIÓN INFORMACIÓN GENERAL ====================
  infoSection: {
    container: 'group relative z-0 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300',

    // Header
    header: 'flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700',
    headerIcon: 'w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/40',
    headerIconSvg: 'w-5 h-5 text-white',
    headerTitle: 'text-lg font-bold bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 dark:from-gray-100 dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent',

    // Contenido
    content: 'space-y-5',
  },

  // ==================== CAMPOS DE INPUT ====================
  field: {
    container: 'mb-5',
    label: 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2',
    required: 'text-red-500',

    // Input con ícono
    inputWrapper: 'relative',
    inputIcon: 'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none',
    input: 'w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none text-sm font-medium',
    inputError: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',

    // Textarea con ícono
    textareaWrapper: 'relative',
    textareaIcon: 'absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none',
    textarea: 'w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none text-sm font-medium resize-none',
    textareaError: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',

    // Mensaje de error
    error: 'flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-xs font-medium',
    errorIcon: 'w-3.5 h-3.5',
  },

  // ==================== SECCIÓN MANZANAS ====================
  manzanasSection: {
    container: 'group relative z-0 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200/50 dark:border-orange-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300',

    // Header
    header: 'flex items-center justify-between mb-6 pb-4 border-b border-orange-200 dark:border-orange-800',
    headerLeft: 'flex items-center gap-3',
    headerIcon: 'w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/40',
    headerIconSvg: 'w-5 h-5 text-white',
    headerTitle: 'text-lg font-bold bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-400 dark:via-amber-400 dark:to-yellow-400 bg-clip-text text-transparent',

    // Botón agregar
    addButton: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105',
    addButtonIcon: 'w-4 h-4',

    // Lista de manzanas
    list: 'space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-300 dark:scrollbar-thumb-orange-700 scrollbar-track-transparent',

    // Estado vacío
    emptyState: 'rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20 py-8 text-center',
    emptyIcon: 'mx-auto mb-2 h-8 w-8 text-orange-400 dark:text-orange-600',
    emptyTitle: 'text-sm font-medium text-orange-700 dark:text-orange-400',
    emptySubtitle: 'mt-0.5 text-xs text-orange-500 dark:text-orange-600',

    // Mensaje de error general
    errorMessage: 'flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium',
    errorIcon: 'w-4 h-4',
  },

  // ==================== CARD DE MANZANA ====================
  manzanaCard: {
    container: 'group/manzana relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200/50 dark:border-orange-800/50 p-4 shadow-md hover:shadow-xl hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-300',

    // Header
    header: 'flex items-center justify-between mb-3',
    headerLeft: 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-300 dark:border-orange-700',
    headerIcon: 'w-3.5 h-3.5 text-orange-600 dark:text-orange-400',
    headerTitle: 'text-xs font-bold text-orange-700 dark:text-orange-300',

    // Botón eliminar
    deleteButton: 'opacity-0 group-hover/manzana:opacity-100 w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-600 hover:text-white transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110',
    deleteIcon: 'w-4 h-4',

    // Grid de campos
    grid: 'grid grid-cols-2 gap-3',

    // Campo individual
    field: {
      container: '',
      label: 'sr-only',
      input: 'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none text-sm font-medium',
      inputError: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',

      // Input con ícono (viviendas)
      inputWrapper: 'relative',
      inputIcon: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
      inputWithIcon: 'w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none text-sm font-medium',

      error: 'flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-xs font-medium',
      errorIcon: 'w-3 h-3',
    },
  },

  // ==================== BOTONES FOOTER ====================
  footer: {
    container: 'flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700',

    cancelButton: 'px-6 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg',

    submitButton: 'group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 text-white text-sm font-bold hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105',
    submitButtonIcon: 'w-4 h-4',

    loadingSpinner: 'w-4 h-4 animate-spin',
  },

  // ==================== ANIMACIONES FRAMER MOTION ====================
  animations: {
    // Container principal
    container: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 },
    },

    // Sección información
    infoSection: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 },
    },

    // Sección manzanas
    manzanasSection: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, delay: 0.1 },
    },

    // Badge editando
    editingBadge: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
    },

    // Card de manzana (individual)
    manzanaCard: {
      initial: { opacity: 0, scale: 0.95, y: -10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, x: 100 },
      transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
      layout: true,
    },

    // Error message
    errorMessage: {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
    },

    // Footer
    footer: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, delay: 0.2 },
    },
  },
}
