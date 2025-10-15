'use client'

import { CheckCircle2, Clock, Home } from 'lucide-react'
import { viviendasListStyles as styles } from '../styles/viviendasList.styles'

interface ViviendasStatsProps {
  total: number
  disponibles: number
  asignadas: number
  pagadas: number
  valorTotal: number
}

/**
 * Estadísticas del listado de viviendas
 * Componente presentacional puro
 */
export function ViviendasStats({
  total,
  disponibles,
  asignadas,
  pagadas,
  valorTotal,
}: ViviendasStatsProps) {
  const stats = [
    {
      label: 'Total',
      value: total,
      icon: Home,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Disponibles',
      value: disponibles,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Asignadas',
      value: asignadas,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Pagadas',
      value: pagadas,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  return (
    <div className={styles.stats.container}>
      {stats.map(stat => (
        <div key={stat.label} className={styles.stats.card}>
          <div className="flex items-center justify-between">
            <p className={styles.stats.label}>{stat.label}</p>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          <p className={styles.stats.value}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
