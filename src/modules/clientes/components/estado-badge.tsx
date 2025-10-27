/**
 * 🏷️ ESTADO BADGE - Cliente
 *
 * Badge para mostrar el estado del cliente con ícono y color.
 */

'use client'

import { CheckCircle2, Clock, XCircle } from 'lucide-react'

export interface EstadoBadgeProps {
  estado: string
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const config = {
    Interesado: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      icon: Clock,
    },
    Activo: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      icon: CheckCircle2,
    },
    Inactivo: {
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      text: 'text-gray-700 dark:text-gray-300',
      icon: XCircle,
    },
  }

  const { bg, text, icon: Icon } =
    config[estado as keyof typeof config] || config.Interesado

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${bg} ${text}`}
    >
      <Icon className='h-4 w-4' />
      {estado}
    </span>
  )
}
