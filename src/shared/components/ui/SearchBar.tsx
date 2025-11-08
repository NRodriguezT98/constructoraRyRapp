'use client'

import { useState } from 'react'

import { Search, X } from 'lucide-react'

import { cn } from '../../utils/helpers'

interface SearchBarProps {
  /** Valor actual del buscador */
  value: string
  /** Callback cuando cambia el valor */
  onChange: (value: string) => void
  /** Texto placeholder */
  placeholder?: string
  /** Clases adicionales */
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div
      className={cn(
        'group relative',
        isFocused && 'scale-[1.005] transition-transform duration-200',
        className
      )}
    >
      {/* Halo sutil */}
      <div
        className={cn(
          'absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100',
          isFocused && 'opacity-100'
        )}
      />

      {/* Input container */}
      <div className='relative'>
        <Search
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200',
            isFocused
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-400 dark:text-gray-500'
          )}
        />

        <input
          type='text'
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'h-9 w-full rounded-lg border bg-white pl-9 pr-9 text-sm font-medium dark:bg-gray-800',
            'text-gray-900 placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500',
            'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            isFocused
              ? 'border-blue-500 shadow-md shadow-blue-500/10 dark:border-blue-500'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
          )}
        />

        {/* Botón limpiar */}
        {value && (
          <button
            onClick={() => onChange('')}
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            type='button'
          >
            <X className='h-3.5 w-3.5 text-gray-400' />
          </button>
        )}
      </div>
    </div>
  )
}
