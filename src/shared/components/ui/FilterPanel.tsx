'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '../../utils/helpers'

export interface FilterOption<T = string> {
  value: T
  label: string
}

interface FilterPanelProps<T = string> {
  /** Si el panel está visible */
  show: boolean
  /** Título del panel */
  title?: string
  /** Opciones de filtro */
  options: FilterOption<T>[]
  /** Valor seleccionado */
  value?: T
  /** Callback cuando cambia la selección */
  onChange: (value?: T) => void
  /** Label para "Todos" */
  allLabel?: string
  /** Clases adicionales */
  className?: string
}

export function FilterPanel<T = string>({
  show,
  title = 'Filtrar por:',
  options,
  value,
  onChange,
  allLabel = 'Todos',
  className,
}: FilterPanelProps<T>) {
  if (!show) return null

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50',
        className
      )}
    >
      <div className='mb-2 flex items-center gap-1.5'>
        <Sparkles className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
        <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
          {title}
        </span>
      </div>

      <div className='flex flex-wrap gap-1.5'>
        {/* Botón "Todos" */}
        <button
          onClick={() => onChange(undefined)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
            value === undefined
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
              : 'border border-gray-200 bg-white text-gray-700 hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500'
          )}
          type='button'
        >
          {allLabel}
        </button>

        {/* Opciones de filtro */}
        {options.map(option => (
          <button
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              value === option.value
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-700 hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500'
            )}
            type='button'
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
