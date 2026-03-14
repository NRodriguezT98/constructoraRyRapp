/**
 * Estilos centralizados — Asignar Vivienda V2
 * Paleta: zinc (base) + cyan-400 (único acento)
 * Sin glassmorphism, sin gradientes, sin sombras XXL
 */

export const styles = {
  // ──────────────────────────────
  // PAGE
  // ──────────────────────────────
  page: {
    wrapper: 'min-h-screen bg-zinc-950 pb-24',
    inner: 'max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8',
    accordionStack: 'space-y-2 mt-6',
  },

  // ──────────────────────────────
  // HEADER
  // ──────────────────────────────
  header: {
    breadcrumb: 'flex items-center gap-1.5 text-zinc-500 text-xs mb-4',
    breadcrumbSep: 'text-zinc-700',
    breadcrumbLink: 'hover:text-zinc-300 transition-colors cursor-pointer',
    breadcrumbCurrent: 'text-zinc-400',
    titleRow: 'flex items-start justify-between',
    h1: 'text-2xl font-bold text-zinc-100',
    subtitle: 'text-zinc-400 text-sm mt-0.5',
    stepBadge:
      'bg-zinc-800 border border-zinc-700 text-cyan-400 text-xs font-mono px-2 py-0.5 rounded-full',
    divider: 'border-b border-zinc-700 mt-4',
  },

  // ──────────────────────────────
  // ACCORDION
  // ──────────────────────────────
  accordion: {
    // Estado: expandido
    active: {
      wrapper:
        'border-l-2 border-cyan-400 bg-zinc-900 rounded-r-lg transition-colors duration-200',
      header:
        'flex items-center justify-between px-4 py-3 cursor-pointer select-none',
      number: 'text-cyan-400 font-mono text-xs mr-2 shrink-0',
      title: 'text-zinc-100 text-sm font-semibold uppercase tracking-wider',
      chevron: 'w-4 h-4 text-zinc-400',
      divider: 'border-t border-zinc-800 mx-4',
      content: 'px-4 pb-4 pt-3',
    },
    // Estado: completado
    completed: {
      wrapper:
        'border-l-2 border-emerald-400 bg-zinc-900 rounded-r-lg hover:bg-zinc-800 cursor-pointer transition-colors duration-200',
      header: 'flex items-center gap-2 px-4 py-3 select-none',
      check: 'text-emerald-400 shrink-0',
      number: 'text-emerald-400 font-mono text-xs mr-1 shrink-0',
      title: 'text-zinc-100 text-sm font-semibold uppercase tracking-wider',
      summary: 'text-zinc-400 text-xs font-mono mt-0.5 pl-5 truncate',
    },
    // Estado: bloqueado
    locked: {
      wrapper:
        'border-l-2 border-zinc-700 bg-zinc-900/60 rounded-r-lg opacity-50 cursor-not-allowed',
      header: 'flex items-center justify-between px-4 py-3 select-none',
      number: 'text-zinc-500 font-mono text-xs mr-2 shrink-0',
      title: 'text-zinc-500 text-sm font-semibold uppercase tracking-wider',
      lock: 'w-3.5 h-3.5 text-zinc-600',
    },
  },

  // ──────────────────────────────
  // FORM / FIELDS
  // ──────────────────────────────
  field: {
    label: 'block text-[11px] uppercase tracking-widest text-zinc-400 mb-1',
    labelSr: 'sr-only',
    input:
      'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-colors',
    inputMono:
      'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-colors',
    select:
      'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-colors appearance-none',
    textarea:
      'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-colors resize-none',
    error: 'text-rose-400 text-xs flex items-center gap-1 mt-1',
    hint: 'text-zinc-500 text-[10px] mt-1',
    prefix:
      'absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono pointer-events-none',
    inputWithPrefix: 'pl-6',
    grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
    grid3: 'grid grid-cols-3 gap-2',
    row: 'flex items-center justify-between py-3',
    divider: 'border-t border-zinc-800 my-3',
  },

  // ──────────────────────────────
  // CLIENT CHIP (readonly)
  // ──────────────────────────────
  clientChip: {
    wrapper: 'bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2',
    label: 'text-[11px] uppercase tracking-widest text-zinc-400 mb-0.5 block',
    value: 'text-zinc-100 text-sm font-medium',
  },

  // ──────────────────────────────
  // VALUE CHIPS (valor base, notariales, etc.)
  // ──────────────────────────────
  valueChip: {
    wrapper: 'bg-zinc-800 border border-zinc-700 rounded-md p-2',
    label: 'text-[11px] uppercase tracking-widest text-zinc-500 mb-1 block',
    value: 'text-zinc-100 text-sm font-mono',
  },

  // ──────────────────────────────
  // TOTAL A CUBRIR
  // ──────────────────────────────
  totalRow: {
    wrapper:
      'flex items-center justify-between border-t border-zinc-700 pt-3 mt-3',
    label: 'text-[11px] uppercase tracking-widest text-zinc-400',
    value: 'text-xl font-bold font-mono text-cyan-400',
  },

  // ──────────────────────────────
  // SWITCH
  // ──────────────────────────────
  switch: {
    track: (on: boolean) =>
      `relative w-10 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-cyan-400' : 'bg-zinc-700'} shrink-0`,
    thumb: (on: boolean) =>
      `absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`,
  },

  // ──────────────────────────────
  // SECCIÓN ② — FUENTES
  // ──────────────────────────────
  fuentes: {
    progressLabel: 'text-[11px] text-zinc-400 font-mono',
    progressLabelRight: 'text-[11px] text-cyan-400 font-mono',
    progressTrack: 'mt-1.5 h-1 bg-zinc-800 rounded-full overflow-hidden',
    progressFull:
      'h-full bg-emerald-400 rounded-full transition-all duration-300',
    progressPartial:
      'h-full bg-cyan-400 rounded-full transition-all duration-300',
    fuenteRow:
      'flex items-center gap-3 py-2.5 border-b border-zinc-800 last:border-0',
    fuenteNombreOff: 'text-zinc-400 text-sm',
    fuenteNombreOn: 'text-zinc-100 text-sm font-medium',
    fuenteMontoOn: 'ml-auto text-cyan-400 text-sm font-mono',
    fuenteContent: 'pl-7 pt-2 pb-1 space-y-2.5',
    totalesBox: 'bg-zinc-800/50 rounded-lg p-3 mt-3 border border-zinc-700/50',
    totalesRow: 'flex items-center justify-between py-0.5',
    totalesLabel: 'text-zinc-400 text-xs',
    totalesValue: 'text-zinc-100 text-sm font-mono',
    totalesDivider: 'border-t border-zinc-700 my-2',
    okMsg: 'text-emerald-400 text-xs font-medium mt-1',
    errMsg: 'text-rose-400 text-xs font-medium mt-1',
  },

  // ──────────────────────────────
  // SECCIÓN ③ — REVISIÓN
  // ──────────────────────────────
  revision: {
    grid: 'grid grid-cols-2 gap-2',
    label: 'text-[11px] uppercase tracking-widest text-zinc-500',
    value: 'text-zinc-100 text-sm',
    sep: 'border-t border-zinc-800 my-3',
    sepDouble: 'border-t-2 border-zinc-600 my-3',
    totalLabel:
      'text-[11px] uppercase tracking-widest text-zinc-400 font-semibold',
    totalValue: 'text-xl font-bold font-mono text-cyan-400',
    descuento: 'text-amber-400',
    fuenteDot: 'w-2 h-2 rounded-full bg-cyan-400 shrink-0',
    fuenteNombre: 'text-zinc-100 text-sm',
    fuenteMonto: 'ml-auto text-zinc-100 text-sm font-mono',
    fuenteEntidad: 'text-zinc-500 text-xs',
    editLink:
      'text-zinc-400 text-xs hover:text-cyan-400 transition-colors underline-offset-2 hover:underline',
    actionRow: 'flex items-center gap-3 mt-4',
    submitBtn:
      'flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm py-2.5 rounded-lg transition-colors',
    pdfBtn:
      'border border-zinc-600 text-zinc-400 rounded-lg px-4 py-2.5 text-sm w-full mt-2 opacity-50 cursor-not-allowed',
    errorBanner:
      'bg-rose-950/50 border border-rose-800 text-rose-300 text-sm p-3 rounded-lg mb-3',
  },

  // ──────────────────────────────
  // STATUS BAR
  // ──────────────────────────────
  statusBar: {
    wrapper:
      'fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800',
    progressTrack: 'h-[3px] bg-zinc-800 w-full',
    progressFill: 'h-full bg-cyan-400 transition-all duration-300',
    inner:
      'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 md:px-6 max-w-2xl mx-auto',
    text: 'text-sm text-zinc-400 font-mono',
    continueBtn:
      'bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm px-5 py-2 rounded-lg transition-colors shrink-0',
    cancelBtn:
      'text-zinc-500 text-sm hover:text-zinc-300 transition-colors shrink-0',
  },

  // ──────────────────────────────
  // DISCOUNT
  // ──────────────────────────────
  discount: {
    summaryRow: 'flex items-center gap-2 mt-2 text-sm',
    original: 'line-through text-zinc-500 font-mono',
    arrow: 'text-zinc-600',
    final: 'text-emerald-400 font-bold font-mono',
    pct: 'text-zinc-400 text-xs',
  },

  // ──────────────────────────────
  // MISC
  // ──────────────────────────────
  datoBadge:
    'text-[10px] tracking-widest border border-zinc-600 text-zinc-500 px-1.5 py-0.5 rounded uppercase ml-1',
  charCounter: 'text-[10px] text-zinc-500 text-right mt-0.5',
  spinner:
    'w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin',
  loadingRow: 'flex items-center gap-2 py-4 text-zinc-400 text-xs',
} as const
