/**
 * Estilos centralizados para Modal de Registro de Abonos
 * Soporte completo para dark mode y responsive design
 */

export const modalStyles = {
  // Header con gradiente
  header: {
    container: 'relative overflow-hidden rounded-t-xl p-4 sm:p-6',
    pattern: 'absolute inset-0 opacity-10',
    lightEffect: {
      top: 'absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white rounded-full blur-3xl opacity-20',
      bottom: 'absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white rounded-full blur-3xl opacity-10',
    },
    iconWrapper: 'w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center',
    icon: 'w-5 h-5 sm:w-6 sm:h-6 text-white',
    titleWrapper: 'flex items-center gap-2',
    title: 'text-xl sm:text-2xl font-bold text-white flex items-center gap-2',
    sparkle: 'w-4 h-4 sm:w-5 sm:h-5 text-yellow-300',
    subtitle: 'text-white/80 text-xs sm:text-sm',
    infoCard: 'bg-white/10 backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 mt-3 sm:mt-4',
    infoGrid: 'grid grid-cols-2 gap-2 sm:gap-4 text-sm',
    infoLabel: 'text-white/70 text-xs mb-1',
    infoValue: 'text-white font-bold text-base sm:text-lg',
  },

  // Formulario
  form: {
    container: 'p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto',
    label: 'text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2',
    labelIcon: 'w-4 h-4',
    required: 'text-red-500 dark:text-red-400',

    // Input de monto
    montoWrapper: 'relative',
    montoPrefix: 'absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold text-sm sm:text-base',
    montoInput: 'w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-base sm:text-lg font-semibold border-2 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-all',
    montoInputError: 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-4 focus:ring-red-500/20',
    montoInputValid: 'border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-500/20',

    // Desembolso completo
    desembolsoCard: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg sm:rounded-xl p-3 sm:p-4',
    desembolsoHeader: 'flex items-center gap-2 sm:gap-3 mb-2',
    desembolsoIconWrapper: 'w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br flex items-center justify-center',
    desembolsoIcon: 'w-4 h-4 sm:w-5 sm:h-5 text-white',
    desembolsoTitle: 'text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300',
    desembolsoSubtitle: 'text-xs text-gray-500 dark:text-gray-400',
    desembolsoMonto: 'text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white',

    // Inputs generales
    input: 'w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-500/20 transition-all text-sm sm:text-base',

    // Textarea
    textarea: 'w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-500/20 resize-none transition-all text-sm sm:text-base',

    // Preview de nuevo saldo
    preview: 'p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl',
    previewContent: 'flex items-center justify-between text-xs sm:text-sm',
    previewLabel: 'text-green-700 dark:text-green-300 font-medium',
    previewValue: 'text-green-600 dark:text-green-400 font-bold text-base sm:text-lg',

    // Errores
    errorContainer: 'flex items-center gap-2 text-red-600 dark:text-red-400 text-xs sm:text-sm mt-2',
    errorIcon: 'w-4 h-4',
    errorAlert: 'p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl flex items-center gap-3',
    errorAlertIcon: 'w-5 h-5 text-red-600 dark:text-red-400',
    errorAlertText: 'text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium',
  },

  // Métodos de pago
  metodos: {
    grid: 'grid grid-cols-3 gap-2 sm:gap-3',
    button: 'relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all',
    buttonSelected: 'bg-gradient-to-br text-white border-transparent shadow-lg',
    buttonUnselected: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
    checkmark: 'absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg',
    checkmarkIcon: 'w-3 h-3 sm:w-4 sm:h-4 text-white',
    icon: 'w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2',
    iconSelected: 'text-white',
    iconUnselected: 'text-gray-600 dark:text-gray-400',
    label: 'text-xs font-semibold text-center',
    labelSelected: 'text-white',
    labelUnselected: 'text-gray-700 dark:text-gray-300',
  },

  // Botones footer
  footer: {
    container: 'flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t-2 border-gray-100 dark:border-gray-800 px-4 sm:px-6 pb-4 sm:pb-6',
    button: 'flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold',
    cancelButton: 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
    cancelIcon: 'w-4 h-4 sm:w-5 sm:h-5 mr-2',
    submitButton: 'hover:opacity-90 transition-opacity shadow-lg',
    submitIcon: 'w-4 h-4 sm:w-5 sm:h-5 mr-2',
  },
}

export const colorSchemes = {
  'Cuota Inicial': {
    gradient: 'from-blue-500 to-cyan-500',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
  },
  'Crédito Hipotecario': {
    gradient: 'from-purple-500 to-pink-500',
    text: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
  },
  'Subsidio Mi Casa Ya': {
    gradient: 'from-green-500 to-emerald-500',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
  },
  'Subsidio Caja Compensación': {
    gradient: 'from-green-500 to-emerald-500',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
  },
}

export const metodoPagoConfig = {
  Efectivo: {
    color: 'from-green-500 to-emerald-500',
  },
  Transferencia: {
    color: 'from-blue-500 to-cyan-500',
  },
  Cheque: {
    color: 'from-purple-500 to-pink-500',
  },
}
