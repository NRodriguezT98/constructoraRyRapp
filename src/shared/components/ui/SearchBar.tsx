'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'
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
        isFocused && 'scale-[1.01] transition-transform duration-200',
        className
      )}
    >
      {/* Halo de gradiente */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100',
          isFocused && 'opacity-100'
        )}
      />

      {/* Input container */}
      <div className='relative'>
        <Search
          className={cn(
            'pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-200',
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
            'h-12 w-full rounded-xl border-2 bg-white pl-12 pr-12 font-medium dark:bg-gray-800',
            'text-gray-900 placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500',
            'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            isFocused
              ? 'border-blue-500 shadow-lg shadow-blue-500/10 dark:border-blue-500'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
          )}
        />

        {/* Botón limpiar */}
        {value && (
          <button
            onClick={() => onChange('')}
            className='absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            type='button'
          >
            <X className='h-4 w-4 text-gray-400' />
          </button>
        )}
      </div>
    </div>
  )
}
