/**
 * Estilos centralizados — Asignar Vivienda V2
 * Paleta: tema de la app (light/dark) + cyan-500 como acento principal
 * Usa variables CSS del sistema para compatibilidad light/dark automática
 */

export const styles = {
  // ──────────────────────────────
  // PAGE
  // ──────────────────────────────
  page: {
    wrapper: 'min-h-screen bg-background pb-28',
    inner: 'max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8',
    accordionStack: 'space-y-3 mt-6',
  },

  // ──────────────────────────────
  // HEADER
  // ──────────────────────────────
  header: {
    wrapper: 'rounded-xl border border-border bg-card p-4 shadow-sm mb-6',
    iconWrapper:
      'w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0',
    icon: 'w-5 h-5 text-cyan-500',
    breadcrumb: 'flex items-center gap-1.5 text-muted-foreground text-xs mb-2',
    breadcrumbSep: 'text-muted-foreground/30',
    breadcrumbLink: 'hover:text-foreground transition-colors cursor-pointer',
    breadcrumbCurrent: 'text-muted-foreground',
    titleRow: 'flex items-center gap-3',
    h1: 'text-xl font-bold text-foreground',
    subtitle: 'text-muted-foreground text-xs mt-0.5',
    stepBadge:
      'ml-auto shrink-0 bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-xs font-semibold px-2.5 py-1 rounded-full',
  },

  // ──────────────────────────────
  // ACCORDION
  // ──────────────────────────────
  accordion: {
    // Estado: expandido
    active: {
      wrapper:
        'border border-cyan-500/40 bg-card rounded-xl shadow-sm transition-all duration-200',
      header:
        'flex items-center justify-between px-4 py-3.5 cursor-pointer select-none',
      numberWrapper:
        'w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center mr-3 shrink-0',
      number: 'text-white font-bold text-[10px]',
      title: 'text-foreground text-sm font-semibold uppercase tracking-wide',
      chevron: 'w-4 h-4 text-muted-foreground',
      divider: 'border-t border-border mx-4',
      content: 'px-4 pb-5 pt-4',
    },
    // Estado: completado
    completed: {
      wrapper:
        'border border-emerald-500/30 bg-card rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200 shadow-sm',
      header: 'flex items-center gap-3 px-4 py-3.5 select-none',
      checkWrapper:
        'w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0',
      check: 'text-white',
      title: 'text-foreground text-sm font-semibold uppercase tracking-wide',
      summary:
        'ml-auto text-muted-foreground text-xs font-mono truncate max-w-[200px]',
    },
    // Estado: bloqueado
    locked: {
      wrapper:
        'border border-border bg-muted/30 rounded-xl opacity-40 cursor-not-allowed',
      header: 'flex items-center justify-between px-4 py-3.5 select-none',
      numberWrapper:
        'w-6 h-6 rounded-full border border-border flex items-center justify-center mr-3 shrink-0',
      number: 'text-muted-foreground font-bold text-[10px]',
      title:
        'text-muted-foreground text-sm font-semibold uppercase tracking-wide',
      lock: 'w-3.5 h-3.5 text-muted-foreground',
    },
  },

  // ──────────────────────────────
  // FORM / FIELDS
  // ──────────────────────────────
  field: {
    label:
      'block text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5 font-medium',
    labelSr: 'sr-only',
    labelWithIcon:
      'flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5 font-medium',
    labelIcon: 'w-3.5 h-3.5',
    input:
      'w-full bg-background border border-input rounded-lg px-3 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all',
    inputMono:
      'w-full bg-background border border-input rounded-lg px-3 py-2.5 text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all',
    select:
      'w-full bg-background border border-input rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all appearance-none',
    textarea:
      'w-full bg-background border border-input rounded-lg px-3 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all resize-none',
    error: 'text-destructive text-xs flex items-center gap-1 mt-1.5',
    hint: 'text-muted-foreground text-[10px] mt-1',
    prefix:
      'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono pointer-events-none select-none',
    inputWithPrefix: 'pl-6',
    grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
    grid3: 'grid grid-cols-3 gap-2',
    row: 'flex items-center justify-between py-3',
    divider: 'border-t border-border my-4',
  },

  // ──────────────────────────────
  // CLIENT CHIP (readonly)
  // ──────────────────────────────
  clientChip: {
    wrapper:
      'flex items-center gap-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl px-4 py-3',
    iconWrapper:
      'w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0',
    icon: 'w-4 h-4 text-cyan-500',
    label:
      'text-[10px] uppercase tracking-widest text-muted-foreground mb-0 block',
    value: 'text-foreground text-sm font-semibold',
  },

  // ──────────────────────────────
  // VALUE CHIPS (valor base, notariales, etc.)
  // ──────────────────────────────
  valueChip: {
    wrapper: 'bg-background border border-border rounded-lg p-3 flex flex-col gap-1',
    label: 'text-[10px] uppercase tracking-widest text-muted-foreground block',
    value: 'text-foreground text-sm font-mono font-semibold',
    icon: 'w-3.5 h-3.5 text-muted-foreground mb-0.5',
  },

  // ──────────────────────────────
  // TOTAL A CUBRIR
  // ──────────────────────────────
  totalRow: {
    wrapper:
      'flex items-center justify-between bg-cyan-500/5 border border-cyan-500/25 rounded-xl px-4 py-3 mt-3',
    label:
      'flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground font-medium',
    labelIcon: 'w-4 h-4 text-cyan-500',
    value: 'text-xl font-bold font-mono text-cyan-500',
  },

  // ──────────────────────────────
  // SWITCH
  // ──────────────────────────────
  switch: {
    track: (on: boolean) =>
      `relative w-10 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-cyan-500' : 'bg-muted border border-input'} shrink-0`,
    thumb: (on: boolean) =>
      `absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`,
  },

  // ──────────────────────────────
  // DESCUENTO TOGGLE
  // ──────────────────────────────
  discountToggle: {
    wrapper:
      'flex items-center justify-between bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3',
    left: 'flex items-center gap-3',
    iconWrapper:
      'w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center',
    icon: 'w-4 h-4 text-amber-500',
    title: 'text-sm text-foreground font-medium',
    subtitle: 'text-xs text-muted-foreground mt-0.5',
  },

  // ──────────────────────────────
  // SECCIÓN ② — FUENTES
  // ──────────────────────────────
  fuentes: {
    progressWrapper: 'bg-muted/50 border border-border rounded-xl p-3 mb-3',
    progressLabel: 'text-[11px] text-muted-foreground font-mono',
    progressLabelRight: 'text-[11px] text-cyan-500 font-mono font-semibold',
    progressTrack: 'mt-2 h-1.5 bg-muted rounded-full overflow-hidden',
    progressFull: 'h-full bg-emerald-500 rounded-full transition-all duration-500',
    progressPartial: 'h-full bg-cyan-500 rounded-full transition-all duration-500',
    fuenteRow: 'flex items-center gap-3 py-3 border-b border-border last:border-0',
    fuenteIconWrapper: (on: boolean) =>
      `w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${on ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-muted border border-border'}`,
    fuenteIcon: (on: boolean) =>
      `w-4 h-4 transition-colors ${on ? 'text-cyan-500' : 'text-muted-foreground'}`,
    fuenteNombreOff: 'text-muted-foreground text-sm',
    fuenteNombreOn: 'text-foreground text-sm font-semibold',
    fuenteMontoOn: 'ml-auto text-cyan-500 text-sm font-mono font-semibold',
    fuenteContent: 'ml-11 pb-2 pt-1 space-y-3',
    totalesBox: 'bg-background rounded-xl p-4 mt-3 border border-border shadow-sm',
    totalesRow: 'flex items-center justify-between py-1',
    totalesLabel: 'text-muted-foreground text-xs flex items-center gap-1.5',
    totalesLabelIcon: 'w-3.5 h-3.5',
    totalesValue: 'text-foreground text-sm font-mono font-semibold',
    totalesDivider: 'border-t border-border my-2',
    okMsg: 'flex items-center gap-1.5 text-emerald-500 text-xs font-semibold mt-1',
    errMsg: 'flex items-center gap-1.5 text-destructive text-xs font-semibold mt-1',
    okIcon: 'w-3.5 h-3.5',
    errIcon: 'w-3.5 h-3.5',
  },

  // ──────────────────────────────
  // SECCIÓN ③ — REVISIÓN
  // ──────────────────────────────
  revision: {
    infoCard: 'bg-muted/40 border border-border rounded-xl p-4',
    grid: 'grid grid-cols-2 gap-x-4 gap-y-3',
    label: 'text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1',
    labelIcon: 'w-3 h-3',
    value: 'text-foreground text-sm font-medium mt-0.5',
    sep: 'border-t border-border my-3',
    sepDouble: 'border-t-2 border-border my-3',
    financialCard: 'bg-background border border-border rounded-xl p-4 shadow-sm',
    financialRow: 'flex items-center justify-between py-1',
    financialLabel: 'text-muted-foreground text-xs flex items-center gap-1.5',
    financialLabelIcon: 'w-3.5 h-3.5',
    financialValue: 'text-foreground text-sm font-mono',
    totalLabel: 'text-foreground text-sm font-semibold flex items-center gap-1.5',
    totalValue: 'text-lg font-bold font-mono text-cyan-500',
    descuento: 'text-amber-500',
    fuentesCard: 'bg-background border border-border rounded-xl p-4 shadow-sm',
    fuenteRow: 'flex items-center gap-2.5 py-1.5',
    fuenteDot: 'w-2 h-2 rounded-full bg-cyan-500 shrink-0',
    fuenteNombre: 'text-foreground text-sm',
    fuenteMonto: 'ml-auto text-foreground text-sm font-mono font-semibold',
    fuenteEntidad: 'text-muted-foreground text-xs',
    editLink: 'flex items-center gap-1 text-muted-foreground text-xs hover:text-cyan-500 transition-colors mt-1',
    sectionTitle: 'flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2',
    sectionTitleIcon: 'w-3.5 h-3.5',
    actionRow: 'flex items-center gap-3 mt-5',
    submitBtn:
      'flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-white font-bold text-sm py-3 rounded-xl transition-all shadow-sm shadow-cyan-500/20',
    pdfBtn:
      'border border-border text-muted-foreground rounded-xl px-4 py-2.5 text-sm w-full mt-2 opacity-40 cursor-not-allowed',
    errorBanner:
      'flex items-start gap-2.5 bg-destructive/8 border border-destructive/25 text-destructive text-sm p-3.5 rounded-xl mb-3',
    errorIcon: 'w-4 h-4 shrink-0 mt-0.5',
  },

  // ──────────────────────────────
  // STATUS BAR
  // ──────────────────────────────
  statusBar: {
    wrapper:
      'fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border shadow-lg',
    progressTrack: 'h-[3px] bg-muted w-full',
    progressFill: 'h-full bg-cyan-500 transition-all duration-500',
    inner: 'flex items-center justify-between gap-4 px-4 py-3 md:px-6 max-w-2xl mx-auto',
    valueWrapper: 'flex flex-col',
    valueLabel: 'text-[10px] uppercase tracking-widest text-muted-foreground',
    valueAmount: 'text-base font-bold font-mono text-foreground',
    continueBtn:
      'flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-cyan-500/20 shrink-0',
    cancelBtn:
      'text-muted-foreground text-sm hover:text-foreground transition-colors shrink-0',
  },

  // ──────────────────────────────
  // DISCOUNT
  // ──────────────────────────────
  discount: {
    summaryRow:
      'flex items-center gap-2 mt-3 p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-sm',
    original: 'line-through text-muted-foreground font-mono text-xs',
    arrow: 'text-muted-foreground text-xs',
    final: 'text-emerald-500 font-bold font-mono',
    pct: 'ml-auto text-emerald-500 text-xs font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded',
  },

  // ──────────────────────────────
  // MISC
  // ──────────────────────────────
  datoBadge:
    'text-[10px] tracking-widest border border-amber-500/30 text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded uppercase ml-1.5',
  charCounter: 'text-[10px] text-muted-foreground text-right mt-0.5',
  spinner:
    'w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin',
  loadingRow:
    'flex items-center gap-2 py-8 text-muted-foreground text-xs justify-center',
} as const
