/**
 * Estilos centralizados para ViviendaCard Extendida
 * Separación estricta de estilos según arquitectura
 * Estilos para cards con información de cliente y abonos
 */

export const viviendaCardExtendedStyles = {
  // ============================================
  // CONTENEDOR PRINCIPAL
  // ============================================
  card: `
    relative overflow-hidden rounded-xl border
    bg-white dark:bg-gray-800
    border-gray-200 dark:border-gray-700
    shadow-sm hover:shadow-md
    transition-all duration-300
  `,

  // ============================================
  // HEADER
  // ============================================
  header: {
    base: `
      px-6 py-4
      bg-gradient-to-r
      border-b border-gray-200 dark:border-gray-700
    `,
    disponible: 'from-emerald-500 to-teal-600',
    asignada: 'from-blue-500 to-indigo-600',
    pagada: 'from-emerald-600 to-green-700',
  },

  headerTitle: `
    text-lg font-bold text-white
    flex items-center gap-2
  `,

  headerSubtitle: `
    text-sm text-white/90
    flex items-center gap-1 mt-1
  `,

  estadoBadge: {
    base: `
      inline-flex items-center gap-1.5
      px-3 py-1 rounded-full
      text-xs font-semibold
      bg-white/20 backdrop-blur-sm
      text-white
    `,
  },

  // ============================================
  // BODY - LAYOUT 2 COLUMNAS
  // ============================================
  body: `
    p-5 space-y-4
  `,

  twoColumnGrid: `
    grid grid-cols-1 lg:grid-cols-2 gap-4
  `,

  // ============================================
  // SECCIONES
  // ============================================
  section: {
    base: `
      p-4 rounded-lg
      bg-gray-50 dark:bg-gray-700/50
      border border-gray-200 dark:border-gray-600
      h-full
    `,
    title: `
      text-sm font-semibold text-gray-700 dark:text-gray-300
      mb-3 flex items-center gap-2
      pb-2 border-b border-gray-200 dark:border-gray-600
    `,
    content: `
      space-y-3
    `,
  },

  // ============================================
  // SECCIÓN CLIENTE
  // ============================================
  clienteSection: {
    container: `
      p-4 rounded-lg
      bg-gradient-to-br from-blue-50 to-indigo-50
      dark:from-blue-900/20 dark:to-indigo-900/20
      border border-blue-200 dark:border-blue-700
    `,
    nombre: `
      text-lg font-bold text-gray-900 dark:text-white
      flex items-center gap-2
    `,
    info: `
      text-sm text-gray-600 dark:text-gray-400
      flex items-center gap-2 mt-1
    `,
  },

  // ============================================
  // SECCIÓN INFORMACIÓN TÉCNICA
  // ============================================
  infoRow: `
    flex items-start gap-2
    text-sm text-gray-700 dark:text-gray-300
  `,

  infoLabel: `
    font-medium text-gray-500 dark:text-gray-400
    min-w-[100px]
  `,

  infoValue: `
    font-semibold text-gray-900 dark:text-white
  `,

  badge: {
    base: `
      inline-flex items-center gap-1
      px-2.5 py-1 rounded-lg text-xs font-medium
    `,
    regular: `
      bg-gray-100 dark:bg-gray-700
      text-gray-700 dark:text-gray-300
    `,
    irregular: `
      bg-orange-100 dark:bg-orange-900/30
      text-orange-700 dark:text-orange-400
    `,
    esquinera: `
      bg-purple-100 dark:bg-purple-900/30
      text-purple-700 dark:text-purple-400
    `,
  },

  // ============================================
  // SECCIÓN FINANCIERA
  // ============================================
  financialSection: {
    container: `
      p-4 rounded-lg
      bg-gradient-to-br from-emerald-50 to-teal-50
      dark:from-emerald-900/20 dark:to-teal-900/20
      border border-emerald-200 dark:border-emerald-700
      h-full
    `,
    row: `
      flex items-center justify-between
      text-sm
    `,
    label: `
      text-gray-600 dark:text-gray-400
      font-medium
    `,
    value: {
      total: `
        text-lg font-bold
        text-emerald-600 dark:text-emerald-400
      `,
      abonado: `
        text-base font-semibold
        text-blue-600 dark:text-blue-400
      `,
      pendiente: `
        text-base font-semibold
        text-orange-600 dark:text-orange-400
      `,
      pagado: `
        text-xl font-bold
        text-emerald-600 dark:text-emerald-400
      `,
    },
    valorBox: `
      p-3 rounded-lg
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      text-center
    `,
  },

  // ============================================
  // ESTADO PAGADA - CONFIRMACIÓN
  // ============================================
  pagadaConfirmation: `
    p-4 rounded-lg text-center
    bg-gradient-to-r from-emerald-500 to-green-600
    text-white
  `,

  pagadaIcon: `
    mx-auto mb-2
    w-12 h-12 rounded-full
    bg-white/20 backdrop-blur-sm
    flex items-center justify-center
  `,

  pagadaText: `
    text-lg font-bold
  `,

  // ============================================
  // FOOTER - ACCIONES
  // ============================================
  footer: `
    px-5 py-3
    bg-gray-50 dark:bg-gray-700/50
    border-t border-gray-200 dark:border-gray-700
    flex items-center justify-between gap-3
  `,

  actionButton: {
    primary: `
      flex-1 sm:flex-none
      px-4 py-2.5 rounded-lg
      bg-gradient-to-r from-emerald-500 to-teal-600
      text-white text-sm font-semibold
      hover:from-emerald-600 hover:to-teal-700
      hover:shadow-md
      active:scale-95
      transition-all duration-200
      flex items-center justify-center gap-2
    `,
    secondary: `
      flex-1 sm:flex-none
      px-4 py-2.5 rounded-lg
      bg-white dark:bg-gray-800
      border border-gray-300 dark:border-gray-600
      text-gray-700 dark:text-gray-300 text-sm font-medium
      hover:bg-gray-50 dark:hover:bg-gray-700
      hover:border-gray-400 dark:hover:border-gray-500
      active:scale-95
      transition-all duration-200
      flex items-center justify-center gap-2
    `,
    danger: `
      flex-1 sm:flex-none
      px-4 py-2.5 rounded-lg
      bg-red-50 dark:bg-red-900/20
      border border-red-200 dark:border-red-700
      text-red-600 dark:text-red-400 text-sm font-medium
      hover:bg-red-100 dark:hover:bg-red-900/30
      hover:border-red-300 dark:hover:border-red-600
      active:scale-95
      transition-all duration-200
      flex items-center justify-center gap-2
    `,
  },

  actionGroup: `
    flex items-center gap-2 flex-wrap
  `,

  // ============================================
  // HELPERS
  // ============================================
  divider: `
    h-px bg-gray-200 dark:bg-gray-600
  `,

  iconCircle: `
    flex items-center justify-center
    w-5 h-5 rounded-full
    bg-white/20
  `,
}
