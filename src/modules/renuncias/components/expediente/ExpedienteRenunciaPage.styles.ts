/**
 * 🎨 ESTILOS CENTRALIZADOS - EXPEDIENTE DE RENUNCIA
 * Color: Rojo/Rosa/Pink (hereda del módulo renuncias)
 */

export const expedienteStyles = {
  // 🎯 PÁGINA
  page: {
    container:
      'min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-rose-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    content: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4',
    backLink:
      'inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors mb-2',
  },

  // 🎨 HERO
  hero: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800 p-6 shadow-2xl shadow-red-500/20',
    pattern:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10 space-y-4',
    topRow: 'flex flex-wrap items-center justify-between gap-3',
    consecutivoBadge:
      'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold tracking-wide',
    estadoBadge: {
      pendiente:
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/90 text-yellow-900 text-xs font-bold shadow-lg',
      cerrada:
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/90 text-emerald-900 text-xs font-bold shadow-lg',
    },
    clienteNombre: 'text-2xl font-bold text-white',
    clienteInfo:
      'flex flex-wrap items-center gap-3 text-red-100 dark:text-red-200 text-sm',
    clienteInfoItem: 'inline-flex items-center gap-1.5',
    viviendaRow: 'flex items-center gap-2 text-white/90 text-sm',
    duracion:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium',
  },

  // 📋 DETAIL CARDS (Motivo + Formulario + Duración)
  detailCards: {
    cardLabel:
      'text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2',
    motivoCard:
      'rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg',
    motivoText: 'text-sm text-gray-700 dark:text-gray-300 leading-relaxed',
    formularioCard:
      'rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg flex flex-col',
    duracionCard:
      'rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg',
    uploadButton:
      'w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all disabled:opacity-50',
  },

  // ⏱️ TIMELINE
  timeline: {
    container:
      'relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-lg',
    title: 'text-sm font-bold text-gray-700 dark:text-gray-300 mb-4',
    track: 'flex items-start overflow-x-auto pb-2',
    hito: 'flex flex-col items-center text-center min-w-[100px] relative',
    hitoIconCircle:
      'w-10 h-10 rounded-full flex items-center justify-center shadow-md mb-2',
    hitoIconActive: 'bg-gradient-to-br from-red-500 to-rose-600 text-white',
    hitoIconPending: 'bg-gray-200 dark:bg-gray-700 text-gray-400',
    hitoIcon: 'w-4 h-4',
    hitoLabel:
      'text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight',
    hitoFecha: 'text-[10px] text-gray-500 dark:text-gray-400 mt-0.5',
    connector:
      'absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 bg-gradient-to-r from-red-300 to-rose-300 dark:from-red-700 dark:to-rose-700',
  },

  // � SNAPSHOT BANNER
  snapshotBanner: {
    container:
      'flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 backdrop-blur-sm',
    iconCircle:
      'flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center',
    icon: 'w-4 h-4 text-amber-600 dark:text-amber-400',
    text: 'text-xs text-amber-800 dark:text-amber-300 leading-relaxed',
    textBold: 'font-bold text-amber-900 dark:text-amber-200',
  },

  // �📑 TABS
  tabs: {
    container:
      'flex items-center gap-1 overflow-x-auto rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-1.5 shadow-lg',
    tab: 'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
    tabActive: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md',
    tabInactive:
      'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200',
    tabIcon: 'w-4 h-4',
    content:
      'rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-lg',
  },

  // 🏠 TAB VIVIENDA
  vivienda: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    field: 'space-y-1',
    fieldLabel:
      'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
    fieldValue: 'text-sm font-bold text-gray-900 dark:text-white',
    fieldValueMuted: 'text-sm text-gray-600 dark:text-gray-300',
  },

  // 💰 TAB FINANCIERO
  financiero: {
    metricsGrid: 'grid grid-cols-2 lg:grid-cols-4 gap-3',
    metricCard: 'rounded-xl p-4 text-center',
    metricValue: 'text-xl font-bold',
    metricLabel: 'text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium',
    descuentoCard:
      'rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4',
    retencionCard:
      'rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 p-4',
    devolucionCard:
      'rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 p-5',
    devolucionMonto:
      'text-3xl font-black text-emerald-700 dark:text-emerald-400',
    docLink:
      'inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline',
    sectionTitle:
      'text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2',
  },

  // 🏦 TAB FUENTES
  fuentes: {
    list: 'space-y-3',
    card: 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 p-4',
    cardHeader: 'flex items-center justify-between mb-3',
    tipoBadge:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold',
    estadoBadge:
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
    progressBar:
      'w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden',
    progressFill:
      'h-full rounded-full bg-gradient-to-r from-red-500 to-rose-500 transition-all',
    montoRow: 'flex items-center justify-between text-sm',
    montoLabel: 'text-gray-500 dark:text-gray-400',
    montoValue: 'font-bold text-gray-900 dark:text-white',
  },

  // 📋 TAB ABONOS
  abonos: {
    table: 'w-full text-sm',
    thead: 'border-b border-gray-200 dark:border-gray-700',
    th: 'text-left py-2.5 px-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
    tbody: 'divide-y divide-gray-100 dark:divide-gray-800',
    tr: 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
    td: 'py-3 px-3 text-gray-700 dark:text-gray-300',
    tdBold: 'py-3 px-3 font-bold text-gray-900 dark:text-white',
    badgeActivo:
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    badgeAnulado:
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    comprobante:
      'inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline text-xs',
    resumen:
      'mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-4',
    resumenGrid: 'grid grid-cols-2 sm:grid-cols-4 gap-3',
    resumenItem: 'text-center',
    resumenValue: 'text-lg font-bold text-gray-900 dark:text-white',
    resumenLabel: 'text-xs text-gray-500 dark:text-gray-400',
    mobileCard:
      'sm:hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 p-3 space-y-2',
    mobileRow: 'flex items-center justify-between',
  },

  // 🔒 TAB AUDITORÍA
  auditoria: {
    section: 'space-y-4',
    sectionTitle:
      'text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2',
    card: 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 p-4 space-y-3',
    row: 'flex items-start gap-3',
    rowIcon:
      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
    rowContent: 'flex-1 min-w-0',
    rowLabel: 'text-xs font-semibold text-gray-500 dark:text-gray-400',
    rowValue: 'text-sm font-bold text-gray-900 dark:text-white',
    rowValueMuted: 'text-sm text-gray-600 dark:text-gray-300',
    cascadeList: 'space-y-2',
    cascadeItem:
      'flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/30',
    cascadeIcon:
      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
    cascadeText: 'text-sm text-gray-700 dark:text-gray-300',
  },

  // ⏳ LOADING
  loading: {
    container: 'space-y-4',
    heroSkeleton: 'h-56 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse',
    timelineSkeleton:
      'h-24 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse',
    tabsSkeleton: 'h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse',
    contentSkeleton:
      'h-64 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse',
  },

  // ❌ ERROR
  error: {
    container: 'flex flex-col items-center justify-center py-20 text-center',
    iconCircle:
      'w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4',
    icon: 'w-8 h-8 text-red-500',
    title: 'text-xl font-bold text-gray-900 dark:text-white mb-2',
    message: 'text-sm text-gray-500 dark:text-gray-400 mb-6',
    backButton:
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-medium hover:from-red-700 hover:to-rose-700 transition-all shadow-lg',
  },
} as const
