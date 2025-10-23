/**
 * 📊 Estadísticas Premium de Clientes
 * Cards con glassmorphism, hover effects y gradientes únicos
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
      colors: metricasClientesColors.total
    },
    {
      label: 'Interesados',
      value: interesados,
      icon: UserPlus,
      colors: metricasClientesColors.interesados
    },
    {
      label: 'Activos',
      value: activos,
      icon: UserCheck,
      colors: metricasClientesColors.activos
    },
    {
      label: 'Inactivos',
      value: inactivos,
      icon: UserX,
      colors: metricasClientesColors.inactivos
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={styles.metricas.grid}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ transitionDelay: `${index * 0.05}s` }}
          className={styles.metricas.card}
        >
          <div className={`${styles.metricas.cardGlow} bg-gradient-to-br ${stat.colors.glowColor}`} />
          <div className={styles.metricas.content}>
            <div className={`${styles.metricas.iconCircle} bg-gradient-to-br ${stat.colors.gradient} shadow-${stat.colors.gradient.split('-')[1]}-500/50`}>
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
