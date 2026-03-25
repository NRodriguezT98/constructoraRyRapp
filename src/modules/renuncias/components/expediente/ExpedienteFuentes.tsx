'use client'

import { Building2, Landmark } from 'lucide-react'

import type { FuenteExpediente } from '../../types'
import { formatCOP } from '../../utils/renuncias.utils'
import { expedienteStyles as styles } from './ExpedienteRenunciaPage.styles'

interface ExpedienteFuentesProps {
  fuentes: FuenteExpediente[]
}

const FUENTE_COLORS: Record<string, { bg: string; text: string }> = {
  'Cuota Inicial': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  'Crédito Hipotecario': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  'Subsidio Mi Casa Ya': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  'Subsidio Comfandi': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  'Cesantías': { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400' },
}

const DEFAULT_COLOR = { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400' }

export function ExpedienteFuentes({ fuentes }: ExpedienteFuentesProps) {
  if (fuentes.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 dark:text-gray-500">
        <Landmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay fuentes de pago registradas en la snapshot</p>
      </div>
    )
  }

  return (
    <div className={styles.fuentes.list}>
      {fuentes.map((fuente, idx) => {
        const colorConfig = FUENTE_COLORS[fuente.tipo] ?? DEFAULT_COLOR
        const porcentaje = fuente.monto_aprobado > 0
          ? Math.min(100, (fuente.monto_recibido / fuente.monto_aprobado) * 100)
          : 0

        return (
          <div key={`${fuente.tipo}-${idx}`} className={styles.fuentes.card}>
            {/* Header */}
            <div className={styles.fuentes.cardHeader}>
              <span className={`${styles.fuentes.tipoBadge} ${colorConfig.bg} ${colorConfig.text}`}>
                <Building2 className="w-3 h-3" />
                {fuente.tipo}
              </span>
              <span className={styles.fuentes.estadoBadge}>Inactivada</span>
            </div>

            {/* Entidad */}
            {fuente.entidad ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{fuente.entidad}</p>
            ) : null}

            {/* Barra de progreso */}
            <div className={styles.fuentes.progressBar}>
              <div className={styles.fuentes.progressFill} style={{ width: `${porcentaje}%` }} />
            </div>

            {/* Montos */}
            <div className="space-y-1.5 mt-3">
              <div className={styles.fuentes.montoRow}>
                <span className={styles.fuentes.montoLabel}>Aprobado</span>
                <span className={styles.fuentes.montoValue}>{formatCOP(fuente.monto_aprobado)}</span>
              </div>
              <div className={styles.fuentes.montoRow}>
                <span className={styles.fuentes.montoLabel}>Recibido</span>
                <span className={styles.fuentes.montoValue}>{formatCOP(fuente.monto_recibido)}</span>
              </div>
              <div className={styles.fuentes.montoRow}>
                <span className={styles.fuentes.montoLabel}>Avance</span>
                <span className={styles.fuentes.montoValue}>{porcentaje.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
