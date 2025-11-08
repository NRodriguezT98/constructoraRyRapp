/**
 * InfoCard - Tarjeta de información reutilizable
 *
 * ✅ Componente presentacional puro
 * ✅ < 50 líneas
 * ✅ Sin lógica
 */

import { ReactNode } from 'react'

import { LucideIcon } from 'lucide-react'

interface InfoCardProps {
  icon: LucideIcon
  label: string
  value: ReactNode
  color?: 'blue' | 'green' | 'purple' | 'cyan' | 'gray'
}

export function InfoCard({ icon: Icon, label, value, color = 'gray' }: InfoCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      icon: 'text-purple-600 dark:text-purple-400'
    },
    cyan: {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      icon: 'text-cyan-600 dark:text-cyan-400'
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-900/50',
      icon: 'text-gray-600 dark:text-gray-400'
    }
  }

  const colors = colorClasses[color]

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
      <div className={`w-7 h-7 rounded-md ${colors.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${colors.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] text-gray-500 dark:text-gray-400 block">{label}</label>
        <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">{value}</span>
      </div>
    </div>
  )
}
