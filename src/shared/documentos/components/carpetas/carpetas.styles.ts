/**
 * Estilos para componentes del sistema de carpetas
 */
import type { ModuleName } from '@/shared/config/module-themes'

const MODULE_COLORS: Record<
  string,
  {
    folderIcon: string
    folderHoverBg: string
    breadcrumbActive: string
    breadcrumbHover: string
  }
> = {
  proyectos: {
    folderIcon: 'text-green-500 dark:text-green-400',
    folderHoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-700/60',
    breadcrumbActive: 'text-green-700 dark:text-green-300',
    breadcrumbHover:
      'hover:text-green-600 dark:hover:text-green-400 hover:underline',
  },
  viviendas: {
    folderIcon: 'text-orange-500 dark:text-orange-400',
    folderHoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-700/60',
    breadcrumbActive: 'text-orange-700 dark:text-orange-300',
    breadcrumbHover:
      'hover:text-orange-600 dark:hover:text-orange-400 hover:underline',
  },
  clientes: {
    folderIcon: 'text-cyan-500 dark:text-cyan-400',
    folderHoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-700/60',
    breadcrumbActive: 'text-cyan-700 dark:text-cyan-300',
    breadcrumbHover:
      'hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline',
  },
}

const DEFAULT_COLORS = MODULE_COLORS.proyectos

export function getCarpetaStyles(moduleName: ModuleName = 'proyectos') {
  const colors = MODULE_COLORS[moduleName] || DEFAULT_COLORS

  return {
    card: {
      // Flat Google Drive-style chip — neutral base, module color only on icon
      container: `group relative flex items-center gap-2.5 rounded-lg border border-gray-200/70 bg-white px-3 py-2.5 cursor-pointer transition-all duration-150 dark:border-gray-700/60 dark:bg-gray-800/50 ${colors.folderHoverBg} hover:border-gray-300 dark:hover:border-gray-600`,
      icon: `h-6 w-6 flex-shrink-0 ${colors.folderIcon}`,
      name: 'min-w-0 flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 break-words line-clamp-1 leading-tight',
      count:
        'flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 tabular-nums',
      actions:
        'opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-0.5 flex-shrink-0',
      actionBtn:
        'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500',
    },
    breadcrumbs: {
      container: 'flex items-center gap-1 text-sm flex-wrap',
      separator: 'text-gray-400 dark:text-gray-500',
      item: `cursor-pointer text-gray-500 dark:text-gray-400 ${colors.breadcrumbHover} transition-colors`,
      active: `font-medium ${colors.breadcrumbActive}`,
    },
    grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5',
    createButton: `flex items-center gap-2 rounded-lg border-2 border-dashed p-3 cursor-pointer transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 ${colors.folderHoverBg} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400`,
  } as const
}
