/**
 * Estilos centralizados para ModalRegistrarAbono y sus sub-componentes
 */

export interface ColorScheme {
  gradient: string
}

export const colorSchemes: Record<string, ColorScheme> = {
  'Cuota Inicial': { gradient: 'from-emerald-600 to-teal-600' },
  'Crédito Hipotecario': { gradient: 'from-blue-600 to-indigo-600' },
  Subsidio: { gradient: 'from-purple-600 to-violet-600' },
  'Mi Casa Ya': { gradient: 'from-orange-600 to-amber-600' },
  'Ahorro Previo': { gradient: 'from-cyan-600 to-sky-600' },
  'Recursos Propios': { gradient: 'from-green-600 to-emerald-600' },
  Leasing: { gradient: 'from-pink-600 to-rose-600' },
}

export const modalStyles = {
  form: {
    container: 'p-4 space-y-4',
    label:
      'flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5',
    labelIcon: 'w-3.5 h-3.5',
    required: 'text-red-500',
    input:
      'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all dark:text-white placeholder:text-gray-400',
    textarea:
      'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all resize-none dark:text-white placeholder:text-gray-400',
    errorAlert:
      'flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    errorAlertIcon:
      'w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5',
    errorAlertText: 'text-sm text-red-700 dark:text-red-300',
  },
  footer: {
    container:
      'flex items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-800',
    button:
      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
    cancelButton:
      'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    cancelIcon: 'w-4 h-4',
    submitButton:
      'text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed',
    submitIcon: 'w-4 h-4',
  },
} as const
