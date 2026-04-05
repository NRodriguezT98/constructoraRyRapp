/**
 * ============================================
 * COMPONENTE: Métricas Dashboard
 * ============================================
 *
 * Muestra las 4 métricas principales de fuentes de pago
 * siguiendo el diseño compacto estándar del proyecto.
 */

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react'

import { formatCurrency } from '@/shared/utils/format'

import { fuentesPagoTabStyles as styles } from '../../fuentes-pago-tab.styles'
import type { MetricasFuentesPago } from '../hooks/useFuentesPagoTab'

interface MetricasDashboardProps {
  metricas: MetricasFuentesPago
}

export function MetricasDashboard({ metricas }: MetricasDashboardProps) {
  const metricasData = [
    {
      label: 'Valor Total Vivienda',
      value: formatCurrency(metricas.valorTotalVivienda),
      icon: DollarSign,
      variant: 'info' as const,
    },
    {
      label: 'Fuentes Configuradas',
      value: formatCurrency(metricas.totalFuentesConfiguradas),
      icon: TrendingUp,
      variant: (metricas.totalFuentesConfiguradas > 0
        ? 'success'
        : 'warning') as 'success' | 'warning',
    },
    {
      label: 'Saldo Pendiente',
      value: formatCurrency(Math.abs(metricas.saldoPendiente)),
      icon: metricas.saldoPendiente > 0 ? AlertTriangle : CheckCircle,
      variant: (metricas.saldoPendiente > 100
        ? 'warning'
        : metricas.saldoPendiente < -100
          ? 'danger'
          : 'success') as 'success' | 'warning' | 'danger',
    },
    {
      label: 'Progreso',
      value: `${metricas.porcentajeCompletado}%`,
      icon: TrendingUp,
      variant: (metricas.porcentajeCompletado >= 100
        ? 'success'
        : metricas.porcentajeCompletado >= 50
          ? 'warning'
          : 'danger') as 'success' | 'warning' | 'danger',
    },
  ]

  const getVariantStyles = (
    variant: 'success' | 'warning' | 'danger' | 'info'
  ) => {
    switch (variant) {
      case 'success':
        return {
          icon: styles.metricas.iconSuccess,
          value: styles.metricas.valueSuccess,
        }
      case 'warning':
        return {
          icon: styles.metricas.iconWarning,
          value: styles.metricas.valueWarning,
        }
      case 'danger':
        return {
          icon: styles.metricas.iconDanger,
          value: styles.metricas.valueDanger,
        }
      case 'info':
      default:
        return {
          icon: styles.metricas.iconInfo,
          value: styles.metricas.valueInfo,
        }
    }
  }

  return (
    <motion.div
      className={styles.metricas.container}
      variants={styles.animations.staggerChildren}
      initial='initial'
      animate='animate'
    >
      {metricasData.map((metrica, index) => {
        const variantStyles = getVariantStyles(metrica.variant)

        return (
          <motion.div
            key={metrica.label}
            className={styles.metricas.card}
            variants={styles.animations.fadeInUp}
            transition={{ delay: index * 0.1 }}
          >
            <div className={styles.metricas.cardContent}>
              <div className={variantStyles.icon}>
                <metrica.icon className={styles.metricas.icon} />
              </div>

              <div className={styles.metricas.textSection}>
                <p className={variantStyles.value}>{metrica.value}</p>
                <p className={styles.metricas.label}>{metrica.label}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
