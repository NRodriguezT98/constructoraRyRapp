'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, DollarSign, FileX } from 'lucide-react'

import {
  metricasIconColors as colors,
  renunciasStyles as styles,
} from '../styles/renuncias.styles'
import type { MetricasRenuncias } from '../types'
import { formatCOP } from '../utils/renuncias.utils'

interface RenunciasMetricasPremiumProps {
  metricas: MetricasRenuncias
}

export function RenunciasMetricasPremium({
  metricas,
}: RenunciasMetricasPremiumProps) {
  const items = [
    {
      icon: FileX,
      label: 'Total Renuncias',
      displayValue: metricas.total.toString(),
      ...colors.total,
    },
    {
      icon: AlertTriangle,
      label: 'Pendientes Devolución',
      displayValue: metricas.pendientes.toString(),
      ...colors.pendientes,
    },
    {
      icon: CheckCircle2,
      label: 'Cerradas',
      displayValue: metricas.cerradas.toString(),
      ...colors.cerradas,
    },
    {
      icon: DollarSign,
      label: 'Total Devuelto',
      displayValue: formatCOP(metricas.totalDevuelto),
      ...colors.devuelto,
    },
  ]

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={styles.metricas.grid}
    >
      {items.map((item, _i) => (
        <motion.div
          key={item.label}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={styles.metricas.card}
        >
          <div className={`${styles.metricas.cardGlow} ${item.glow}`} />
          <div className={styles.metricas.content}>
            <div
              className={`${styles.metricas.iconCircle} ${item.bg} ${item.shadow}`}
            >
              <item.icon className={styles.metricas.icon} />
            </div>
            <div className={styles.metricas.textGroup}>
              <p className={`${styles.metricas.value} ${item.value}`}>
                {item.displayValue}
              </p>
              <p className={styles.metricas.label}>{item.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
