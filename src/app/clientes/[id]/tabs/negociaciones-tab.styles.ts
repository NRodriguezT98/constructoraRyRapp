/**
 * ============================================
 * ESTILOS CENTRALIZADOS: Negociaciones Tab
 * ============================================
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 * Todos los estilos y configuraciones visuales del módulo de negociaciones.
 *
 * PALETA: Rojo Corporativo RyR (#C41E3A) ⭐ ACTUALIZADO 2025-11-28
 * DISEÑO: Compact, Glassmorphism, Premium, Tabla Horizontal
 */

import {
    Building2,
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react'

// ============================================
// ESTADOS CONFIG (con colores módulo clientes)
// ============================================

export const ESTADOS_CONFIG = {
  'Activa': {
    color: 'emerald',
    icon: CheckCircle2,
    bg: 'bg-emerald-100 dark:bg-emerald-900/30 backdrop-blur-xl',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    shadow: 'shadow-emerald-500/20',
    gradient: 'from-emerald-500 to-teal-600',
  },
  'Suspendida': {
    color: 'amber',
    icon: Clock,
    bg: 'bg-amber-100 dark:bg-amber-900/30 backdrop-blur-xl',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    shadow: 'shadow-amber-500/20',
    gradient: 'from-amber-500 to-orange-600',
  },
  'Cerrada por Renuncia': {
    color: 'gray',
    icon: XCircle,
    bg: 'bg-gray-100 dark:bg-gray-900/30 backdrop-blur-xl',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-800',
    shadow: 'shadow-gray-500/20',
    gradient: 'from-gray-500 to-slate-600',
  },
  'Completada': {
    color: 'red',
    icon: Building2,
    bg: 'bg-red-100 dark:bg-red-900/30 backdrop-blur-xl',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    shadow: 'shadow-red-500/20',
    gradient: 'from-red-600 to-rose-700',
  },
} as const

// ============================================
// ESTILOS DE LAYOUT (compacto + tabla)
// ============================================

export const negociacionesTabStyles = {
  // Container principal
  container: {
    base: 'space-y-3',
    detalle: 'space-y-3', // Más compacto
  },

  // Header
  header: {
    container: 'flex items-center justify-between mb-3',
    title: 'text-base font-semibold text-gray-900 dark:text-white',
    subtitle: 'text-xs text-gray-600 dark:text-gray-400',
    detalleTitle: 'text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2', // Más pequeño
    detalleIcon: 'w-5 h-5 text-red-600 dark:text-red-400', // Rojo corporativo RyR
    detalleInfo: 'flex items-center gap-2 mt-0.5',
  },

  // Botones (paleta clientes: cyan/azul)
  buttons: {
    // Botón principal (Crear Negociación) - Rojo RyR
    primary: 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white hover:from-red-700 hover:via-rose-700 hover:to-pink-700 shadow-lg hover:shadow-xl',

    // Botón secundario (Ver Detalle) - Rojo RyR
    secondary: 'inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:from-red-700 hover:to-rose-800 hover:shadow-lg',

    // Botón outline (Volver)
    outline: 'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors',

    // Botón info (Historial) - Rojo RyR
    info: 'inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg',

    // Botón disabled
    disabled: 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed',

    // FAB (Floating Action Button)
    fab: 'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-cyan-500/50 transition-shadow',
  },

  // Cards de negociación (tabla horizontal compacta)
  card: {
    container: 'group relative overflow-hidden rounded-lg border backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 p-2.5 shadow-md transition-all hover:shadow-xl hover:border-cyan-300 dark:hover:border-cyan-700',
    statusIndicator: 'absolute left-0 top-0 h-full w-1', // Barra de color izquierda
    content: 'flex items-center gap-3 w-full', // Layout horizontal
    iconContainer: 'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
    icon: 'h-4.5 w-4.5',
    info: 'flex-1 min-w-0', // Info principal (flexible)
    title: 'text-sm font-bold text-gray-900 dark:text-white truncate',
    subtitle: 'flex items-center gap-1.5 mt-0.5',
    subtitleIcon: 'h-3 w-3 text-gray-500',
    subtitleText: 'text-xs text-gray-600 dark:text-gray-400',
    valores: 'flex items-center gap-2 shrink-0', // Valores inline
    valorItem: 'flex items-center gap-1',
    valorLabel: 'text-[10px] text-gray-500 dark:text-gray-400',
    valorText: 'text-sm font-semibold text-gray-900 dark:text-white',
    badge: 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0',
    badgeIcon: 'h-3 w-3',
    actions: 'flex items-center gap-1.5 shrink-0', // Acciones a la derecha
  },

  // Grid de valores (inline horizontal)
  valores: {
    container: 'flex items-center gap-3', // Horizontal en lugar de grid
    item: 'flex items-center gap-2',
    iconWrapper: 'flex h-7 w-7 items-center justify-center rounded-md',
    iconWrapperBase: 'bg-gray-100 dark:bg-gray-700',
    iconWrapperDescuento: 'bg-orange-100 dark:bg-orange-900/30',
    iconWrapperFinal: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: 'h-3.5 w-3.5',
    iconBase: 'text-gray-600 dark:text-gray-300',
    iconDescuento: 'text-orange-600 dark:text-orange-400',
    iconFinal: 'text-emerald-600 dark:text-emerald-400',
    label: 'text-[10px] text-gray-500 dark:text-gray-400',
    value: 'text-sm font-bold',
    valueBase: 'text-gray-900 dark:text-white',
    valueDescuento: 'text-orange-700 dark:text-orange-300',
    valueFinal: 'text-emerald-700 dark:text-emerald-300',
  },

  // Footer con fecha y acciones (más compacto)
  footer: {
    container: 'flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2',
    fecha: 'flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400',
    fechaIcon: 'h-3 w-3',
    progress: 'flex items-center gap-2 flex-1 max-w-xs', // Barra de progreso
    progressBar: 'flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
    progressFill: 'h-full transition-all duration-300',
    progressText: 'text-[10px] font-semibold',
    acciones: 'flex items-center gap-1.5',
  },

  // Empty state (mantener colores neutros)
  empty: {
    container: 'rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50',
    icon: 'mx-auto mb-4 h-16 w-16 text-gray-400',
    title: 'mb-2 text-lg font-semibold text-gray-900 dark:text-white',
    description: 'text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto',
  },

  // Detalle - Vista completa (Dashboard)
  detalle: {
    // Header
    info: 'flex items-center gap-2 mt-1',
    infoIcon: 'w-4 h-4 text-gray-500',
    infoText: 'text-sm text-gray-600 dark:text-gray-400',
    separator: 'mx-2 text-gray-400',
    estadoBadge: 'px-2.5 py-1 rounded-full text-xs font-semibold',

    // Progress bar prominente
    progressSection: 'mt-4 p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-800',
    progressHeader: 'flex items-center justify-between mb-2',
    progressLabel: 'text-sm font-semibold text-cyan-900 dark:text-cyan-100',
    progressValue: 'text-2xl font-bold text-cyan-600 dark:text-cyan-400',
    progressBar: 'h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
    progressFill: 'h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500',
    progressInfo: 'flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400',

    // Métricas dashboard (4 cards horizontales)
    metricsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4',
    metricCard: 'relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border p-4 shadow-md transition-all hover:shadow-lg',
    metricCardBase: 'border-gray-200 dark:border-gray-700',
    metricCardDescuento: 'border-orange-200 dark:border-orange-800',
    metricCardPagado: 'border-emerald-200 dark:border-emerald-800',
    metricCardPendiente: 'border-blue-200 dark:border-blue-800',
    metricIcon: 'flex h-10 w-10 items-center justify-center rounded-lg mb-2',
    metricIconBase: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    metricIconDescuento: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    metricIconPagado: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    metricIconPendiente: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    metricValue: 'text-2xl font-bold',
    metricValueBase: 'text-gray-900 dark:text-white',
    metricValueDescuento: 'text-orange-700 dark:text-orange-300',
    metricValuePagado: 'text-emerald-700 dark:text-emerald-300',
    metricValuePendiente: 'text-blue-700 dark:text-blue-300',
    metricLabel: 'text-xs text-gray-600 dark:text-gray-400 mt-1',

    // Secciones de contenido
    section: 'mt-4 p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700',
    sectionTitle: 'text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2',
    sectionTitleIcon: 'w-5 h-5 text-cyan-600 dark:text-cyan-400',

    // Alertas/Notificaciones
    alert: 'mt-4 p-3 rounded-lg border-l-4 flex items-start gap-3',
    alertWarning: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500',
    alertDanger: 'bg-red-50 dark:bg-red-950/30 border-red-500',
    alertInfo: 'bg-blue-50 dark:bg-blue-950/30 border-blue-500',
    alertIcon: 'w-5 h-5 shrink-0 mt-0.5',
    alertIconWarning: 'text-yellow-600 dark:text-yellow-400',
    alertIconDanger: 'text-red-600 dark:text-red-400',
    alertIconInfo: 'text-blue-600 dark:text-blue-400',
    alertContent: 'flex-1',
    alertTitle: 'text-sm font-semibold mb-0.5',
    alertTitleWarning: 'text-yellow-900 dark:text-yellow-100',
    alertTitleDanger: 'text-red-900 dark:text-red-100',
    alertTitleInfo: 'text-blue-900 dark:text-blue-100',
    alertText: 'text-xs',
    alertTextWarning: 'text-yellow-700 dark:text-yellow-300',
    alertTextDanger: 'text-red-700 dark:text-red-300',
    alertTextInfo: 'text-blue-700 dark:text-blue-300',
  },
}

// ============================================
// ANIMACIONES (Framer Motion)
// ============================================

export const negociacionesAnimations = {
  // Card hover
  cardHover: {
    scale: 1.02,
    y: -4,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },

  // FAB
  fab: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: 'spring', stiffness: 260, damping: 20 },
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 },
  },

  // Badge pulse (estado activo)
  badgePulse: {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 2 },
  },
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtener configuración de estado
 */
export function getEstadoConfig(estado: string) {
  return ESTADOS_CONFIG[estado as keyof typeof ESTADOS_CONFIG] || ESTADOS_CONFIG['Activa']
}

/**
 * Construir className de badge según estado
 */
export function getBadgeClassName(estado: string) {
  const config = getEstadoConfig(estado)
  return `${negociacionesTabStyles.card.badge} ${config.bg} ${config.text}`
}

/**
 * Construir className de card según estado
 */
export function getCardClassName(estado: string) {
  const config = getEstadoConfig(estado)
  return `${negociacionesTabStyles.card.container} ${config.border} ${config.shadow}`
}
