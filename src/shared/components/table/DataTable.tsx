/**
 * DataTable - Componente de tabla genérico y reutilizable
 * ✅ Basado en TanStack Table v8
 * ✅ Ordenamiento por columnas
 * ✅ Paginación
 * ✅ Diseño premium con glassmorphism
 * ✅ Dark mode completo
 * ✅ Responsive
 */

'use client'

import { useState } from 'react'

import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  gradientColor?: 'orange' | 'green' | 'cyan' | 'pink' | 'blue' | 'purple'
  pageSize?: number
  showPagination?: boolean
  initialSorting?: SortingState
}

const gradientClasses = {
  orange: {
    header: 'from-orange-600 via-amber-600 to-yellow-600',
    border: 'border-orange-400/50',
    hover: 'hover:bg-orange-50/80 dark:hover:bg-orange-900/20',
    shadow: 'shadow-orange-500/10',
  },
  green: {
    header: 'from-green-600 via-emerald-600 to-teal-600',
    border: 'border-green-400/50',
    hover: 'hover:bg-green-50/80 dark:hover:bg-green-900/20',
    shadow: 'shadow-green-500/10',
  },
  cyan: {
    header: 'from-cyan-600 via-blue-600 to-indigo-600',
    border: 'border-cyan-400/50',
    hover: 'hover:bg-cyan-50/80 dark:hover:bg-cyan-900/20',
    shadow: 'shadow-cyan-500/10',
  },
  pink: {
    header: 'from-pink-600 via-purple-600 to-indigo-600',
    border: 'border-pink-400/50',
    hover: 'hover:bg-pink-50/80 dark:hover:bg-pink-900/20',
    shadow: 'shadow-pink-500/10',
  },
  blue: {
    header: 'from-blue-600 via-indigo-600 to-purple-600',
    border: 'border-blue-400/50',
    hover: 'hover:bg-blue-50/80 dark:hover:bg-blue-900/20',
    shadow: 'shadow-blue-500/10',
  },
  purple: {
    header: 'from-purple-600 via-indigo-600 to-pink-600',
    border: 'border-purple-400/50',
    hover: 'hover:bg-purple-50/80 dark:hover:bg-purple-900/20',
    shadow: 'shadow-purple-500/10',
  },
}

export function DataTable<TData>({
  columns,
  data,
  gradientColor = 'orange',
  pageSize = 10,
  showPagination = true,
  initialSorting = [],
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize })

  const theme = gradientClasses[gradientColor]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  })

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800 shadow-2xl",
      theme.shadow
    )}>
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header con gradiente premium */}
          <thead className={cn(
            'bg-gradient-to-r border-b-2',
            theme.header,
            theme.border
          )}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:bg-white/10 transition-all'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {/* Indicador de ordenamiento */}
                      {header.column.getCanSort() && (
                        <span>
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronsUpDown className="w-4 h-4 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Body con hover effects premium */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition-all duration-200',
                    theme.hover,
                    idx % 2 === 0
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-gray-50/30 dark:bg-gray-800/30'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación moderna y compacta - Mostrar siempre */}
      {showPagination && (
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-gray-800/95 px-4 py-2.5 flex items-center justify-between">
          {/* Contador compacto + Selector de items por página */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {data.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0}-{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">de</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {data.length}
              </span>
            </div>

            {/* Selector de items por página */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600 dark:text-gray-400">Mostrar:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="text-xs font-semibold px-2 py-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-orange-400 transition-all cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                {data.length > 100 && <option value={data.length}>Todos ({data.length})</option>}
              </select>
            </div>
          </div>

          {/* Controles de navegación modernos */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
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
                {table.getState().pagination.pageIndex + 1}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {table.getPageCount()}
              </span>
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
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
      )}
    </div>
  )
}
