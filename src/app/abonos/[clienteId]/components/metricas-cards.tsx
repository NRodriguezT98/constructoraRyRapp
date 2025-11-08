'use client'

import { motion } from 'framer-motion'
import { Clock, DollarSign, TrendingUp } from 'lucide-react'

import { animations, metricasStyles } from '../styles/abonos-detalle.styles'

interface MetricasCardsProps {
  metricas: {
    valorTotal: number
    totalAbonado: number
    saldoPendiente: number
    porcentajePagado: number
  }
}

export function MetricasCards({ metricas }: MetricasCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className={metricasStyles.grid}>
      {/* Card 1: Valor Total */}
      <motion.div
        className={metricasStyles.card}
        variants={animations.fadeInUp}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.02, y: -5 }}
      >
        {/* Efecto de luz ambiental */}
        <div className={metricasStyles.cardLightEffect} style={{ background: 'rgb(59, 130, 246)' }} />

        <div className={metricasStyles.cardContent}>
          <div className={metricasStyles.iconWrapper}>
            <div className={metricasStyles.iconCircle} style={{ background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))' }}>
              <DollarSign className={metricasStyles.icon} />
            </div>
          </div>
          <p className={metricasStyles.label}>Valor Total</p>
          <p className={metricasStyles.value}>{formatCurrency(metricas.valorTotal)}</p>
        </div>
      </motion.div>

      {/* Card 2: Total Abonado (con barra de progreso) */}
      <motion.div
        className={metricasStyles.card}
        variants={animations.fadeInUp}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02, y: -5 }}
      >
        {/* Efecto de luz ambiental */}
        <div className={metricasStyles.cardLightEffect} style={{ background: 'rgb(34, 197, 94)' }} />

        <div className={metricasStyles.cardContent}>
          <div className={metricasStyles.iconWrapper}>
            <div className={metricasStyles.iconCircle} style={{ background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(16, 185, 129))' }}>
              <TrendingUp className={metricasStyles.icon} />
            </div>
            <span className={metricasStyles.progressText}>{metricas.porcentajePagado.toFixed(1)}%</span>
          </div>
          <p className={metricasStyles.label}>Total Abonado</p>
          <p className={metricasStyles.value}>{formatCurrency(metricas.totalAbonado)}</p>

          {/* Barra de progreso con animación */}
          <div className={metricasStyles.progressWrapper}>
            <div className={metricasStyles.progressBar}>
              <motion.div
                className={metricasStyles.progressFill}
                initial={{ width: 0 }}
                animate={{ width: `${metricas.porcentajePagado}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Card 3: Saldo Pendiente */}
      <motion.div
        className={metricasStyles.card}
        variants={animations.fadeInUp}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02, y: -5 }}
      >
        {/* Efecto de luz ambiental */}
        <div className={metricasStyles.cardLightEffect} style={{ background: 'rgb(249, 115, 22)' }} />

        <div className={metricasStyles.cardContent}>
          <div className={metricasStyles.iconWrapper}>
            <div className={metricasStyles.iconCircle} style={{ background: 'linear-gradient(135deg, rgb(249, 115, 22), rgb(251, 146, 60))' }}>
              <Clock className={metricasStyles.icon} />
            </div>
          </div>
          <p className={metricasStyles.label}>Saldo Pendiente</p>
          <p className={metricasStyles.value}>{formatCurrency(metricas.saldoPendiente)}</p>
        </div>
      </motion.div>
    </div>
  )
}
