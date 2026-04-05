/**
 * 📊 Estadísticas Premium de Clientes
 * Total como métrica héroe, resto como métricas secundarias
 */

'use client'

import { motion } from 'framer-motion'
import { UserCheck, UserMinus, UserPlus, Users, UserX } from 'lucide-react'

import {
  metricasClientesColors,
  clientesListaStyles as styles,
} from '../styles/clientes-lista.styles'

interface EstadisticasClientesProps {
  total: number
  interesados: number
  activos: number
  inactivos: number
  renunciaron: number
}

const STATS_SECUNDARIAS = (
  interesados: number,
  activos: number,
  inactivos: number,
  renunciaron: number
) => [
  {
    label: 'Interesados',
    value: interesados,
    icon: UserPlus,
    colors: metricasClientesColors.interesados,
  },
  {
    label: 'Activos',
    value: activos,
    icon: UserCheck,
    colors: metricasClientesColors.activos,
  },
  {
    label: 'Renunciaron',
    value: renunciaron,
    icon: UserMinus,
    colors: metricasClientesColors.renunciaron,
  },
  {
    label: 'Inactivos',
    value: inactivos,
    icon: UserX,
    colors: metricasClientesColors.inactivos,
  },
]

export function EstadisticasClientes({
  total,
  interesados,
  activos,
  inactivos,
  renunciaron,
}: EstadisticasClientesProps) {
  const secundarias = STATS_SECUNDARIAS(
    interesados,
    activos,
    inactivos,
    renunciaron
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className='grid grid-cols-5 gap-3'
    >
      {/* ⭐ MÉTRICA HÉROE: Total Clientes — más grande, más prominente */}
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className='group relative col-span-1 overflow-hidden rounded-xl border-2 border-cyan-200 bg-white/80 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 dark:border-cyan-800/60 dark:bg-gray-800/80'
      >
        <div className='absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
        <div className='relative z-10 flex items-center gap-3'>
          <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg'>
            <Users className='h-6 w-6 text-white' />
          </div>
          <div>
            <p className='text-3xl font-black leading-none text-gray-900 dark:text-white'>
              {total}
            </p>
            <p className='mt-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400'>
              Total Clientes
            </p>
          </div>
        </div>
      </motion.div>

      {/* Métricas secundarias: misma altura pero más compactas */}
      {secundarias.map((stat, index) => (
        <motion.div
          key={stat.label}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ transitionDelay: `${(index + 1) * 0.05}s` }}
          className={styles.metricas.card}
        >
          <div
            className={`${styles.metricas.cardGlow} bg-gradient-to-br ${stat.colors.glowColor}`}
          />
          <div className={styles.metricas.content}>
            <div
              className={`${styles.metricas.iconCircle} bg-gradient-to-br ${stat.colors.gradient}`}
            >
              <stat.icon className={styles.metricas.icon} />
            </div>
            <div className={styles.metricas.textGroup}>
              <p
                className={`${styles.metricas.value} bg-gradient-to-br ${stat.colors.textGradient}`}
              >
                {stat.value}
              </p>
              <p className={styles.metricas.label}>{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
