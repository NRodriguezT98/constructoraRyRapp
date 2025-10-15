/**
 * Estilos centralizados para Formulario de Proyecto
 * Optimizado para rendimiento - Sin animaciones pesadas
 */

// ===================================
// 📦 SECCIONES - Cards principales
// ===================================
export const sectionClasses = {
  card: 'rounded-xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-900/50',
  header: 'mb-4 flex items-center gap-2.5',
  icon: 'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-sm',
  title: 'text-base font-bold text-gray-900 dark:text-white',
  badge: 'ml-auto rounded-full px-3 py-1 text-xs font-medium',
}

// ===================================
// 📝 CAMPOS - Inputs y validación
// ===================================
export const fieldClasses = {
  label: 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300',
  input: 'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400',
  textarea: 'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 resize-none',
  error: 'mt-1.5 flex items-center gap-1 text-xs text-red-500 dark:text-red-400',
}

// ===================================
// 🏘️ MANZANAS - Tarjetas Compactas
// ===================================
export const manzanaClasses = {
  card: 'rounded-lg border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700/50 dark:from-gray-800/90 dark:to-gray-900/90',
  header: 'mb-3 flex items-center justify-between',
  icon: 'flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm',
  title: 'text-sm font-semibold text-gray-900 dark:text-gray-100',
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  label: 'mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300',
  input: 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-emerald-400',
  error: 'mt-1 text-xs text-red-500 dark:text-red-400',
  badge: 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
  content: 'space-y-3',
  letraField: 'flex-1',
  viviendasField: 'flex-1',
  deleteButton: 'rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300',
}

// ===================================
// 🎨 GRADIENTES - Por tipo de sección
// ===================================
export const gradients = {
  info: 'from-blue-500 to-purple-600',
  manzanas: 'from-emerald-500 to-teal-600',
  docs: 'from-purple-500 to-pink-600',
}

// ===================================
// 🏷️ BADGES - Colores por sección
// ===================================
export const badgeColors = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  manzanas: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  docs: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
}

// ===================================
// 🔘 BOTONES - Acciones del formulario
// ===================================
export const buttonClasses = {
  primary: 'flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50',
  secondary: 'rounded-lg border-2 border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
  add: 'flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-shadow hover:shadow-lg',
  delete: 'rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300',
}
