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
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const theme = gradientClasses[gradientColor]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize,
      },
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

      {/* Paginación con glassmorphism */}
      {showPagination && table.getPageCount() > 1 && (
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Mostrando{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {table.getState().pagination.pageIndex * pageSize + 1}
              </span>
              {' - '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * pageSize,
                  data.length
                )}
              </span>
              {' de '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {data.length}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Página{' '}
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {table.getState().pagination.pageIndex + 1}
              </span>
              {' de '}
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {table.getPageCount()}
              </span>
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
