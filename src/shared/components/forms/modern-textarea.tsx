/**
 * 📝 MODERN TEXTAREA - Componente Compartido
 *
 * Textarea moderno con ícono, label y validación.
 * Diseño consistente en toda la aplicación.
 */

'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { TextareaHTMLAttributes } from 'react'

export interface ModernTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon: LucideIcon
  label: string
  error?: string
}

export function ModernTextarea({
  icon: Icon,
  label,
  error,
  className = '',
  ...props
}: ModernTextareaProps) {
  return (
    <div className='group'>
      <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
        <Icon className='h-3.5 w-3.5 text-purple-500' />
        {label}
      </label>
      <div className='relative'>
        <textarea
          {...props}
          className={`w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 transition-all placeholder:text-gray-400 hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-purple-600 ${className}`}
        />
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
