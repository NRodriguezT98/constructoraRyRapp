/**
 * 📝 MODERN SELECT - Componente Compartido
 *
 * Select moderno con ícono, label y validación.
 * Diseño consistente en toda la aplicación.
 */

'use client'

import { motion } from 'framer-motion'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'

export interface ModernSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon: LucideIcon
  label: string
  error?: string
  required?: boolean
}

export function ModernSelect({
  icon: Icon,
  label,
  error,
  required,
  children,
  className = '',
  ...props
}: ModernSelectProps) {
  return (
    <div className='group'>
      <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
        <Icon className='h-3.5 w-3.5 text-purple-500' />
        {label}
        {required && <span className='text-red-500'>*</span>}
      </label>
      <div className='relative'>
        <select
          {...props}
          className={`w-full appearance-none rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 transition-all hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-purple-600 ${className}`}
        >
          {children}
        </select>
        <ChevronRight className='pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-gray-400' />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mt-1 flex items-center gap-0.5 text-xs text-red-500'
          >
            <span className='font-medium'>⚠</span> {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}
