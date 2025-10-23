/**
 * 🎨 ESTILOS DEL MÓDULO DE PROCESOS
 *
 * Estilos centralizados con diseño glassmorphism y gradientes blue→indigo.
 * Identidad visual: Azul para admin/configuración.
 */

// ===================================
// CONTAINER PRINCIPAL
// ===================================

export const procesosStyles = {
  container: {
    page: 'min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
  },

  // ===================================
  // HEADER HERO
  // ===================================

  header: {
    container: 'relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 mb-8 shadow-xl',
    pattern: 'absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]',

    topRow: 'flex items-center justify-between mb-6 relative z-10',

    iconCircle: 'w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg',
    icon: 'w-7 h-7 text-white',

    badge: 'px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl text-white text-sm font-medium',

    title: 'text-4xl font-bold text-white mb-3 relative z-10',
    subtitle: 'text-blue-100 text-lg relative z-10 max-w-2xl'
  },

  // ===================================
  // FAB (Floating Action Button)
  // ===================================

  fab: {
    container: 'fixed bottom-6 right-6 z-50',
    button: 'group relative px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-3',
    buttonGlow: 'absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-400 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300',
    icon: 'w-5 h-5 relative z-10',
    text: 'font-semibold relative z-10'
  },

  // ===================================
  // GRID DE PLANTILLAS
  // ===================================

  grid: {
    container: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',

    // Card de plantilla
    card: {
      container: 'group relative rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer',
      glow: 'absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 via-indigo-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:via-indigo-400/20 group-hover:to-purple-400/20 transition-all duration-300',

      header: 'flex items-start justify-between mb-4 relative z-10',

      iconCircle: 'w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg',
      icon: 'w-6 h-6 text-white',

      actions: 'flex items-center gap-2',
      actionButton: 'p-2 rounded-lg hover:bg-gray-100 transition-colors',
      actionIcon: 'w-4 h-4 text-gray-600 hover:text-gray-900',

      content: 'relative z-10',
      title: 'text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors',
      description: 'text-sm text-gray-600 mb-4 line-clamp-2',

      badges: 'flex flex-wrap items-center gap-2 mb-4',
      badgePredeterminado: 'px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold shadow-lg',
      badgeActivo: 'px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium',
      badgeInactivo: 'px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium',

      stats: 'grid grid-cols-2 gap-4 pt-4 border-t border-gray-200',
      stat: {
        container: 'flex items-center gap-2',
        icon: 'w-4 h-4 text-gray-400',
        label: 'text-xs text-gray-500',
        value: 'text-sm font-semibold text-gray-900'
      },

      footer: 'flex items-center justify-between mt-4 pt-4 border-t border-gray-200 relative z-10',
      footerText: 'text-xs text-gray-500',
      footerButton: 'text-xs font-medium text-blue-600 hover:text-blue-700'
    }
  },

  // ===================================
  // EDITOR DE PLANTILLA
  // ===================================

  editor: {
    container: 'max-w-6xl mx-auto',

    // Sidebar izquierdo con form
    sidebar: {
      container: 'lg:col-span-1 space-y-6',

      card: 'rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/50 p-6 shadow-lg',

      section: 'space-y-4',
      sectionTitle: 'text-sm font-semibold text-gray-900 mb-3',

      input: {
        label: 'block text-sm font-medium text-gray-700 mb-2',
        field: 'w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
        textarea: 'w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none',
        checkbox: 'w-4 h-4 text-blue-600 rounded focus:ring-blue-500',
        checkboxLabel: 'ml-2 text-sm text-gray-700'
      },

      buttons: {
        primary: 'w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all',
        secondary: 'w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all',
        danger: 'w-full px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all'
      }
    },

    // Área principal con lista de pasos
    main: {
      container: 'lg:col-span-2',

      header: 'flex items-center justify-between mb-6',
      title: 'text-2xl font-bold text-gray-900',

      addButton: 'px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all flex items-center gap-2',
      addIcon: 'w-5 h-5',

      pasosList: 'space-y-4',

      empty: {
        container: 'rounded-2xl bg-white/60 backdrop-blur-xl border-2 border-dashed border-gray-300 p-12 text-center',
        icon: 'w-16 h-16 mx-auto text-gray-400 mb-4',
        title: 'text-lg font-semibold text-gray-900 mb-2',
        description: 'text-gray-600'
      }
    }
  },

  // ===================================
  // CARD DE PASO
  // ===================================

  pasoCard: {
    container: 'group relative rounded-xl bg-white/80 backdrop-blur-xl border border-gray-200/50 p-5 hover:shadow-lg transition-all duration-300',
    glow: 'absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/0 to-indigo-400/0 group-hover:from-blue-400/10 group-hover:to-indigo-400/10 transition-all duration-300',

    header: 'flex items-start gap-4 mb-4 relative z-10',

    dragHandle: 'flex-shrink-0 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors',
    dragIcon: 'w-4 h-4 text-gray-400',

    orden: 'flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md',

    content: 'flex-1 min-w-0',
    title: 'font-semibold text-gray-900 mb-1',
    description: 'text-sm text-gray-600 line-clamp-2',

    actions: 'flex-shrink-0 flex items-center gap-1',
    actionButton: 'p-2 rounded-lg hover:bg-gray-100 transition-colors',
    actionIcon: 'w-4 h-4 text-gray-600 hover:text-gray-900',

    badges: 'flex flex-wrap items-center gap-2 mb-3 relative z-10',
    badgeObligatorio: 'px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium',
    badgeOpcional: 'px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium',
    badgeCondicional: 'px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium',

    footer: 'flex items-center gap-4 text-xs text-gray-500 relative z-10',
    footerItem: 'flex items-center gap-1',
    footerIcon: 'w-3.5 h-3.5'
  },

  // ===================================
  // MODAL DE PASO
  // ===================================

  modal: {
    overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4',

    container: 'relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl',

    header: 'sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between',
    headerTitle: 'text-xl font-bold text-white',
    closeButton: 'p-2 rounded-lg hover:bg-white/20 transition-colors',
    closeIcon: 'w-5 h-5 text-white',

    body: 'p-6 space-y-6',

    section: 'space-y-4',
    sectionTitle: 'text-sm font-semibold text-gray-900 uppercase tracking-wide',

    input: {
      label: 'block text-sm font-medium text-gray-700 mb-2',
      field: 'w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
      textarea: 'w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none',
      select: 'w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
      checkbox: 'w-4 h-4 text-blue-600 rounded focus:ring-blue-500',
      checkboxLabel: 'ml-2 text-sm text-gray-700'
    },

    documentos: {
      list: 'space-y-3',
      item: 'flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200',
      itemIcon: 'w-5 h-5 text-gray-400',
      itemContent: 'flex-1',
      itemTitle: 'text-sm font-medium text-gray-900',
      itemBadge: 'text-xs text-gray-500',
      itemRemove: 'p-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors',
      itemRemoveIcon: 'w-4 h-4',

      addButton: 'w-full px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-medium hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2'
    },

    footer: 'sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3',
    footerButton: {
      cancel: 'px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all',
      save: 'px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all'
    }
  },

  // ===================================
  // ESTADOS DE CARGA Y VACÍOS
  // ===================================

  loading: {
    container: 'flex items-center justify-center min-h-[400px]',
    spinner: 'w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin'
  },

  empty: {
    container: 'flex flex-col items-center justify-center min-h-[400px] p-12',
    icon: 'w-20 h-20 text-gray-300 mb-4',
    title: 'text-2xl font-bold text-gray-900 mb-2',
    description: 'text-gray-600 text-center max-w-md mb-6',
    button: 'px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all'
  },

  error: {
    container: 'rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3',
    icon: 'w-5 h-5 text-red-600 flex-shrink-0 mt-0.5',
    content: 'flex-1',
    title: 'text-sm font-semibold text-red-900 mb-1',
    message: 'text-sm text-red-700',
    close: 'p-1 rounded-lg hover:bg-red-100 transition-colors',
    closeIcon: 'w-4 h-4 text-red-600'
  },

  // ===================================
  // PREVIEW DE TIMELINE
  // ===================================

  timeline: {
    container: 'rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/50 p-6 shadow-lg',
    title: 'text-lg font-bold text-gray-900 mb-6',

    list: 'relative space-y-6',
    line: 'absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-indigo-400 to-purple-400',

    item: {
      container: 'relative flex gap-4',
      dot: 'relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg',
      content: 'flex-1 pb-2',
      title: 'font-semibold text-gray-900 mb-1',
      description: 'text-sm text-gray-600',
      badges: 'flex flex-wrap items-center gap-2 mt-2'
    }
  }
}
