'use client'

import { motion } from 'framer-motion'
import { Banknote, CheckCircle, DollarSign, FileX, Handshake, TrendingUp } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'

import type { TimelineHito } from '../../types'
import { expedienteStyles as styles } from './ExpedienteRenunciaPage.styles'

const ICON_MAP: Record<string, React.ElementType> = {
  Handshake,
  DollarSign,
  TrendingUp,
  FileX,
  CheckCircle,
  Banknote,
}

interface ExpedienteTimelineProps {
  hitos: TimelineHito[]
}

export function ExpedienteTimeline({ hitos }: ExpedienteTimelineProps) {
  if (hitos.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={styles.timeline.container}
    >
      <p className={styles.timeline.title}>📅 Línea de Tiempo</p>

      {/* Track wrapper with continuous connector line behind circles */}
      <div className="relative">
        <div className={styles.timeline.track}>
          {hitos.map((hito, idx) => {
            const Icon = ICON_MAP[hito.icono] ?? FileX
            const isLast = idx === hitos.length - 1

            return (
              <div key={hito.label} className="flex-1 flex items-start">
                {/* Hito + connector in horizontal flex */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.08, type: 'spring', stiffness: 300 }}
                  className="flex flex-col items-center text-center w-full relative"
                >
                  {/* Connector line — rendered BEFORE circle so it's behind (z-order) */}
                  {!isLast ? (
                    <div
                      className="absolute h-0.5 bg-gradient-to-r from-red-400 to-rose-400 dark:from-red-600 dark:to-rose-600"
                      style={{ top: '20px', left: '50%', right: '-50%' }}
                    />
                  ) : null}

                  {/* Icon circle — z-10 so it sits ON TOP of connector lines */}
                  <div className={`relative z-10 ${styles.timeline.hitoIconCircle} ${hito.completado ? styles.timeline.hitoIconActive : styles.timeline.hitoIconPending}`}>
                    <Icon className={styles.timeline.hitoIcon} />
                  </div>

                  {/* Label + fecha */}
                  <p className={styles.timeline.hitoLabel}>{hito.label}</p>
                  <p className={styles.timeline.hitoFecha}>{formatDateCompact(hito.fecha)}</p>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
