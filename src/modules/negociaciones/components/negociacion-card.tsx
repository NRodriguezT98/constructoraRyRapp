/**
 * Card de Negociación
 * Componente presentacional puro
 */

'use client'

import { motion } from 'framer-motion'
import { Building2, DollarSign, Home, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import * as styles from '../styles/negociaciones.styles'
import type { NegociacionConRelaciones } from '../types'

interface NegociacionCardProps {
  negociacion: NegociacionConRelaciones
  formatearMoneda: (valor: number) => string
  obtenerColorEstado: (estado: string) => {
    bg: string
    text: string
    border: string
  }
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

export function NegociacionCard({
  negociacion,
  formatearMoneda,
  obtenerColorEstado,
}: NegociacionCardProps) {
  const coloresEstado = obtenerColorEstado(negociacion.estado)
  const progreso = negociacion.total_fuentes_pago > 0
    ? (negociacion.total_fuentes_pago / negociacion.valor_total) * 100
    : 0

  return (
    <motion.div variants={cardVariants}>
      <Link href={`/clientes/${negociacion.cliente_id}?tab=negociaciones`}>
        <div className={`${styles.cardClasses.container} ${coloresEstado.border}`}>
          {/* HEADER */}
          <div className={styles.cardClasses.header}>
            <div className={styles.cardClasses.headerInfo}>
              <div className={styles.cardClasses.cliente}>
                {negociacion.cliente?.nombre_completo || 'Sin cliente'}
              </div>
              <div className={styles.cardClasses.documento}>
                {negociacion.cliente?.numero_documento || '-'}
              </div>
            </div>
            <div className={`${styles.cardClasses.estadoBadge} ${coloresEstado.bg} ${coloresEstado.text}`}>
              {negociacion.estado}
            </div>
          </div>

          <div className={styles.cardClasses.divider} />

          {/* INFO */}
          <div className={styles.cardClasses.info}>
            {/* Vivienda */}
            <div className={styles.cardClasses.infoItem}>
              <Home className={`${styles.cardClasses.infoIcon} text-blue-600 dark:text-blue-400`} />
              <div>
                <div className={styles.cardClasses.infoLabel}>Vivienda</div>
                <div className={styles.cardClasses.infoValue}>
                  {(negociacion.vivienda as any)?.numero || '-'}
                </div>
              </div>
            </div>

            {/* Proyecto */}
            <div className={styles.cardClasses.infoItem}>
              <Building2 className={`${styles.cardClasses.infoIcon} text-purple-600 dark:text-purple-400`} />
              <div>
                <div className={styles.cardClasses.infoLabel}>Proyecto</div>
                <div className={styles.cardClasses.infoValue}>
                  {(negociacion.vivienda as any)?.manzana?.proyecto?.nombre || '-'}
                </div>
              </div>
            </div>

            {/* Valor Negociado */}
            <div className={styles.cardClasses.infoItem}>
              <DollarSign className={`${styles.cardClasses.infoIcon} text-green-600 dark:text-green-400`} />
              <div>
                <div className={styles.cardClasses.infoLabel}>Valor</div>
                <div className={styles.cardClasses.infoValue}>
                  {formatearMoneda(negociacion.valor_total)}
                </div>
              </div>
            </div>

            {/* Fuentes de Pago */}
            <div className={styles.cardClasses.infoItem}>
              <TrendingUp className={`${styles.cardClasses.infoIcon} text-indigo-600 dark:text-indigo-400`} />
              <div>
                <div className={styles.cardClasses.infoLabel}>Recibido</div>
                <div className={`${styles.cardClasses.infoValue} text-green-600 dark:text-green-400`}>
                  {formatearMoneda(negociacion.total_fuentes_pago)}
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESO */}
          <div className={styles.cardClasses.progress}>
            <div className={styles.cardClasses.progressBar}>
              <div
                className={`${styles.cardClasses.progressFill} ${
                  progreso >= 100
                    ? 'bg-green-500'
                    : progreso >= 50
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(progreso, 100)}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Progreso: {Math.round(progreso)}%
              </span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                Saldo: {formatearMoneda(negociacion.valor_total - negociacion.total_fuentes_pago)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
