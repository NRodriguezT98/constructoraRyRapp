/**
 * ============================================
 * ESTILOS: ProgressSection
 * ============================================
 *
 * Estilos centralizados para la sección de progreso de pago
 * Paleta: Rosa/Púrpura/Índigo (negociaciones)
 * Diseño: Compact, Glassmorphism
 */

import { DollarSign } from 'lucide-react'

// ============================================
// CONFIGURACIÓN DE VALORES
// ============================================

export const VALORES_CONFIG = {
  valorBase: {
    icon: DollarSign,
    label: 'Valor Base',
    bg: 'bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-xl',
    labelColor: 'text-gray-600 dark:text-gray-400',
    valueColor: 'text-gray-900 dark:text-white',
  },
  descuento: {
    icon: DollarSign,
    label: 'Descuento',
    bg: 'bg-orange-50/80 dark:bg-orange-900/30 backdrop-blur-xl',
    labelColor: 'text-orange-600 dark:text-orange-400',
    valueColor: 'text-orange-700 dark:text-orange-300',
  },
  valorFinal: {
    icon: DollarSign,
    label: 'Valor Final',
    bg: 'bg-emerald-50/80 dark:bg-emerald-900/30 backdrop-blur-xl',
    labelColor: 'text-emerald-600 dark:text-emerald-400',
    valueColor: 'text-emerald-700 dark:text-emerald-300',
  },
  totalAbonado: {
    icon: DollarSign,
    label: 'Total Abonado',
    bg: 'bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-xl',
    labelColor: 'text-indigo-600 dark:text-indigo-400',
    valueColor: 'text-indigo-700 dark:text-indigo-300',
  },
} as const

// ============================================
// ESTILOS DE COMPONENTE
// ============================================

export const progressSectionStyles = {
  // Container principal (compact, glassmorphism, gradiente)
  container: 'backdrop-blur-xl bg-gradient-to-br from-pink-50/80 via-purple-50/80 to-indigo-50/80 dark:from-gray-800/80 dark:via-gray-800/80 dark:to-gray-800/80 rounded-xl p-3 border-2 border-purple-100 dark:border-gray-700 shadow-lg',

  // Header
  header: {
    container: 'flex items-center justify-between mb-3',
    title: 'text-base font-bold text-gray-900 dark:text-white flex items-center gap-2',
    titleIcon: 'w-4 h-4 text-purple-600 dark:text-purple-400',
  },

  // Grid de valores (compact)
  valores: {
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-2 mb-3',
    card: 'rounded-lg p-2 shadow-sm',
    label: 'flex items-center gap-1 text-[10px] mb-0.5',
    labelIcon: 'w-3 h-3',
    value: 'text-base font-bold',
  },

  // Barras de progreso
  progreso: {
    container: 'mb-3',
    header: 'flex items-center justify-between mb-1.5',
    label: 'text-xs font-medium text-gray-700 dark:text-gray-300',
    porcentaje: 'text-xs font-bold',
    barraContainer: 'h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner',
    barra: 'h-full transition-all duration-500 ease-out rounded-full',
    barraAbonos: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    barraFuentes: 'bg-gradient-to-r from-pink-500 to-rose-500',
    porcentajeAbonos: 'text-indigo-600 dark:text-indigo-400',
    porcentajeFuentes: 'text-pink-600 dark:text-pink-400',
  },

  // Saldo pendiente
  saldo: {
    container: 'mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-600',
    row: 'flex items-center justify-between',
    label: 'text-xs font-medium text-gray-600 dark:text-gray-400',
    value: 'text-lg font-bold text-gray-900 dark:text-white',
  },
}

// ============================================
// ANIMACIONES
// ============================================

export const progressAnimations = {
  barra: {
    initial: { width: 0 },
    animate: (width: number) => ({ width: `${width}%` }),
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}
