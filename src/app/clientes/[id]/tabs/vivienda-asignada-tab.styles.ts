/**
 * ============================================
 * ESTILOS CENTRALIZADOS: Vivienda Asignada Tab
 * ============================================
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 * Todos los estilos y configuraciones visuales del tab de Vivienda Asignada.
 *
 * PALETA: Cyan/Azul (módulo clientes)
 * DISEÑO: Compact, Glassmorphism, Premium
 */

import {
    Building2,
    CheckCircle2,
    Clock,
    XCircle,
} from 'lucide-react'

// ============================================
// ESTADOS CONFIG
// ============================================

export const ESTADOS_CONFIG = {
  Activa: {
    color: 'emerald',
    icon: CheckCircle2,
    bg: 'bg-emerald-100 dark:bg-emerald-900/30 backdrop-blur-xl',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    shadow: 'shadow-emerald-500/20',
    gradient: 'from-emerald-500 to-teal-600',
  },
  Suspendida: {
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
  Completada: {
    color: 'cyan',
    icon: Building2,
    bg: 'bg-cyan-100 dark:bg-cyan-900/30 backdrop-blur-xl',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
    shadow: 'shadow-cyan-500/20',
    gradient: 'from-cyan-600 to-blue-700',
  },
} as const

// ============================================
// ESTILOS DE LAYOUT
// ============================================

export const viviendaAsignadaTabStyles = {
  container: {
    base: 'space-y-3',
    detalle: 'space-y-3',
  },

  header: {
    container: 'flex items-center justify-between mb-3',
    title: 'text-base font-semibold text-gray-900 dark:text-white',
    detalleTitle: 'text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2',
    detalleIcon: 'w-5 h-5 text-cyan-600 dark:text-cyan-400',
  },

  buttons: {
    outline:
      'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors',
    info: 'p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-900/30 transition-colors',
    secondary: 'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors',
  },

  empty: {
    // Container principal con glassmorphism
    container:
      'rounded-xl backdrop-blur-xl bg-gradient-to-br from-white/90 via-gray-50/90 to-cyan-50/90 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-cyan-950/50 border border-gray-200/50 dark:border-gray-700/50 p-5 text-center shadow-xl space-y-4',

    // Icono con gradiente y animación
    iconWrapper:
      'mx-auto mb-3 w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30',
    icon: 'w-8 h-8 text-white',

    // Títulos
    title: 'text-xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900 dark:from-white dark:via-gray-100 dark:to-cyan-100 bg-clip-text text-transparent',
    description: 'text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed',

    // Checklist container
    checklistContainer:
      'mt-4 rounded-xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/50 p-3 text-left shadow-lg',
    checklistHeader:
      'flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 pb-2 border-b border-gray-200 dark:border-gray-700',
    checklistItems: 'space-y-2',
    checklistItem: 'flex items-start gap-3',

    // Iconos de checklist
    checklistIconSuccess: 'w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5',
    checklistIconPending: 'w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5',

    // Textos de checklist
    checklistTextSuccess: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    checklistTextPending: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    checklistSubtext: 'text-xs text-gray-500 dark:text-gray-400 mt-1',

    // Call to Action
    ctaContainer:
      'mt-4 rounded-xl bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-indigo-950/30 border border-cyan-200/50 dark:border-cyan-800/50 p-3 backdrop-blur-sm',
    ctaInfo: 'flex items-start gap-4 text-left',
    ctaIcon: 'w-6 h-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1 animate-bounce',
    ctaTitle: 'text-sm font-bold text-cyan-900 dark:text-cyan-100 mb-1',
    ctaDescription: 'text-xs text-cyan-700 dark:text-cyan-300 leading-relaxed',

    // Footer
    footerInfo: 'flex items-start gap-3 text-left mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
    footerText: 'text-xs text-gray-500 dark:text-gray-400 leading-relaxed',
  },

  detalle: {
    info: 'flex items-center gap-2 mt-1',
    infoIcon: 'w-4 h-4 text-gray-500',
    infoText: 'text-sm text-gray-600 dark:text-gray-400',
    separator: 'mx-2 text-gray-400',
    estadoBadge: 'px-2.5 py-1 rounded-full text-xs font-semibold',
  },

  // Card styles para NegociacionCardCompact
  card: {
    statusIndicator: 'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
    content: 'flex items-center gap-3 p-3 pl-4',
    iconContainer: 'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
    icon: 'w-5 h-5',
    info: 'flex-1 min-w-0',
    title: 'text-sm font-semibold text-gray-900 dark:text-white truncate',
    subtitle: 'flex items-center gap-1 mt-0.5 text-xs text-gray-600 dark:text-gray-400',
    subtitleIcon: 'w-3 h-3 flex-shrink-0',
    subtitleText: 'truncate',
    valores: 'flex items-center gap-3 text-xs',
    valorItem: 'flex flex-col',
    valorLabel: 'text-gray-500 dark:text-gray-400 font-medium',
    valorText: 'font-bold text-gray-900 dark:text-white',
    badgeIcon: 'w-4 h-4',
    actions: 'flex items-center gap-2',
  },

  // Footer styles
  footer: {
    fecha: 'flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs',
    fechaIcon: 'w-3.5 h-3.5 text-gray-500 dark:text-gray-400',
  },
}

// ============================================
// ANIMACIONES
// ============================================

export const viviendaAsignadaAnimations = {
  cardHover: {
    scale: 1.02,
    y: -4,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
}

// ============================================
// UTILIDADES
// ============================================

export function getEstadoConfig(estado: string) {
  return ESTADOS_CONFIG[estado as keyof typeof ESTADOS_CONFIG] || ESTADOS_CONFIG['Activa']
}

export function getBadgeClassName(estado: string) {
  const config = getEstadoConfig(estado)
  return `${config.bg} ${config.text} ${config.border}`
}

export function getCardClassName(estado: string) {
  const config = getEstadoConfig(estado)
  return `rounded-xl border ${config.border} ${config.bg} backdrop-blur-xl shadow-lg ${config.shadow} transition-all hover:shadow-2xl`
}

// Alias para compatibilidad con imports existentes
export const negociacionesTabStyles = viviendaAsignadaTabStyles
export const negociacionesAnimations = viviendaAsignadaAnimations
