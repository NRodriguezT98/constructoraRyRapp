/**
 * 📊 Estadísticas Premium de Clientes
 * Total como métrica héroe, resto como métricas secundarias
 */

'use client'

import { motion } from 'framer-motion'
import { UserCheck, UserPlus, Users, UserX } from 'lucide-react'

import { metricasClientesColors, clientesListaStyles as styles } from '../styles/clientes-lista.styles'

interface EstadisticasClientesProps {
  total: number
  interesados: number
  activos: number
  inactivos: number
}

const STATS_SECUNDARIAS = (interesados: number, activos: number, inactivos: number) => [
  { label: 'Interesados', value: interesados, icon: UserPlus,  colors: metricasClientesColors.interesados },
  { label: 'Activos',     value: activos,     icon: UserCheck, colors: metricasClientesColors.activos },
  { label: 'Inactivos',  value: inactivos,   icon: UserX,     colors: metricasClientesColors.inactivos },
]

export function EstadisticasClientes({
  total,
  interesados,
  activos,
  inactivos,
}: EstadisticasClientesProps) {
  const secundarias = STATS_SECUNDARIAS(interesados, activos, inactivos)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-4 gap-3"
    >
      {/* ⭐ MÉTRICA HÉROE: Total Clientes — más grande, más prominente */}
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="col-span-1 group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-2 border-cyan-200 dark:border-cyan-800/60 p-4 shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{total}</p>
            <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-1">Total Clientes</p>
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
          <div className={`${styles.metricas.cardGlow} bg-gradient-to-br ${stat.colors.glowColor}`} />
          <div className={styles.metricas.content}>
            <div className={`${styles.metricas.iconCircle} bg-gradient-to-br ${stat.colors.gradient}`}>
              <stat.icon className={styles.metricas.icon} />
            </div>
            <div className={styles.metricas.textGroup}>
              <p className={`${styles.metricas.value} bg-gradient-to-br ${stat.colors.textGradient}`}>
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
