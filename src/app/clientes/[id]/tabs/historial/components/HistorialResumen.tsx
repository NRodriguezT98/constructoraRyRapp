/**
 * HistorialResumen - Resumen del Ciclo de Vida del Cliente
 * Header hero con estadísticas clave del timeline
 */

'use client'

import { motion } from 'framer-motion'
import { Activity, AlertTriangle, CalendarDays, Clock } from 'lucide-react'

import { historialStyles as styles } from '../historial-tab.styles'

interface HistorialResumenProps {
  total: number
  estaSemana: number
  esteMes: number
  criticos: number
  primerEvento: string | null
}

export function HistorialResumen({
  total,
  estaSemana,
  esteMes,
  criticos,
  primerEvento,
}: HistorialResumenProps) {
  const stats = [
    { label: 'Total eventos', value: total, icon: Activity },
    { label: 'Esta semana', value: estaSemana, icon: Clock },
    { label: 'Este mes', value: esteMes, icon: CalendarDays },
    { label: 'Críticos', value: criticos, icon: AlertTriangle },
  ]

  return (
    <motion.div
      initial={styles.animations.fadeIn.initial}
      animate={styles.animations.fadeIn.animate}
      className={styles.resumen.wrapper}
    >
      <div className={styles.resumen.overlay} />
      <div className={styles.resumen.content}>
        {/* Título + Badge */}
        <div className={styles.resumen.headerRow}>
          <div className={styles.resumen.titleGroup}>
            <div className={styles.resumen.iconBox}>
              <Clock className={styles.resumen.icon} />
            </div>
            <div>
              <h2 className={styles.resumen.titleText}>Línea de Tiempo</h2>
              <p className={styles.resumen.subtitle}>
                {primerEvento
                  ? `Desde ${primerEvento}`
                  : 'Historial completo del cliente'}
              </p>
            </div>
          </div>
          <span className={styles.resumen.badge}>
            <Activity className={styles.resumen.badgeIcon} />
            {total} registros
          </span>
        </div>

        {/* Stats Grid */}
        <div className={styles.resumen.statsGrid}>
          {stats.map(stat => (
            <div key={stat.label} className={styles.resumen.statCard}>
              <p className={styles.resumen.statValue}>{stat.value}</p>
              <p className={styles.resumen.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
