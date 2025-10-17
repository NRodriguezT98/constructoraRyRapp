/**
 * Componente de Estadísticas de Clientes
 * Presentacional puro - recibe datos por props
 */

'use client'

import { motion } from 'framer-motion'
import { UserCheck, UserPlus, Users, UserX } from 'lucide-react'
import { clientesStyles, fadeInUp, staggerContainer } from '../styles'

interface EstadisticasClientesProps {
  total: number
  interesados: number
  activos: number
  inactivos: number
}

export function EstadisticasClientes({
  total,
  interesados,
  activos,
  inactivos,
}: EstadisticasClientesProps) {
  const stats = [
    {
      label: 'Total Clientes',
      value: total,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Interesados',
      value: interesados,
      icon: UserPlus,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Activos',
      value: activos,
      icon: UserCheck,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Inactivos',
      value: inactivos,
      icon: UserX,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    },
  ]

  return (
    <motion.div
      className={clientesStyles.statsGrid}
      variants={staggerContainer}
      initial='initial'
      animate='animate'
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} className={clientesStyles.statCard} variants={fadeInUp}>
          <div className='flex items-center justify-between'>
            <div>
              <p className={clientesStyles.statLabel}>{stat.label}</p>
              <p className={clientesStyles.statValue}>{stat.value}</p>
            </div>
            <div className={`rounded-full p-3 ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
