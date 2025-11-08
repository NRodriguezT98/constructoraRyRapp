'use client'

import { motion } from 'framer-motion'

interface EstadoBadgeProps {
  estado: string
}

/**
 * Badge para mostrar el estado de una vivienda con colores semánticos
 * Estados: Disponible (verde), Asignada (azul), Pagada (esmeralda)
 */
export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const estadoConfig = {
    Disponible: {
      color: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-300',
      dotColor: 'bg-green-500',
      label: 'Disponible',
    },
    Asignada: {
      color: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-300',
      dotColor: 'bg-blue-500',
      label: 'Asignada',
    },
    Pagada: {
      color: 'bg-emerald-100 dark:bg-emerald-900/30',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      dotColor: 'bg-emerald-500',
      label: 'Pagada',
    },
  }

  const config = estadoConfig[estado as keyof typeof estadoConfig] || estadoConfig.Disponible

  return (
    <motion.span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.color} text-sm font-medium`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotColor} animate-pulse`} />
      <span className={config.textColor}>{config.label}</span>
    </motion.span>
  )
}
