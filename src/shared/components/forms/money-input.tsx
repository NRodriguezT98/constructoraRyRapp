/**
 * 💰 MONEY INPUT - Componente Compartido
 *
 * Input especializado para valores monetarios con formato COP.
 * Muestra el valor formateado de forma visual.
 */

'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

export interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  icon: LucideIcon
  label: string
  error?: string
  required?: boolean
  value: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function MoneyInput({
  icon: Icon,
  label,
  error,
  required,
  value,
  onChange,
  ...props
}: MoneyInputProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className='group'>
      <label className='mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
        <Icon className='h-4 w-4 text-purple-500' />
        {label}
        {required && <span className='text-red-500'>*</span>}
      </label>
      <div className='relative'>
        <div className='pointer-events-none absolute inset-0 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-gray-700 dark:from-green-900/20 dark:to-emerald-900/20' />
        <div className='relative flex items-center px-4 py-3'>
          <span className='text-2xl font-bold text-green-600 dark:text-green-400'>
            {value ? formatCurrency(value) : '$0'}
          </span>
        </div>
        <input type='hidden' value={value || 0} onChange={onChange} {...props} />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mt-1.5 flex items-center gap-1 text-sm text-red-500'
          >
            <span className='font-medium'>⚠</span> {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}
