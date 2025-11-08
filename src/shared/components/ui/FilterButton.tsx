'use client'

import { Filter } from 'lucide-react'

import { cn } from '../../utils/helpers'

interface FilterButtonProps {
  /** Si los filtros están activos/visibles */
  active: boolean
  /** Callback al hacer click */
  onClick: () => void
  /** Label del botón */
  label?: string
  /** Clases adicionales */
  className?: string
}

export function FilterButton({
  active,
  onClick,
  label = 'Filtros',
  className,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
        active
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
          : 'border border-gray-200 bg-white text-gray-700 hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500',
        className
      )}
      type='button'
    >
      <Filter className='h-3.5 w-3.5' />
      <span className='hidden sm:inline'>{label}</span>
    </button>
  )
}
