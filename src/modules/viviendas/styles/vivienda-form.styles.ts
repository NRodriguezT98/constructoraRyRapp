/**
 * Estilos centralizados para el formulario de viviendas
 */

// ============================================
// SECCIONES DEL FORMULARIO
// ============================================

export const sectionClasses = {
  container: 'space-y-8',
  card: 'rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
  header: 'mb-6 border-b border-gray-200 pb-4 dark:border-gray-700',
  title: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
  subtitle: 'mt-1 text-sm text-gray-600 dark:text-gray-400',
}

// ============================================
// WIZARD / STEPPER
// ============================================

export const wizardClasses = {
  container: 'relative',
  stepper: 'mb-8 flex items-center justify-between',
  stepItem: 'flex flex-1 items-center',
  stepCircle: {
    base: 'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
    active: 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/50',
    completed: 'border-green-600 bg-green-600 text-white',
    inactive: 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500',
  },
  stepLabel: {
    base: 'ml-3 hidden text-sm font-medium sm:block',
    active: 'text-blue-600 dark:text-blue-400',
    completed: 'text-green-600 dark:text-green-400',
    inactive: 'text-gray-500 dark:text-gray-400',
  },
  stepLine: {
    base: 'mx-4 h-0.5 flex-1',
    completed: 'bg-green-600',
    inactive: 'bg-gray-300 dark:bg-gray-600',
  },
  content: 'min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-300',
}

// ============================================
// CAMPOS DE FORMULARIO
// ============================================

export const fieldClasses = {
  group: 'space-y-2',
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
  required: 'ml-1 text-red-500',
  input: {
    base: 'block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:disabled:bg-gray-700',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  },
  select: {
    base: 'block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:disabled:bg-gray-700',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  },
  textarea: {
    base: 'block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:disabled:bg-gray-700',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  },
  error: 'mt-1 text-sm text-red-600 dark:text-red-400',
  hint: 'mt-1 text-sm text-gray-500 dark:text-gray-400',
}

// ============================================
// GRID DE LINDEROS (2x2)
// ============================================

export const linderosClasses = {
  grid: 'grid gap-6 sm:grid-cols-2',
  item: fieldClasses.group,
}

// ============================================
// INFORMACIÓN LEGAL
// ============================================

export const legalClasses = {
  grid: 'grid gap-6 sm:grid-cols-2',
  fullWidth: 'sm:col-span-2',
  fileUpload: {
    container: 'mt-1',
    button: 'inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    fileName: 'mt-2 text-sm text-gray-600 dark:text-gray-400',
  },
}

// ============================================
// CAMPOS FINANCIEROS
// ============================================

export const financieroClasses = {
  container: 'space-y-6',
  valorBaseGroup: {
    container: 'space-y-2',
    inputWrapper: 'relative',
    input: `${fieldClasses.input.base} pl-12 text-lg font-semibold`,
    prefix: 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-500',
  },
  toggleGroup: {
    container: 'flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50',
    label: 'text-sm font-medium text-gray-900 dark:text-gray-100',
    toggle: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20',
    toggleActive: 'bg-blue-600',
    toggleInactive: 'bg-gray-300 dark:bg-gray-600',
    toggleButton: 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
    toggleButtonActive: 'translate-x-6',
    toggleButtonInactive: 'translate-x-1',
  },
  selectRecargo: {
    container: 'mt-4 animate-in fade-in slide-in-from-top-2 duration-200',
    select: fieldClasses.select.base,
  },
}

// ============================================
// RESUMEN FINANCIERO
// ============================================

export const resumenClasses = {
  card: 'rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 shadow-lg dark:border-blue-700 dark:from-blue-900/20 dark:to-purple-900/20',
  title: 'mb-6 text-lg font-bold text-gray-900 dark:text-gray-100',
  list: 'space-y-4',
  item: {
    container: 'flex items-center justify-between',
    label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    value: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
    valueHighlight: 'text-lg font-semibold text-blue-600 dark:text-blue-400',
  },
  divider: 'my-4 border-t border-gray-300 dark:border-gray-600',
  total: {
    container: 'mt-6 flex items-center justify-between rounded-lg bg-blue-600 p-4 dark:bg-blue-700',
    label: 'text-sm font-bold uppercase tracking-wide text-white',
    value: 'text-2xl font-bold text-white',
  },
}

// ============================================
// SELECCIÓN DE PROYECTO/MANZANA
// ============================================

export const seleccionClasses = {
  container: 'space-y-6',
  badge: {
    disponible: 'inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300',
    warning: 'inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  infoBox: {
    container: 'rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20',
    text: 'text-sm text-blue-900 dark:text-blue-100',
    textBold: 'font-semibold',
  },
}

// ============================================
// BOTONES DE NAVEGACIÓN
// ============================================

export const navigationClasses = {
  container: 'mt-8 flex items-center justify-between gap-4',
  button: {
    primary: 'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600',
    secondary: 'inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
  },
}

// ============================================
// EMPTY STATES
// ============================================

export const emptyStateClasses = {
  container: 'flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50',
  icon: 'mx-auto h-12 w-12 text-gray-400',
  title: 'mt-4 text-lg font-medium text-gray-900 dark:text-gray-100',
  description: 'mt-2 text-sm text-gray-500 dark:text-gray-400',
}

// ============================================
// LOADING STATES
// ============================================

export const loadingClasses = {
  spinner: 'h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
  container: 'flex items-center justify-center gap-2 p-8',
  text: 'text-sm text-gray-600 dark:text-gray-400',
}
