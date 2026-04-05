'use client'

import { ReactNode } from 'react'

interface DataRowProps {
  label: string
  value: ReactNode
  mono?: boolean
  highlight?: boolean
}

/**
 * Componente para mostrar pares label-valor de forma consistente
 * Soporta modo mono (números) y highlight (valores importantes)
 */
export function DataRow({
  label,
  value,
  mono = false,
  highlight = false,
}: DataRowProps) {
  return (
    <div className='flex items-center justify-between border-b border-slate-100 py-2 last:border-0 dark:border-slate-700'>
      <span className='text-sm text-slate-600 dark:text-slate-400'>
        {label}
      </span>
      <span
        className={`text-sm font-medium ${
          highlight
            ? 'font-bold text-orange-600 dark:text-orange-400'
            : 'text-slate-900 dark:text-slate-100'
        } ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}
