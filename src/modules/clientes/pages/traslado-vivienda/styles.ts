/**
 * Estilos centralizados — Traslado de Vivienda
 * Extiende los estilos de Asignar Vivienda V2 con claves
 * adicionales usadas en las secciones de traslado.
 */

import { styles as baseStyles } from '@/modules/clientes/pages/asignar-vivienda-v2/styles'

export const styles = {
  ...baseStyles,

  // Atajos de nivel superior para formularios
  label: {
    base: baseStyles.field.label,
    required: 'text-red-500',
  },
  input: {
    base: baseStyles.field.input,
    success:
      'w-full bg-white dark:bg-gray-900/50 border-2 border-emerald-400 dark:border-emerald-600 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all',
  },

  // Alertas (error / warning)
  alert: {
    error:
      'flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl p-3.5',
    warning:
      'flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3.5',
    icon: 'w-4 h-4 shrink-0 mt-0.5',
    content: 'flex-1 min-w-0',
    title: 'text-sm font-semibold',
    message: 'text-xs mt-0.5',
  },
} as const
