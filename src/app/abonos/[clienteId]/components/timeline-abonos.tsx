'use client'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import type { AbonoHistorial } from '@/modules/abonos/types'
import { motion } from 'framer-motion'
import { Banknote, Building, Calendar, CheckCircle, CreditCard, FileText, Wallet } from 'lucide-react'
import { animations, timelineStyles } from '../styles/abonos-detalle.styles'

interface TimelineAbonosProps {
  abonos: AbonoHistorial[]
  loading: boolean
}

export function TimelineAbonos({ abonos, loading }: TimelineAbonosProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Ícono basado en método de pago
  const getPaymentIcon = (metodo: string) => {
    const metodLower = metodo.toLowerCase()
    if (metodLower.includes('transferencia')) return <CreditCard className={timelineStyles.methodIcon} />
    if (metodLower.includes('efectivo')) return <Banknote className={timelineStyles.methodIcon} />
    if (metodLower.includes('cheque')) return <FileText className={timelineStyles.methodIcon} />
    if (metodLower.includes('consignación')) return <Building className={timelineStyles.methodIcon} />
    return <Wallet className={timelineStyles.methodIcon} />
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className={timelineStyles.section}>
        <div className={timelineStyles.header}>
          <h2 className={timelineStyles.title}>
            <Calendar className={timelineStyles.titleIcon} />
            Historial de Abonos
          </h2>
        </div>
        <div className={timelineStyles.loadingState}>
          <div className={timelineStyles.loadingCard} />
          <div className={timelineStyles.loadingCard} />
          <div className={timelineStyles.loadingCard} />
        </div>
      </div>
    )
  }

  // Empty state
  if (!abonos || abonos.length === 0) {
    return (
      <div className={timelineStyles.section}>
        <div className={timelineStyles.header}>
          <h2 className={timelineStyles.title}>
            <Calendar className={timelineStyles.titleIcon} />
            Historial de Abonos
          </h2>
        </div>
        <div className={timelineStyles.emptyState}>
          <Calendar className={timelineStyles.emptyIcon} />
          <p className={timelineStyles.emptyTitle}>No hay abonos registrados</p>
          <p className={timelineStyles.emptySubtitle}>
            Los abonos registrados aparecerán aquí
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={timelineStyles.section}>
      <div className={timelineStyles.header}>
        <h2 className={timelineStyles.title}>
          <Calendar className={timelineStyles.titleIcon} />
          Historial de Abonos
        </h2>
      </div>

      <div className={timelineStyles.timelineWrapper}>
        {/* Línea vertical con gradiente */}
        <div className={timelineStyles.timelineLine} />

        <div className={timelineStyles.timelineContent}>
          {abonos.map((abono, index) => (
            <motion.div
              key={abono.id}
              className={timelineStyles.itemWrapper}
              variants={animations.fadeInLeft}
              transition={{ delay: index * 0.05 }}
            >
              {/* Dot con ícono */}
              <div className={timelineStyles.itemDot}>
                <div className={timelineStyles.dotCircle}>
                  <CheckCircle className={timelineStyles.dotIcon} />
                </div>

                {/* Efecto pulse solo en el primer abono (más reciente) */}
                {index === 0 && (
                  <motion.div
                    className={timelineStyles.dotPulse}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </div>

              {/* Card de abono */}
              <motion.div
                className={timelineStyles.card}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className={timelineStyles.cardHeader}>
                  <div>
                    {/* Referencia como header principal */}
                    <div className={timelineStyles.badgeWrapper}>
                      <span className={timelineStyles.badge}>
                        {abono.numero_referencia || `Abono #${abonos.length - index}`}
                      </span>
                      <span className={timelineStyles.date}>
                        {formatDateForDisplay(abono.fecha_abono)}
                      </span>
                    </div>
                    <p className={timelineStyles.amount}>
                      {formatCurrency(abono.monto)}
                    </p>
                  </div>

                  <div className={timelineStyles.methodBadge}>
                    {getPaymentIcon(abono.metodo_pago)}
                    <span className={timelineStyles.methodText}>
                      {abono.metodo_pago}
                    </span>
                  </div>
                </div>

                {/* Notas */}
                {abono.notas && (
                  <div className={timelineStyles.notesWrapper}>
                    <p className={timelineStyles.notesText}>{abono.notas}</p>
                  </div>
                )}

                {/* Comprobante */}
                {abono.comprobante_url && (
                  <div className="mt-3">
                    <a
                      href={abono.comprobante_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      Ver comprobante
                    </a>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
