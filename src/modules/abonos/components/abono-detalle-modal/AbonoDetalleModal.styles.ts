export const abonoDetalleStyles = {
  // Overlay — sin backdrop-blur: es el mayor causante de lag al scrollear
  // (obliga al GPU a re-renderizar toda la app en cada frame de scroll)
  overlay: 'fixed inset-0 z-[9999] bg-black/70',

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
      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20',
    title: 'truncate text-lg font-bold text-white drop-shadow-sm',
    subtitle: 'truncate text-sm text-emerald-100',
    subtitleAnulado: 'truncate text-sm text-red-100',
    badgeAnulado:
      'inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white',
    actions: 'flex flex-shrink-0 items-center gap-2',
    btn: 'inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/30',
    btnDanger:
      'inline-flex items-center gap-1.5 rounded-xl border border-red-300/40 bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-red-600/90',
    btnClose:
      'flex h-8 w-8 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-white transition-all hover:bg-white/30',
  },

  // ─── Layout split ─────────────────────────────────────────────────────────
  // Mobile: flex-col (comprobante arriba, sidebar abajo)
  // Desktop: flex-row (comprobante izquierda, sidebar derecha fija w-80)
  body: 'flex flex-1 overflow-hidden flex-col md:flex-row',

  // Panel izquierdo: comprobante — lightbox fill
  preview: {
    // Position reference para absolute children
    container:
      'relative flex-1 min-h-[45vh] md:min-h-0 overflow-hidden bg-gray-950',
    // Spinner de URL (mientras se obtiene la URL del backend)
    urlLoading:
      'absolute inset-0 flex flex-col items-center justify-center gap-3',
    urlSpinner:
      'h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-emerald-400',
    // PDF: ocupa todo el panel
    iframe: 'absolute inset-0 w-full h-full border-0',
    // Imagen: absolute inset-4 para padding visual
    imgWrapper: 'absolute inset-4',
    // Spinner de imagen (mientras el browser renderiza)
    imgLoading:
      'absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950',
    imgSpinner:
      'h-8 w-8 animate-spin rounded-full border-[3px] border-gray-700 border-t-emerald-400',
    imgSpinnerLabel: 'text-xs text-gray-500 animate-pulse',
    // Error de imagen
    imgError:
      'absolute inset-0 flex flex-col items-center justify-center gap-2',
    imgErrorText: 'text-xs text-gray-500',
    // Placeholder sin comprobante
    placeholder:
      'absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6',
    placeholderIcon:
      'flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800',
    placeholderTitle: 'text-base font-semibold text-gray-400',
    placeholderSub: 'text-xs text-gray-500 max-w-xs',
    // Deprecated — kept for compat
    loading: 'flex flex-col items-center gap-3',
    spinner:
      'h-10 w-10 animate-spin rounded-full border-4 border-emerald-800 border-t-emerald-400',
    inner: 'absolute inset-0',
    img: '',
  },

  // Panel derecho: información
  sidebar: {
    container:
      'w-full md:w-80 flex-shrink-0 overflow-y-auto will-change-scroll border-t border-gray-200 md:border-t-0 md:border-l dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5',
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
