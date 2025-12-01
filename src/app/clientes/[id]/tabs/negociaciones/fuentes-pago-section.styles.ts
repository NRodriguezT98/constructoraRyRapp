/**
 * ============================================
 * ESTILOS: FuentesPagoSection
 * ============================================
 *
 * Estilos centralizados para la sección de fuentes de pago
 * Paleta: Rosa/Púrpura/Índigo (negociaciones)
 * Diseño: Compact, Glassmorphism
 */

import { CreditCard, DollarSign, Wallet } from 'lucide-react'

// ============================================
// CONFIGURACIÓN DE TIPOS DE FUENTE
// ============================================

export const TIPOS_CONFIG = {
  'Cuota Inicial': {
    icon: Wallet,
    bg: 'bg-emerald-100/80 dark:bg-emerald-900/30 backdrop-blur-xl',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-700',
    gradient: 'from-emerald-500 to-teal-600',
  },
  'Crédito Bancario': {
    icon: CreditCard,
    bg: 'bg-indigo-100/80 dark:bg-indigo-900/30 backdrop-blur-xl',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-700',
    gradient: 'from-indigo-500 to-purple-600',
  },
  'Subsidio': {
    icon: DollarSign,
    bg: 'bg-pink-100/80 dark:bg-pink-900/30 backdrop-blur-xl',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-700',
    gradient: 'from-pink-500 to-rose-600',
  },
  'Otros': {
    icon: Wallet,
    bg: 'bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-xl',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-600',
    gradient: 'from-gray-500 to-slate-600',
  },
} as const

// ============================================
// ESTILOS DE COMPONENTE
// ============================================

export const fuentesPagoSectionStyles = {
  // Container principal (compact, glassmorphism)
  container: 'backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-lg',

  // Header
  header: {
    container: 'flex items-center justify-between mb-3',
    left: 'flex-1',
    title: 'text-base font-bold text-gray-900 dark:text-white flex items-center gap-2',
    titleIcon: 'w-4 h-4 text-purple-600 dark:text-purple-400',
    subtitle: 'text-xs text-gray-500 dark:text-gray-400 mt-0.5',
    buttonEditar: 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-xs font-medium shadow-sm hover:shadow-md',
    buttonEditarEnabled: 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700',
    buttonEditarDisabled: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    buttonEditarIcon: 'w-3.5 h-3.5',
  },

  // Grid de fuentes (compact)
  grid: 'grid grid-cols-1 md:grid-cols-2 gap-2',

  // Card de fuente
  card: {
    container: 'border-2 rounded-lg p-2.5 transition-all hover:shadow-md',
    content: 'flex items-start gap-2',
    iconContainer: 'p-1.5 rounded-lg',
    icon: 'w-4 h-4',
    info: 'flex-1 min-w-0',
    titulo: 'text-xs font-semibold mb-0.5',
    monto: 'text-lg font-bold text-gray-900 dark:text-white mb-1',
    progressContainer: 'flex items-center gap-1.5 mb-1.5',
    progressBar: 'flex-1 h-1.5 bg-white dark:bg-gray-600 rounded-full overflow-hidden',
    progressFill: 'h-full transition-all',
    progressPorcentaje: 'text-[10px] font-medium text-gray-600 dark:text-gray-400',
    entidad: 'mb-1',
    entidadText: 'text-xs font-medium text-gray-700 dark:text-gray-300',
    referencia: 'mb-1',
    referenciaText: 'text-[10px] text-gray-600 dark:text-gray-400',
    detalles: 'text-[10px] text-gray-600 dark:text-gray-400 mt-1.5',
    badgeCompletada: 'mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-semibold',
    badgeIcon: 'w-3 h-3',
  },

  // Empty state
  empty: {
    container: 'text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg',
    icon: 'w-10 h-10 text-gray-400 mx-auto mb-2',
    text: 'text-xs text-gray-600 dark:text-gray-400 mb-2.5',
    button: 'inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-lg hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 transition-colors text-xs font-medium',
    buttonIcon: 'w-3.5 h-3.5',
  },

  // Total
  total: {
    container: 'mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700',
    row: 'flex items-center justify-between',
    label: 'text-xs font-medium text-gray-600 dark:text-gray-400',
    value: 'text-base font-bold text-gray-900 dark:text-white',
  },
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtener configuración de tipo de fuente
 */
export function getTipoConfig(tipo: string) {
  return TIPOS_CONFIG[tipo as keyof typeof TIPOS_CONFIG] || TIPOS_CONFIG['Otros']
}
