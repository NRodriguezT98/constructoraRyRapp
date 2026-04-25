/**
 * 🎨 ESTILOS CENTRALIZADOS — USUARIOS (VISTA PRINCIPAL)
 *
 * Color: Índigo / Púrpura / Fuchsia
 * Patrón: Compacto premium idéntico a Proyectos/Viviendas
 */

export const usuariosPageStyles = {
  // ── Contenedor ──────────────────────────────────────────────────────────
  container: {
    page: 'min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4',
  },

  // ── Header hero ─────────────────────────────────────────────────────────
  header: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 dark:from-indigo-700 dark:via-purple-700 dark:to-fuchsia-800 p-6 shadow-2xl shadow-indigo-500/20',
    pattern:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10',
    topRow: 'flex items-center justify-between',
    titleGroup: 'flex items-center gap-3',
    iconCircle:
      'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    icon: 'w-6 h-6 text-white',
    titleWrapper: 'space-y-0.5',
    title: 'text-2xl font-bold text-white',
    subtitle: 'text-indigo-100 dark:text-indigo-200 text-xs',
    buttonGroup: 'flex items-center gap-2',
    badge:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium',
    badgeIcon: 'w-3.5 h-3.5',
    button:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg',
    buttonIcon: 'w-4 h-4',
  },

  // ── Métricas (4 cards) ──────────────────────────────────────────────────
  metricas: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
    card: 'group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 px-4 py-3 shadow-lg hover:shadow-2xl transition-all duration-300',
    glowIndigo:
      'absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    glowGreen:
      'absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    glowRed:
      'absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    glowAmber:
      'absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    content: 'relative z-10 flex items-center gap-3',
    iconIndigo:
      'w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/40',
    iconGreen:
      'w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/40',
    iconRed:
      'w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/40',
    iconAmber:
      'w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/40',
    icon: 'w-4 h-4 text-white',
    textGroup: 'flex-1',
    valueIndigo:
      'text-lg font-bold bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent',
    valueGreen:
      'text-lg font-bold bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent',
    valueRed:
      'text-lg font-bold bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent',
    valueAmber:
      'text-lg font-bold bg-gradient-to-br from-amber-600 via-orange-600 to-red-500 bg-clip-text text-transparent',
    label: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium',
  },

  // ── Filtros ─────────────────────────────────────────────────────────────
  filtros: {
    container:
      'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-indigo-500/10',
    bar: 'flex items-center gap-2',
    searchWrapper: 'relative flex-1',
    searchIcon:
      'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    searchInput:
      'w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-200',
    searchClear:
      'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors',
    select:
      'px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm text-gray-700 dark:text-gray-200 min-w-[150px]',
    footer:
      'flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700',
    resultCount: 'text-xs text-gray-600 dark:text-gray-400 font-medium',
    clearButton:
      'inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
  },

  // ── Tabla de usuarios ───────────────────────────────────────────────────
  tabla: {
    wrapper: 'overflow-x-auto',
    container:
      'rounded-xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg',
    table: 'w-full text-sm',
    thead:
      'bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700',
    th: 'px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
    thRight:
      'px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
    tbody: 'divide-y divide-gray-100 dark:divide-gray-700/50',
    tr: 'group hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors duration-150',
    td: 'px-4 py-3 whitespace-nowrap',
    tdRight: 'px-4 py-3 whitespace-nowrap text-right',
    // Avatar + nombre
    avatarCell: 'flex items-center gap-3',
    avatar:
      'w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/25 shrink-0',
    avatarName: 'text-sm font-semibold text-gray-900 dark:text-white',
    avatarWarning: 'text-xs text-amber-600 dark:text-amber-400 font-medium',
    // Email
    email: 'text-sm text-gray-600 dark:text-gray-400',
    // Badge de rol/estado
    badge:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
    // Último acceso
    fecha: 'text-xs text-gray-500 dark:text-gray-400',
    // Botón de acción
    actionButton:
      'opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400',
  },

  // ── Empty state ─────────────────────────────────────────────────────────
  empty: {
    container: 'flex flex-col items-center justify-center py-16 text-center',
    iconWrapper:
      'w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4',
    icon: 'w-8 h-8 text-indigo-400 dark:text-indigo-500',
    title: 'text-lg font-bold text-gray-900 dark:text-white mb-2',
    subtitle: 'text-sm text-gray-500 dark:text-gray-400 max-w-sm',
  },

  // ── Formulario (páginas Nuevo / Editar) ─────────────────────────────────
  formulario: {
    // Layout general de la página
    page: 'min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    content: 'max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4',
    // Barra de navegación superior
    nav: 'flex items-center gap-3 mb-2',
    backButton:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all',
    backIcon: 'w-4 h-4',
    breadcrumb: 'text-sm text-gray-400 dark:text-gray-500',
    // Header con gradiente
    header:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 dark:from-indigo-700 dark:via-purple-700 dark:to-fuchsia-800 p-6 shadow-2xl shadow-indigo-500/20',
    headerPattern:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    headerContent: 'relative z-10 flex items-center gap-3',
    headerIcon:
      'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0',
    headerIconInner: 'w-6 h-6 text-white',
    headerTitle: 'text-xl font-bold text-white',
    headerSubtitle: 'text-indigo-100 text-xs mt-0.5',
    // Card del formulario
    card: 'rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6',
    // Sección dentro de la card
    section: 'space-y-4',
    sectionTitle:
      'text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-100 dark:border-gray-700',
    // Grid de campos
    grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    grid1: 'grid grid-cols-1 gap-4',
    // Campo individual
    field: 'space-y-1.5',
    label: 'block text-sm font-semibold text-gray-700 dark:text-gray-300',
    labelRequired:
      'block text-sm font-semibold text-gray-700 dark:text-gray-300 after:content-["*"] after:ml-1 after:text-red-500',
    input:
      'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-gray-200 placeholder:text-gray-400',
    inputError:
      'w-full px-3 py-2 text-sm bg-red-50 dark:bg-red-950/20 border-2 border-red-400 dark:border-red-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all dark:text-gray-200',
    inputDisabled:
      'w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-500 cursor-not-allowed',
    select:
      'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-gray-200',
    errorText: 'text-xs font-medium text-red-500 dark:text-red-400',
    helperText: 'text-xs text-gray-500 dark:text-gray-400',
    // Checkbox
    checkboxRow: 'flex items-center gap-2',
    checkbox:
      'w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600',
    checkboxLabel: 'text-sm text-gray-700 dark:text-gray-300',
    // Error general
    alertError:
      'flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400',
    alertIcon: 'w-4 h-4 mt-0.5 shrink-0',
    // Password temporal (éxito)
    alertSuccess:
      'space-y-3 px-4 py-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800',
    alertSuccessTitle:
      'flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400',
    alertSuccessIcon: 'w-4 h-4',
    alertSuccessText: 'text-xs text-emerald-600 dark:text-emerald-500',
    alertSuccessCode:
      'font-mono text-sm font-bold bg-emerald-100 dark:bg-emerald-900/50 px-3 py-2 rounded-lg text-emerald-800 dark:text-emerald-200 select-all tracking-wider',
    alertSuccessHint: 'text-xs text-emerald-600 dark:text-emerald-500 mt-1',
    // Footer con botones de acción
    footer:
      'flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700',
    cancelButton:
      'px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all',
    submitButton:
      'inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-700 hover:via-purple-700 hover:to-fuchsia-700 rounded-lg shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed',
    submitIcon: 'w-4 h-4',
    // Spinner
    spinner:
      'w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white',
    // Info card (usuario no editable en editar)
    infoCard:
      'flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700',
    infoIcon:
      'w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0',
    infoLabel: 'text-xs font-medium text-gray-500 dark:text-gray-400',
    infoValue: 'text-sm font-semibold text-gray-900 dark:text-white',
  },

  // ── Animaciones ─────────────────────────────────────────────────────────
  animations: {
    header: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4 },
    },
    metricas: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, delay: 0.1 },
    },
    metricaCard: {
      whileHover: { scale: 1.02, y: -4 },
      transition: { type: 'spring', stiffness: 300 },
    },
    filtros: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, delay: 0.15 },
    },
    lista: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3, delay: 0.2 },
    },
    card: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
    button: {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
    },
  },
} as const
