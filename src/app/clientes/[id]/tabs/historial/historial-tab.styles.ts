/**
 * Estilos Centralizados - Historial Tab
 * Separación de responsabilidades: Solo clases de Tailwind
 */

export const historialStyles = {
  // ========== CONTENEDOR PRINCIPAL ==========
  container: {
    root: 'space-y-4 py-4',
  },

  // ========== HEADER CON ESTADÍSTICAS ==========
  header: {
    container: 'px-4',
    wrapper: 'flex items-center justify-between mb-4',
    titleContainer: '',
    title: 'text-lg font-bold text-gray-900 dark:text-white',
    stats: 'text-sm text-gray-600 dark:text-gray-400 mt-0.5',
    clearButton:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
  },

  // ========== BARRA DE BÚSQUEDA ==========
  search: {
    container: 'relative',
    icon: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    input:
      'w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm placeholder:text-gray-400',
  },

  // ========== TIMELINE ==========
  timeline: {
    container: 'space-y-6 px-4',
    grupoContainer: '',

    // Encabezado de fecha
    fechaHeader:
      'sticky top-0 z-10 flex items-center gap-3 py-2 px-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 rounded-lg mb-3',
    fechaIcon: 'w-4 h-4 text-cyan-600 dark:text-cyan-400',
    fechaTitulo: 'text-sm font-bold text-gray-900 dark:text-white',
    fechaContador:
      'ml-auto text-xs font-medium text-gray-500 dark:text-gray-400',

    // Contenedor de eventos
    eventosContainer: 'relative pl-8 space-y-3',
    lineaVertical:
      'absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-200 via-cyan-300 to-transparent dark:from-cyan-800 dark:via-cyan-700',
  },

  // ========== EVENTO CARD ==========
  eventoCard: {
    wrapper: 'relative',

    // Punto del timeline
    punto:
      'absolute -left-[26px] top-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg',
    puntoIcon: 'w-4 h-4',

    // Card contenedor
    card: 'group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border p-4 shadow-md hover:shadow-xl transition-all duration-300',
    barraLateral: 'absolute left-0 top-0 bottom-0 w-1',

    // Contenido
    content: 'pl-2',
    contentHeader: 'flex items-start justify-between gap-3 mb-2',
    contentBody: 'flex-1 min-w-0',

    // Título y descripción
    titulo: 'text-sm font-bold text-gray-900 dark:text-white truncate',
    descripcion: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5',

    // Fecha/hora
    fechaContainer:
      'flex flex-col items-end gap-0.5 text-[10px] text-gray-500 dark:text-gray-400',
    fechaLabel: 'flex items-center gap-1',
    fechaLabelIcon: 'w-3 h-3',
    fechaLabelText: 'font-semibold',
    fechaValue: 'text-xs font-mono text-gray-700 dark:text-gray-300',

    // Usuario
    usuarioContainer:
      'flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700',
    usuarioIcon: 'w-3 h-3 text-gray-400 dark:text-gray-500',
    usuarioBody: 'flex-1',
    usuarioLabel:
      'text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase',
    usuarioNombre:
      'text-[10px] font-medium text-gray-700 dark:text-gray-300 mt-0.5',
    usuarioRol: 'text-cyan-600 dark:text-cyan-400 font-semibold',

    // Detalles
    detallesContainer:
      'mt-3 pt-3 border-t border-gray-100 dark:border-gray-700',
  },

  // ========== BOTÓN VER DETALLES ==========
  detallesButton: {
    base: 'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all group',
    icon: 'w-4 h-4 text-cyan-600 dark:text-cyan-400',
    text: 'text-xs font-semibold text-gray-700 dark:text-gray-300',
  },

  // ========== ESTADOS VACÍOS ==========
  empty: {
    container: 'p-6',
    sinResultados: 'px-4 py-8',
  },

  // ========== ANIMACIONES ==========
  animations: {
    fadeIn: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    slideIn: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
    hoverSlide: {
      whileHover: { x: 2 },
      transition: { type: 'tween', duration: 0.2, ease: 'easeOut' },
    },
  },
} as const

/**
 * Colores por tipo de evento
 * Centraliza todos los esquemas de color para diferentes tipos de eventos
 */
export const coloresEvento = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    barraLateral: 'bg-blue-500',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-950',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    barraLateral: 'bg-green-500',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-950',
    icon: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
    barraLateral: 'bg-yellow-500',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-950',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    barraLateral: 'bg-red-500',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-950',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    barraLateral: 'bg-purple-500',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-950',
    icon: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    barraLateral: 'bg-cyan-500',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-950',
    icon: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    barraLateral: 'bg-orange-500',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    barraLateral: 'bg-gray-500',
  },
} as const

export type ColorEvento = keyof typeof coloresEvento
