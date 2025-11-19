/**
 * Componente de Paginación Moderna y Compacta
 * ✅ Reutilizable en cualquier lista (cards, tablas, etc.)
 * ✅ Diseño premium consistente con DataTable
 * ✅ Dark mode completo
 */

'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (items: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = '',
}: PaginationProps) {
  // ✅ Si itemsPerPage >= totalItems, mostrar todos los items (sin paginación real)
  const effectiveItemsPerPage = itemsPerPage >= totalItems ? totalItems : itemsPerPage
  const effectiveTotalPages = Math.max(1, Math.ceil(totalItems / effectiveItemsPerPage))
  const effectiveCurrentPage = Math.min(currentPage, effectiveTotalPages)

  const startItem = totalItems > 0 ? (effectiveCurrentPage - 1) * effectiveItemsPerPage + 1 : 0
  const endItem = Math.min(effectiveCurrentPage * effectiveItemsPerPage, totalItems)

  const canGoPrevious = effectiveCurrentPage > 1
  const canGoNext = effectiveCurrentPage < effectiveTotalPages

  return (
    <div className={`border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-gray-800/95 px-4 py-2.5 flex items-center justify-between rounded-b-xl ${className}`}>
      {/* Contador compacto + Selector de items por página */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {startItem}-{endItem}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">de</span>
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {totalItems}
          </span>
        </div>

        {/* Selector de items por página */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-600 dark:text-gray-400">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="text-xs font-semibold px-2 py-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-orange-400 transition-all cursor-pointer"
            >
              <option value={9}>9</option>
              <option value={18}>18</option>
              <option value={36}>36</option>
              <option value={totalItems}>Todos</option>
            </select>
          </div>
        )}
      </div>

      {/* Controles de navegación modernos */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className="group relative px-2.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700 shadow-sm hover:shadow-md"
        >
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </span>
        </button>

        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-700/50 dark:to-gray-700 border border-gray-300 dark:border-gray-600 shadow-inner">
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
            {effectiveCurrentPage}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {effectiveTotalPages}
          </span>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="group relative px-2.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700 shadow-sm hover:shadow-md"
        >
          <span className="flex items-center gap-1">
            Siguiente
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  )
}
