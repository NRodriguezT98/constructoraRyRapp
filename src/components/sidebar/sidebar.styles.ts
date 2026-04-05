/**
 * Variantes de animación compartidas del Sidebar
 */

export const sidebarAnimationVariants = {
  expanded: { width: 260 },
  collapsed: { width: 72 },
}

export const contentFadeVariants = {
  expanded: { opacity: 1, x: 0 },
  collapsed: { opacity: 0, x: -10 },
}

/**
 * Clases de Tailwind centralizadas del Sidebar
 */
export const sidebarStyles = {
  searchInput:
    'h-8 w-full rounded-lg border border-gray-200/50 bg-gray-50/50 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800',
}
