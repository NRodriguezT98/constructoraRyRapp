export const abonoDetalleStyles = {
  // Overlay
  overlay: 'fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm',

  // Contenedor del modal (fullscreen split)
  modal:
    'fixed inset-0 z-[10000] flex flex-col overflow-hidden bg-white dark:bg-gray-900 shadow-2xl',

  // ─── Header ──────────────────────────────────────────────────────────────
  header: {
    container:
      'flex items-center justify-between gap-4 border-b border-emerald-700/30 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-6 py-4',
    left: 'flex min-w-0 flex-1 items-center gap-3',
    iconWrap:
      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm',
    title: 'truncate text-lg font-bold text-white drop-shadow-sm',
    subtitle: 'truncate text-sm text-emerald-100',
    actions: 'flex flex-shrink-0 items-center gap-2',
    btn: 'inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25',
    btnDanger:
      'inline-flex items-center gap-1.5 rounded-xl border border-red-300/40 bg-red-500/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-red-600/80',
    btnClose:
      'flex h-8 w-8 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25',
  },

  // ─── Layout split ─────────────────────────────────────────────────────────
  body: 'flex flex-1 overflow-hidden',

  // Panel izquierdo: comprobante
  preview: {
    container:
      'flex flex-1 flex-col overflow-hidden bg-gray-100 dark:bg-gray-800',
    inner:
      'flex flex-1 min-h-0 items-start justify-center overflow-y-auto overflow-x-hidden p-6',
    iframe:
      'h-full w-full min-h-[600px] rounded-xl border border-gray-300 dark:border-gray-600 shadow-lg',
    img: 'max-w-md w-full mx-auto rounded-xl object-contain shadow-lg',
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
      'w-80 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 p-5 space-y-5',
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
    divider: 'border-t border-gray-100 dark:border-gray-800',
  },

  // ─── Confirm Anular overlay ───────────────────────────────────────────────
  confirmAnular: {
    overlay:
      'absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm',
    card: 'mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800',
    icon: 'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30',
    title: 'mb-1 text-center text-base font-bold text-gray-900 dark:text-white',
    subtitle: 'mb-5 text-center text-sm text-gray-500 dark:text-gray-400',
    error:
      'mb-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-300',
    actions: 'flex gap-3',
    btnCancel:
      'flex-1 rounded-xl border border-gray-200 dark:border-gray-600 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
    btnConfirm:
      'flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60',
  },
} as const
