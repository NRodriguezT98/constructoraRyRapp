/**
 * ============================================
 * ESTILOS: EditarFuentesPagoModal
 * ============================================
 *
 * ✅ CLASES CENTRALIZADAS para modal de edición de fuentes
 * Usa paleta CYAN/AZUL (módulo clientes)
 *
 * @version 1.0.0 - 2025-11-28
 */

export const editarFuentesStyles = {
  // =====================================================
  // MODAL CONTAINER
  // =====================================================

  backdrop: 'absolute inset-0 bg-black/50 backdrop-blur-sm',

  modal: 'relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl',

  // =====================================================
  // HEADER (CYAN/AZUL - Módulo Clientes)
  // =====================================================

  header: {
    container: 'flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-4',

    iconWrapper: 'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center',
    icon: 'w-5 h-5 text-white',

    title: 'text-xl font-bold text-white',
    subtitle: 'text-sm text-cyan-100 dark:text-cyan-200',

    closeButton: 'p-2 rounded-lg hover:bg-white/20 transition-colors',
  },

  // =====================================================
  // CONTENT
  // =====================================================

  content: 'overflow-y-auto max-h-[calc(90vh-200px)] p-6',

  // =====================================================
  // VALIDATION SUMMARY
  // =====================================================

  validationSummary: {
    containerValid: 'mb-4 p-4 rounded-xl border-2 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700',
    containerInvalid: 'mb-4 p-4 rounded-xl border-2 bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700',

    grid: 'flex items-center justify-between',

    label: 'text-sm font-semibold text-gray-700 dark:text-gray-300',

    valorFinal: 'text-2xl font-bold text-gray-900 dark:text-white',

    totalValid: 'text-2xl font-bold text-emerald-600 dark:text-emerald-400',
    totalInvalid: 'text-2xl font-bold text-amber-600 dark:text-amber-400',

    diferenciaValid: 'text-2xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400',
    diferenciaInvalid: 'text-2xl font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400',

    icon: 'w-6 h-6',
  },

  // =====================================================
  // FUENTES LIST
  // =====================================================

  fuentesList: 'space-y-3',

  // =====================================================
  // FUENTE ROW
  // =====================================================

  fuenteRow: {
    container: 'p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700',

    grid: 'grid grid-cols-12 gap-3 items-start',

    colTipo: 'col-span-3',
    colMonto: 'col-span-3',
    colEntidad: 'col-span-3',
    colDelete: 'col-span-3 flex items-end',

    label: 'text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block',

    select: 'w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed',

    input: 'w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20',

    inputDisabled: 'w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed',

    montoWrapper: 'relative',
    montoSymbol: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm',
    montoInput: 'w-full pl-7 pr-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20',

    montoRecibidoLabel: 'text-emerald-600 dark:text-emerald-400',

    deleteButtonEnabled: 'w-full px-3 py-2 rounded-lg text-sm font-medium transition-all bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/50',
    deleteButtonDisabled: 'w-full px-3 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed',

    deleteIcon: 'w-4 h-4 mx-auto',

    errorsContainer: 'mt-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800',
    errorsList: 'text-xs text-rose-700 dark:text-rose-300 space-y-1',
  },

  // =====================================================
  // ADD BUTTON
  // =====================================================

  addButton: 'mt-4 w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center justify-center gap-2',
  addIcon: 'w-5 h-5',

  // =====================================================
  // FOOTER
  // =====================================================

  footer: {
    container: 'border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-between',

    warningContainer: 'text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2',
    warningIcon: 'w-4 h-4',

    buttonsContainer: 'flex items-center gap-3',

    cancelButton: 'px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50',

    saveButtonEnabled: 'px-6 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 shadow-lg',
    saveButtonDisabled: 'px-6 py-2 rounded-lg text-sm font-medium bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed',
  },
}
