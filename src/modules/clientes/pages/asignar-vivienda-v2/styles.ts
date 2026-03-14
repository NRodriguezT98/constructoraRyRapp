/**
 * Estilos centralizados — Asignar Vivienda V2
 * Paleta: tema de la app (light/dark) + cyan-500 como único acento
 * Usa variables CSS del sistema: bg-background, text-foreground, border, muted, etc.
 */

export const styles = {
  // ──────────────────────────────
  // PAGE
  // ──────────────────────────────
  page: {
    wrapper: 'min-h-screen bg-background pb-24',
    inner: 'max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8',
    accordionStack: 'space-y-2 mt-6',
  },

  // ──────────────────────────────
  // HEADER
  // ──────────────────────────────
  header: {
    breadcrumb: 'flex items-center gap-1.5 text-muted-foreground text-xs mb-4',
    breadcrumbSep: 'text-border',
    breadcrumbLink: 'hover:text-foreground transition-colors cursor-pointer',
    breadcrumbCurrent: 'text-muted-foreground',
    titleRow: 'flex items-start justify-between',
    h1: 'text-2xl font-bold text-foreground',
    subtitle: 'text-muted-foreground text-sm mt-0.5',
    stepBadge:
      'bg-muted border border-border text-cyan-500 text-xs font-mono px-2 py-0.5 rounded-full',
    divider: 'border-b border-border mt-4',
  },

  // ──────────────────────────────
  // ACCORDION
  // ──────────────────────────────
  accordion: {
    // Estado: expandido
    active: {
      wrapper:
        'border-l-2 border-cyan-500 bg-card rounded-r-lg transition-colors duration-200',
      header:
        'flex items-center justify-between px-4 py-3 cursor-pointer select-none',
      number: 'text-cyan-500 font-mono text-xs mr-2 shrink-0',
      title: 'text-foreground text-sm font-semibold uppercase tracking-wider',
      chevron: 'w-4 h-4 text-muted-foreground',
      divider: 'border-t border-border mx-4',
      content: 'px-4 pb-4 pt-3',
    },
    // Estado: completado
    completed: {
      wrapper:
        'border-l-2 border-emerald-500 bg-card rounded-r-lg hover:bg-muted cursor-pointer transition-colors duration-200',
      header: 'flex items-center gap-2 px-4 py-3 select-none',
      check: 'text-emerald-500 shrink-0',
      number: 'text-emerald-500 font-mono text-xs mr-1 shrink-0',
      title: 'text-foreground text-sm font-semibold uppercase tracking-wider',
      summary: 'text-muted-foreground text-xs font-mono mt-0.5 pl-5 truncate',
    },
    // Estado: bloqueado
    locked: {
      wrapper:
        'border-l-2 border-border bg-card/60 rounded-r-lg opacity-50 cursor-not-allowed',
      header: 'flex items-center justify-between px-4 py-3 select-none',
      number: 'text-muted-foreground font-mono text-xs mr-2 shrink-0',
      title:
        'text-muted-foreground text-sm font-semibold uppercase tracking-wider',
      lock: 'w-3.5 h-3.5 text-muted-foreground',
    },
  },

  // ──────────────────────────────
  // FORM / FIELDS
  // ──────────────────────────────
  field: {
    label:
      'block text-[11px] uppercase tracking-widest text-muted-foreground mb-1',
    labelSr: 'sr-only',
    input:
      'w-full bg-muted border border-input rounded-lg px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-colors',
    inputMono:
      'w-full bg-muted border border-input rounded-lg px-3 py-2 text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-colors',
    select:
      'w-full bg-muted border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-colors appearance-none',
    textarea:
      'w-full bg-muted border border-input rounded-lg px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-colors resize-none',
    error: 'text-destructive text-xs flex items-center gap-1 mt-1',
    hint: 'text-muted-foreground text-[10px] mt-1',
    prefix:
      'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono pointer-events-none',
    inputWithPrefix: 'pl-6',
    grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
    grid3: 'grid grid-cols-3 gap-2',
    row: 'flex items-center justify-between py-3',
    divider: 'border-t border-border my-3',
  },

  // ──────────────────────────────
  // CLIENT CHIP (readonly)
  // ──────────────────────────────
  clientChip: {
    wrapper: 'bg-muted border border-border rounded-lg px-3 py-2',
    label:
      'text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5 block',
    value: 'text-foreground text-sm font-medium',
  },

  // ──────────────────────────────
  // VALUE CHIPS (valor base, notariales, etc.)
  // ──────────────────────────────
  valueChip: {
    wrapper: 'bg-muted border border-border rounded-md p-2',
    label:
      'text-[11px] uppercase tracking-widest text-muted-foreground mb-1 block',
    value: 'text-foreground text-sm font-mono',
  },

  // ──────────────────────────────
  // TOTAL A CUBRIR
  // ──────────────────────────────
  totalRow: {
    wrapper:
      'flex items-center justify-between border-t border-border pt-3 mt-3',
    label: 'text-[11px] uppercase tracking-widest text-muted-foreground',
    value: 'text-xl font-bold font-mono text-cyan-500',
  },

  // ──────────────────────────────
  // SWITCH
  // ──────────────────────────────
  switch: {
    track: (on: boolean) =>
      `relative w-10 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-cyan-500' : 'bg-muted border border-input'} shrink-0`,
    thumb: (on: boolean) =>
      `absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`,
  },

  // ──────────────────────────────
  // SECCIÓN ② — FUENTES
  // ──────────────────────────────
  fuentes: {
    progressLabel: 'text-[11px] text-muted-foreground font-mono',
    progressLabelRight: 'text-[11px] text-cyan-500 font-mono',
    progressTrack: 'mt-1.5 h-1 bg-muted rounded-full overflow-hidden',
    progressFull:
      'h-full bg-emerald-500 rounded-full transition-all duration-300',
    progressPartial:
      'h-full bg-cyan-500 rounded-full transition-all duration-300',
    fuenteRow:
      'flex items-center gap-3 py-2.5 border-b border-border last:border-0',
    fuenteNombreOff: 'text-muted-foreground text-sm',
    fuenteNombreOn: 'text-foreground text-sm font-medium',
    fuenteMontoOn: 'ml-auto text-cyan-500 text-sm font-mono',
    fuenteContent: 'pl-7 pt-2 pb-1 space-y-2.5',
    totalesBox: 'bg-muted/50 rounded-lg p-3 mt-3 border border-border',
    totalesRow: 'flex items-center justify-between py-0.5',
    totalesLabel: 'text-muted-foreground text-xs',
    totalesValue: 'text-foreground text-sm font-mono',
    totalesDivider: 'border-t border-border my-2',
    okMsg: 'text-emerald-500 text-xs font-medium mt-1',
    errMsg: 'text-destructive text-xs font-medium mt-1',
  },

  // ──────────────────────────────
  // SECCIÓN ③ — REVISIÓN
  // ──────────────────────────────
  revision: {
    grid: 'grid grid-cols-2 gap-2',
    label: 'text-[11px] uppercase tracking-widest text-muted-foreground',
    value: 'text-foreground text-sm',
    sep: 'border-t border-border my-3',
    sepDouble: 'border-t-2 border-border my-3',
    totalLabel:
      'text-[11px] uppercase tracking-widest text-muted-foreground font-semibold',
    totalValue: 'text-xl font-bold font-mono text-cyan-500',
    descuento: 'text-amber-500',
    fuenteDot: 'w-2 h-2 rounded-full bg-cyan-500 shrink-0',
    fuenteNombre: 'text-foreground text-sm',
    fuenteMonto: 'ml-auto text-foreground text-sm font-mono',
    fuenteEntidad: 'text-muted-foreground text-xs',
    editLink:
      'text-muted-foreground text-xs hover:text-cyan-500 transition-colors underline-offset-2 hover:underline',
    actionRow: 'flex items-center gap-3 mt-4',
    submitBtn:
      'flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm py-2.5 rounded-lg transition-colors',
    pdfBtn:
      'border border-border text-muted-foreground rounded-lg px-4 py-2.5 text-sm w-full mt-2 opacity-50 cursor-not-allowed',
    errorBanner:
      'bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded-lg mb-3',
  },

  // ──────────────────────────────
  // STATUS BAR
  // ──────────────────────────────
  statusBar: {
    wrapper:
      'fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border',
    progressTrack: 'h-[3px] bg-muted w-full',
    progressFill: 'h-full bg-cyan-500 transition-all duration-300',
    inner:
      'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 md:px-6 max-w-2xl mx-auto',
    text: 'text-sm text-muted-foreground font-mono',
    continueBtn:
      'bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm px-5 py-2 rounded-lg transition-colors shrink-0',
    cancelBtn:
      'text-muted-foreground text-sm hover:text-foreground transition-colors shrink-0',
  },

  // ──────────────────────────────
  // DISCOUNT
  // ──────────────────────────────
  discount: {
    summaryRow: 'flex items-center gap-2 mt-2 text-sm',
    original: 'line-through text-muted-foreground font-mono',
    arrow: 'text-muted-foreground',
    final: 'text-emerald-500 font-bold font-mono',
    pct: 'text-muted-foreground text-xs',
  },

  // ──────────────────────────────
  // MISC
  // ──────────────────────────────
  datoBadge:
    'text-[10px] tracking-widest border border-border text-muted-foreground px-1.5 py-0.5 rounded uppercase ml-1',
  charCounter: 'text-[10px] text-muted-foreground text-right mt-0.5',
  spinner:
    'w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin',
  loadingRow: 'flex items-center gap-2 py-4 text-muted-foreground text-xs',
} as const
