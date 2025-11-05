/**
 * ProyectosMetricasPremium - Tarjetas de estadísticas compactas
 * ✅ 4 cards con diseño premium
 * ✅ Gradientes únicos por métrica
 * ✅ Hover effects
 * ✅ Animaciones Framer Motion
 */

'use client'

import { motion } from 'framer-motion'
import { Building2, CheckCircle2, Clock } from 'lucide-react'
import { proyectosPageStyles as styles } from '../styles/proyectos-page.styles'

interface ProyectosMetricasPremiumProps {
  totalProyectos: number
  enProceso: number
  completados: number
}

export function ProyectosMetricasPremium({
  totalProyectos,
  enProceso,
  completados,
}: ProyectosMetricasPremiumProps) {
  return (
    <motion.div {...styles.animations.metricas} className={styles.metricas.grid}>
      {/* Card 1: Total Proyectos (Verde) */}
      <motion.div {...styles.animations.metricaCard} className={styles.metricas.card}>
        <div className={styles.metricas.cardGlowGreen} />
        <div className={styles.metricas.content}>
          <div className={styles.metricas.iconCircleGreen}>
            <Building2 className={styles.metricas.icon} />
          </div>
          <div className={styles.metricas.textGroup}>
            <p className={styles.metricas.valueGreen}>{totalProyectos}</p>
            <p className={styles.metricas.label}>Total Proyectos</p>
          </div>
        </div>
      </motion.div>

      {/* Card 2: En Proceso (Azul) */}
      <motion.div {...styles.animations.metricaCard} className={styles.metricas.card}>
        <div className={styles.metricas.cardGlowBlue} />
        <div className={styles.metricas.content}>
          <div className={styles.metricas.iconCircleBlue}>
            <Clock className={styles.metricas.icon} />
          </div>
          <div className={styles.metricas.textGroup}>
            <p className={styles.metricas.valueBlue}>{enProceso}</p>
            <p className={styles.metricas.label}>En Proceso</p>
          </div>
        </div>
      </motion.div>

      {/* Card 3: Completados (Púrpura) */}
      <motion.div {...styles.animations.metricaCard} className={styles.metricas.card}>
        <div className={styles.metricas.cardGlowPurple} />
        <div className={styles.metricas.content}>
          <div className={styles.metricas.iconCirclePurple}>
            <CheckCircle2 className={styles.metricas.icon} />
          </div>
          <div className={styles.metricas.textGroup}>
            <p className={styles.metricas.valuePurple}>{completados}</p>
            <p className={styles.metricas.label}>Completados</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
