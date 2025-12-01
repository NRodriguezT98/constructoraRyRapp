/**
 * Estilos centralizados para FuentePagoCard
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 */

export const fuentePagoCardStyles = {
  // Container principal
  container: {
    enabled: (bgColor: string, borderColor: string) =>
      `rounded-xl border-2 transition-all ${bgColor} ${borderColor}`,
    disabled: 'rounded-xl border-2 transition-all border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50',
  },

  // Header
  header: {
    container: 'flex items-center justify-between border-b-2 border-gray-200 p-3 dark:border-gray-700',
    iconWrapper: {
      enabled: (bgColor: string) => `flex h-12 w-12 items-center justify-center rounded-xl ${bgColor}`,
      disabled: 'flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700',
    },
    icon: {
      enabled: (color: string) => `h-6 w-6 ${color}`,
      disabled: 'h-6 w-6 text-gray-500',
    },
    title: 'font-semibold text-gray-900 dark:text-white',
    description: 'text-sm text-gray-600 dark:text-gray-400',
    badgeObligatorio: 'inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },

  // Toggle switch
  toggle: {
    track: 'peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer h-7 w-12 rounded-full bg-gray-200 after:absolute after:start-[4px] after:top-[4px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[""] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700',
  },

  // Body
  body: {
    container: 'space-y-3 p-4',
    row: 'grid grid-cols-1 gap-3 md:grid-cols-2',
  },

  // Input
  input: {
    label: 'mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300',
    labelRequired: 'text-red-500',
    field: 'mt-1 block w-full rounded-lg border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400',
    error: 'mt-1 flex items-center gap-1 text-xs text-red-600',
  },

  // Select
  select: {
    field: 'mt-1 block w-full rounded-lg border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400',
  },

  // Upload zone
  upload: {
    container: 'rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800/50',
    fileLoaded: 'flex items-center justify-between',
    fileIcon: 'h-5 w-5 text-green-600',
    fileName: 'text-sm text-gray-700 dark:text-gray-300',
    removeButton: 'rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50',
    uploadLabel: 'flex cursor-pointer flex-col items-center gap-2',
    uploadIcon: 'h-6 w-6 text-gray-400',
    uploadText: 'text-sm text-gray-600 dark:text-gray-400',
  },

  // Info badge
  info: {
    container: 'mt-2 rounded-lg bg-blue-50 p-2 dark:bg-blue-950/30',
    text: 'flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300',
    icon: 'h-4 w-4',
  },
}
