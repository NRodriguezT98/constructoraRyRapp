'use client'

import { motion } from 'framer-motion'
import { Grid3x3, List } from 'lucide-react'
import { cn } from '../../utils/helpers'

export type ViewMode = 'grid' | 'lista'

interface ViewToggleProps {
  /** Vista actual */
  value: ViewMode
  /** Callback cuando cambia la vista */
  onChange: (value: ViewMode) => void
  /** Clases adicionales */
  className?: string
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        'flex overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <button
        onClick={() => onChange('grid')}
        className={cn(
          'relative px-4 py-3 transition-all duration-200',
          value === 'grid'
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200'
        )}
        type='button'
        aria-label='Vista de cuadrícula'
      >
        {value === 'grid' && (
          <motion.div
            layoutId='activeView'
            className='absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700'
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Grid3x3 className='relative z-10 h-4 w-4' />
      </button>

      <div className='w-px bg-gray-200 dark:bg-gray-700' />

      <button
        onClick={() => onChange('lista')}
        className={cn(
          'relative px-4 py-3 transition-all duration-200',
          value === 'lista'
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200'
        )}
        type='button'
        aria-label='Vista de lista'
      >
        {value === 'lista' && (
          <motion.div
            layoutId='activeView'
            className='absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700'
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <List className='relative z-10 h-4 w-4' />
      </button>
    </div>
  )
}
