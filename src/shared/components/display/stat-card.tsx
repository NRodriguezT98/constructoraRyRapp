/**
 * 📊 STAT CARD - Componente Compartido
 *
 * Tarjeta de estadística con ícono y valor.
 * Usado en dashboards para mostrar métricas.
 */

'use client'

import type { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
}

export function StatCard({ icon: Icon, label, value, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex items-center gap-3'>
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className='h-6 w-6' />
        </div>
        <div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>{label}</p>
          <p className='mt-1 text-xl font-bold text-gray-900 dark:text-white'>{value}</p>
        </div>
      </div>
    </div>
  )
}
