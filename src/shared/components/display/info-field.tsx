/**
 * 📋 INFO FIELD - Componente Compartido
 *
 * Componente para mostrar un campo de información con ícono.
 * Usado en vistas de detalle.
 */

'use client'

import type { LucideIcon } from 'lucide-react'

export interface InfoFieldProps {
  icon: LucideIcon
  label: string
  value?: string | null
  className?: string
  showEmpty?: boolean
}

export function InfoField({
  icon: Icon,
  label,
  value,
  className = '',
  showEmpty = false,
}: InfoFieldProps) {
  // Si no tiene valor y no queremos mostrar vacíos, no renderizar
  if (!value && !showEmpty) return null

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30'>
        <Icon className='h-5 w-5 text-purple-600 dark:text-purple-400' />
      </div>
      <div className='flex-1'>
        <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
          {label}
        </p>
        <p
          className={`mt-1 text-base font-semibold ${
            value
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-600 italic'
          }`}
        >
          {value || 'No especificado'}
        </p>
      </div>
    </div>
  )
}
