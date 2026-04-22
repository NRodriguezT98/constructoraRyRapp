/**
 * UsuariosMetricasPremium — 4 cards KPI del módulo de usuarios
 * ✅ Total, Activos, Bloqueados, Activos hoy
 * ✅ Hover con scale + y: -4
 * ✅ Glassmorphism + gradientes
 */

'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, UserCheck, Users } from 'lucide-react'

import { usuariosPageStyles as styles } from '../styles/usuarios-page.styles'
import type { EstadisticasUsuarios } from '../types'

interface UsuariosMetricasPremiumProps {
  estadisticas: EstadisticasUsuarios | undefined
}

export function UsuariosMetricasPremium({
  estadisticas,
}: UsuariosMetricasPremiumProps) {
  const total = estadisticas?.total ?? 0
  const activos = estadisticas?.activos ?? 0
  const bloqueados = estadisticas?.bloqueados ?? 0
  const activosHoy = estadisticas?.activos_hoy ?? 0

  return (
    <motion.div
      {...styles.animations.metricas}
      className={styles.metricas.grid}
    >
      {/* Total */}
      <motion.div
        {...styles.animations.metricaCard}
        className={styles.metricas.card}
      >
        <div className={styles.metricas.glowIndigo} />
        <div className={styles.metricas.content}>
          <div className={styles.metricas.iconIndigo}>
            <Users className={styles.metricas.icon} />
          </div>
          <div className={styles.metricas.textGroup}>
            <p className={styles.metricas.valueIndigo}>{total}</p>
            <p className={styles.metricas.label}>Total Usuarios</p>
          </div>
        </div>
      </motion.div>

      {/* Activos */}
      <motion.div
        {...styles.animations.metricaCard}
        className={styles.metricas.card}
      >
        <div className={styles.metricas.glowGreen} />
        <div className={styles.metricas.content}>
          <div className={styles.metricas.iconGreen}>
            <CheckCircle2 className={styles.metricas.icon} />
          </div>
          <div className={styles.metricas.textGroup}>
            <p className={styles.metricas.valueGreen}>{activos}</p>
            <p className={styles.metricas.label}>Activos</p>
          </div>
        </div>
      </motion.div>

      {/* Bloqueados */}
      <motion.div
        {...styles.animations.metricaCard}
        className={styles.metricas.card}
      >
        <div className={styles.metricas.glowRed} />
        <div className={styles.metricas.content}>
          <div className={styles.metricas.iconRed}>
            <AlertTriangle className={styles.metricas.icon} />
          </div>
          <div className={styles.metricas.textGroup}>
            <p className={styles.metricas.valueRed}>{bloqueados}</p>
            <p className={styles.metricas.label}>Bloqueados</p>
          </div>
        </div>
      </motion.div>

      {/* Activos hoy */}
      <motion.div
        {...styles.animations.metricaCard}
        className={styles.metricas.card}
      >
        <div className={styles.metricas.glowAmber} />
        <div className={styles.metricas.content}>
          <div className={styles.metricas.iconAmber}>
            <UserCheck className={styles.metricas.icon} />
          </div>
          <div className={styles.metricas.textGroup}>
            <p className={styles.metricas.valueAmber}>{activosHoy}</p>
            <p className={styles.metricas.label}>Activos hoy</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
