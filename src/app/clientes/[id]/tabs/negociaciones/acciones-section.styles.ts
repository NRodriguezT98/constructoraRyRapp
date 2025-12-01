/**
 * ============================================
 * ESTILOS: AccionesSection
 * ============================================
 *
 * Estilos centralizados para la sección de acciones de negociación
 * Paleta: Rojo Corporativo RyR + Emerald/Rose (actualizado 2025-11-28)
 * Diseño: Compact, Glassmorphism
 */

import { DollarSign, FileText, XCircle } from 'lucide-react'

// ============================================
// CONFIGURACIÓN DE ACCIONES
// ============================================

export const ACCIONES_CONFIG = {
  registrarAbono: {
    icon: DollarSign,
    label: 'Registrar Abono',
    gradient: 'from-emerald-600 to-teal-600',
    hoverGradient: 'hover:from-emerald-700 hover:to-teal-700',
    bgDisabled: 'bg-gray-200 dark:bg-gray-700',
    textDisabled: 'text-gray-500 dark:text-gray-400',
  },
  renunciar: {
    icon: XCircle,
    label: 'Renunciar',
    gradient: 'from-rose-600 to-pink-600',
    hoverGradient: 'hover:from-rose-700 hover:to-pink-700',
    bgDisabled: 'bg-gray-200 dark:bg-gray-700',
    textDisabled: 'text-gray-500 dark:text-gray-400',
  },
  generarPDF: {
    icon: FileText,
    label: 'Generar Reporte',
    gradient: 'from-red-600 to-rose-700',
    hoverGradient: 'hover:from-red-700 hover:to-rose-800',
    bgDisabled: 'bg-gray-200 dark:bg-gray-700',
    textDisabled: 'text-gray-500 dark:text-gray-400',
  },
} as const

// ============================================
// ESTILOS DE COMPONENTE
// ============================================

export const accionesSectionStyles = {
  // Container principal
  container: 'sticky top-20 z-20 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl p-2.5 border border-gray-200 dark:border-gray-700 shadow-lg',

  // Header
  header: {
    container: 'mb-2',
    title: 'text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2',
    titleIcon: 'w-3.5 h-3.5 text-orange-600 dark:text-orange-400',
    subtitle: 'text-xs text-gray-500 dark:text-gray-400 mt-0.5',
  },

  // Toolbar horizontal (3 botones en fila)
  toolbar: 'flex flex-wrap items-center gap-2',

  // Botones
  button: {
    base: 'flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap',
    enabled: 'bg-gradient-to-r text-white',
    disabled: 'cursor-not-allowed',
    icon: 'w-4 h-4',
  },

  // Advertencia (compact)
  warning: {
    container: 'mt-2 p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg',
    text: 'text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5',
    icon: 'w-3.5 h-3.5 flex-shrink-0',
  },
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Construir className de botón según estado
 */
export function getBotonClassName(
  accionKey: keyof typeof ACCIONES_CONFIG,
  disabled: boolean
): string {
  const config = ACCIONES_CONFIG[accionKey]

  if (disabled) {
    return `${accionesSectionStyles.button.base} ${accionesSectionStyles.button.disabled} ${config.bgDisabled} ${config.textDisabled}`
  }

  return `${accionesSectionStyles.button.base} ${accionesSectionStyles.button.enabled} ${config.gradient} ${config.hoverGradient}`
}
