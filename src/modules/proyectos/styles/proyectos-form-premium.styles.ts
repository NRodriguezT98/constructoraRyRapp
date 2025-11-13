/**
 * Estilos Premium para ProyectosForm
 * ✅ Diseño premium con gradientes naranja/ámbar
 * ✅ Modo oscuro completo
 * ✅ Animaciones Framer Motion
 * ✅ Responsive design
 */

export const proyectosFormPremiumStyles = {
  // ==================== CONTENEDOR OPTIMIZADO ====================
  form: 'space-y-3', // ← Compacto para evitar scroll

  // ==================== BADGE STICKY SUPERIOR OPTIMIZADO (CON SEPARACIÓN VISUAL) ====================
  badgeSticky: {
    container: 'sticky top-0 z-50 -mx-6 -mt-6 px-6 py-1 mb-2 bg-white dark:bg-gray-900 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 shadow-xl', // ← Compacto
    content: 'flex items-center justify-between',
    badges: 'flex items-center gap-2',

    // Badge de manzanas - NEUTRAL con ícono naranja
    manzanasBadge: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold',
    manzanasIcon: 'w-3.5 h-3.5 text-orange-600 dark:text-orange-400', // ← Ícono mantiene color
    manzanasCount: 'text-gray-900 dark:text-white font-bold',
    manzanasLabel: '',

    // Badge de viviendas - NEUTRAL con ícono verde
    viviendasBadge: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold',
    viviendasIcon: 'w-3.5 h-3.5 text-green-600 dark:text-green-400', // ← Ícono mantiene color
    viviendasCount: 'text-gray-900 dark:text-white font-bold',
    viviendasLabel: '',

    // Badge "EDITANDO" - AZUL informativo (no naranja)
    editingBadge: 'px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider',
  },

  // ==================== LAYOUT OPTIMIZADO ====================
  grid: 'grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4', // ← Compacto

  // ==================== SECCIÓN INFORMACIÓN GENERAL OPTIMIZADA ====================
  infoSection: {
    container: 'group relative z-0 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-xl hover:shadow-2xl transition-all duration-300 lg:after:absolute lg:after:right-0 lg:after:top-4 lg:after:bottom-4 lg:after:w-px lg:after:bg-gradient-to-b lg:after:from-transparent lg:after:via-gray-300 dark:lg:after:via-gray-600 lg:after:to-transparent', // ← Divisor vertical en desktop

    // Header
    header: 'flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700', // ← Compacto
    headerIcon: 'w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shadow-md', // ← NEUTRAL (era naranja)
    headerIconSvg: 'w-5 h-5 text-gray-600 dark:text-gray-400', // ← NEUTRAL
    headerTitle: 'text-base font-bold bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 dark:from-gray-100 dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent', // ← text-lg a text-base

    // Contenido
    content: 'space-y-3', // ← Compacto
  },

  // ==================== CAMPOS DE INPUT OPTIMIZADOS ====================
  field: {
    container: 'mb-3', // ← Compacto
    label: 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5', // ← Compacto
    required: 'text-red-500',

    // Input con ícono
    inputWrapper: 'relative',
    inputIcon: 'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none',
    input: 'w-full pl-11 pr-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none text-sm font-medium', // ← py-3 a py-2
    inputError: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',

    // Select específico (mejorado)
    select: 'w-full pl-11 pr-10 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none text-sm font-medium appearance-none cursor-pointer bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")] dark:bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%239ca3af\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat',
    selectError: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',

    // Textarea con ícono
    textareaWrapper: 'relative',
    textareaIcon: 'absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none',
    textarea: 'w-full pl-11 pr-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none text-sm font-medium resize-none', // ← py-3 a py-2
    textareaError: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',

    // Mensaje de error
    error: 'flex items-center gap-2 mt-1.5 text-red-600 dark:text-red-400 text-xs font-medium',
    errorIcon: 'w-3.5 h-3.5',

    // Helper text
    helper: 'mt-1.5 text-xs text-gray-500 dark:text-gray-400',
  },

  // ==================== SECCIÓN MANZANAS COMPACTA Y NEUTRAL ====================
  manzanasSection: {
    container: 'group relative z-0 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-xl hover:shadow-2xl transition-all duration-300', // ← Fondo NEUTRAL (era naranja)

    // Header
    header: 'flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700', // ← Compacto
    headerLeft: 'flex items-center gap-3',
    headerIcon: 'w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/40', // ← Ícono mantiene naranja (destaca)
    headerIconSvg: 'w-5 h-5 text-white',
    headerTitle: 'text-base font-bold bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 dark:from-gray-100 dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent', // ← Título neutral

    // Botón agregar - MANTIENE naranja (acción primaria)
    addButton: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105',
    addButtonIcon: 'w-4 h-4',

    // Lista de manzanas
    list: 'space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent', // ← Compacto

    // Estado vacío - NEUTRAL
    emptyState: 'rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-950/20 py-8 text-center', // ← Era naranja
    emptyIcon: 'mx-auto mb-2 h-8 w-8 text-gray-400 dark:text-gray-600',
    emptyTitle: 'text-sm font-medium text-gray-700 dark:text-gray-400',
    emptySubtitle: 'mt-0.5 text-xs text-gray-500 dark:text-gray-600',

    // Mensaje de error general
    errorMessage: 'flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium',
    errorIcon: 'w-4 h-4',
  },

  // ==================== CARD DE MANZANA NEUTRAL ====================
  manzanaCard: {
    container: 'group/manzana relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 p-3 shadow-md hover:shadow-xl transition-all duration-300', // ← Compacto (p-4 a p-3)

    // Header
    header: 'flex items-center justify-between mb-2',
    headerLeft: 'inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600', // ← Compacto
    headerIcon: 'w-3.5 h-3.5 text-gray-600 dark:text-gray-400', // ← NEUTRAL
    headerTitle: 'text-xs font-bold text-gray-700 dark:text-gray-300', // ← NEUTRAL

    // Botón eliminar
    deleteButton: 'opacity-0 group-hover/manzana:opacity-100 w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-600 hover:text-white transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110',
    deleteIcon: 'w-4 h-4',

    // Grid de campos
    grid: 'grid grid-cols-2 gap-2.5',

    // Campo individual
    field: {
      container: '',
      label: 'sr-only',
      input: 'w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none text-sm font-medium',
      inputError: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',

      // Input con ícono (viviendas)
      inputWrapper: 'relative',
      inputIcon: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
      inputWithIcon: 'w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none text-sm font-medium',

      error: 'flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-xs font-medium',
      errorIcon: 'w-3 h-3',
    },
  },

  // ==================== BOTONES FOOTER CON MÁS ESPACIO SUPERIOR ====================
  footer: {
    container: 'flex items-center justify-end gap-3 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700', // ← Compacto (pt-4 mt-4 a pt-3 mt-3)

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
