export const abonoDetalleStyles = {
  // Overlay
  overlay: 'fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm',

  // Contenedor del modal
  // Mobile: full-screen (sin margen, sin rounded — el PDF necesita todo el espacio)
  // Desktop: inset-6 con rounded-2xl — muestra el backdrop alrededor (patrón modal moderno)
  modal:
    'fixed inset-0 md:inset-6 z-[10000] flex flex-col overflow-hidden bg-white dark:bg-gray-900 shadow-2xl md:rounded-2xl',

  // ─── Header ──────────────────────────────────────────────────────────────
  header: {
    container:
      'flex items-center justify-between gap-4 border-b border-emerald-700/30 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-6 py-4',
    containerAnulado:
      'flex items-center justify-between gap-4 border-b border-red-700/30 bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-6 py-4',
    left: 'flex min-w-0 flex-1 items-center gap-3',
    iconWrap:
      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm',
    title: 'truncate text-lg font-bold text-white drop-shadow-sm',
    subtitle: 'truncate text-sm text-emerald-100',
    subtitleAnulado: 'truncate text-sm text-red-100',
    badgeAnulado:
      'inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white',
    actions: 'flex flex-shrink-0 items-center gap-2',
    btn: 'inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25',
    btnDanger:
      'inline-flex items-center gap-1.5 rounded-xl border border-red-300/40 bg-red-500/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-red-600/80',
    btnClose:
      'flex h-8 w-8 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25',
  },

  // ─── Layout split ─────────────────────────────────────────────────────────
  // Mobile: flex-col (comprobante arriba, sidebar abajo)
  // Desktop: flex-row (comprobante izquierda, sidebar derecha fija w-80)
  body: 'flex flex-1 overflow-hidden flex-col md:flex-row',

  // Panel izquierdo: comprobante
  preview: {
    container:
      'flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-800 flex-1 min-h-[40vh] md:min-h-0',
    inner:
      'flex flex-1 min-h-0 items-start justify-center overflow-y-auto overflow-x-hidden p-6',
    iframe:
      'h-full w-full min-h-[600px] rounded-xl border border-gray-300 dark:border-gray-600 shadow-lg',
    // Fix #2: altura explícita para que NextImage fill funcione correctamente
    img: 'max-w-md w-full mx-auto rounded-xl shadow-lg h-[420px] md:h-[600px]',
    placeholder: 'flex flex-col items-center gap-3 text-center',
    placeholderIcon:
      'flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-200 dark:bg-gray-700',
    placeholderTitle:
      'text-base font-semibold text-gray-500 dark:text-gray-400',
    placeholderSub: 'text-xs text-gray-400 dark:text-gray-500',
    loading: 'flex flex-col items-center gap-3',
    spinner:
      'h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500',
  },

  // Panel derecho: información
  sidebar: {
    container:
      'w-full md:w-80 flex-shrink-0 overflow-y-auto border-t border-gray-200 md:border-t-0 md:border-l dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5',
    section: 'space-y-3',
    sectionTitle:
      'flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500',
    row: 'flex items-start gap-2 border-b border-gray-100 dark:border-gray-800 pb-2.5',
    rowIcon: 'mt-0.5 flex-shrink-0',
    rowLabel:
      'text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500',
    rowValue: 'text-sm font-semibold text-gray-900 dark:text-white',
    rowValueSub: 'text-xs text-gray-500 dark:text-gray-400',
    monto:
      'text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums',
    badge:
      'inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    // Pill para fuente de pago (consistente con timeline)
    fuentePill:
      'inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    divider: 'border-t border-gray-100 dark:border-gray-800',
  },
} as const
