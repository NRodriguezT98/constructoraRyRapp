/**
 * 🎨 ESTILOS CENTRALIZADOS - ViviendasFiltrosPremium
 * ✅ Basado en patrón de Proyectos (compacto)
 * ✅ Colores naranja/ámbar (theming de Viviendas)
 * ✅ Dark mode completo
 */

export const viviendasFiltrosStyles = {
  // Contenedor principal (SIN sticky - scroll normal)
  container: 'backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-orange-500/10',

  // Barra de búsqueda y filtros (horizontal)
  searchBar: 'flex items-center gap-2',

  // Búsqueda
  searchWrapper: 'relative flex-1',
  label: 'sr-only', // Solo accesibilidad
  searchIcon: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
  searchInput: 'w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm placeholder:text-gray-400',
  searchClearButton: 'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',

  // Selectores
  select: 'px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm min-w-[180px]',

  // Footer
  footer: 'flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700',
  resultCount: 'text-xs text-gray-600 dark:text-gray-400 font-medium',
  clearButton: 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-all',
}
