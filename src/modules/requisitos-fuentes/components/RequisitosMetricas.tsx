/**
 * ============================================
 * COMPONENTE: Métricas de Requisitos
 * ============================================
 * Tarjetas superiores que muestran estadísticas compactas.
 * Componente PRESENTACIONAL puro (sin lógica).
 */

'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, FileText, Target } from 'lucide-react'

import { requisitosConfigStyles as styles } from '../styles/requisitos-config.styles'
import type { RequisitoFuenteConfig } from '../types'

interface RequisitosMetricasProps {
  requisitos: RequisitoFuenteConfig[]
}

export function RequisitosMetricas({ requisitos }: RequisitosMetricasProps) {
  // Cálculo de métricas
  const total = requisitos.length
  const obligatorios = requisitos.filter(
    r => r.nivel_validacion === 'DOCUMENTO_OBLIGATORIO'
  ).length
  const opcionales = requisitos.filter(
    r => r.nivel_validacion === 'DOCUMENTO_OPCIONAL'
  ).length
  const confirmaciones = requisitos.filter(
    r => r.nivel_validacion === 'SOLO_CONFIRMACION'
  ).length

  const metricas = [
    {
      id: 1,
      label: 'Total Requisitos',
      value: total,
      icon: FileText,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-500/20 to-indigo-500/20',
      textGradient: 'from-blue-600 via-indigo-600 to-blue-600',
    },
    {
      id: 2,
      label: 'Obligatorios',
      value: obligatorios,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-500/20 to-rose-500/20',
      textGradient: 'from-red-600 via-rose-600 to-red-600',
    },
    {
      id: 3,
      label: 'Opcionales',
      value: opcionales,
      icon: Target,
      gradient: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-500/20 to-orange-500/20',
      textGradient: 'from-yellow-600 via-orange-600 to-yellow-600',
    },
    {
      id: 4,
      label: 'Solo Confirmación',
      value: confirmaciones,
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      textGradient: 'from-green-600 via-emerald-600 to-green-600',
    },
  ]

  return (
    <div className={styles.metricas.grid}>
      {metricas.map((metrica, index) => (
        <motion.div
          key={metrica.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.02, y: -4 }}
          className={`${styles.metricas.card}`}
        >
          {/* Gradiente de fondo (hover) */}
          <div
            className={`${styles.metricas.cardGradient} bg-gradient-to-br ${metrica.bgGradient}`}
          />

          <div className='relative z-10 flex items-center gap-3'>
            {/* Icono */}
            <div
              className={`${styles.metricas.iconBox} bg-gradient-to-br ${metrica.gradient} shadow-${metrica.gradient.split('-')[1]}-500/50`}
            >
              <metrica.icon className={styles.metricas.icon} />
            </div>

            {/* Valor y label */}
            <div className='flex-1'>
              <p
                className={`${styles.metricas.value} bg-gradient-to-br ${metrica.textGradient}`}
              >
                {metrica.value}
              </p>
              <p
                className={`${styles.metricas.label} text-gray-600 dark:text-gray-400`}
              >
                {metrica.label}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
