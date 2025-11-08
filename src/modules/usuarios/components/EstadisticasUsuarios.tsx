/**
 * 📊 Estadísticas Premium de Usuarios
 * Cards con glassmorphism, hover effects y gradientes únicos
 */

'use client'

import { motion } from 'framer-motion'
import { Ban, Clock, Shield, Users } from 'lucide-react'

import { metricasUsuariosColors, usuariosPremiumStyles as styles } from '../styles/usuarios-premium.styles'
import type { EstadisticasUsuarios } from '../types'

interface EstadisticasUsuariosPremiumProps {
  estadisticas: EstadisticasUsuarios
}

export function EstadisticasUsuariosPremium({ estadisticas }: EstadisticasUsuariosPremiumProps) {
  const stats = [
    {
      label: 'Total Usuarios',
      value: estadisticas.total,
      icon: Users,
      colors: metricasUsuariosColors.total
    },
    {
      label: 'Administradores',
      value: estadisticas.por_rol.Administrador || 0,
      icon: Shield,
      colors: metricasUsuariosColors.administradores
    },
    {
      label: 'Activos Hoy',
      value: estadisticas.activos_hoy,
      icon: Clock,
      colors: metricasUsuariosColors.activos
    },
    {
      label: 'Bloqueados',
      value: estadisticas.bloqueados,
      icon: Ban,
      colors: metricasUsuariosColors.bloqueados
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
