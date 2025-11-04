/**
 * 📊 COMPONENTE: HEADER PROCESO
 *
 * Muestra el progreso del proceso con:
 * - Barra de progreso animada
 * - Estadísticas (Completados, En Proceso, Pendientes, Total)
 * - Botón de recarga de plantilla (solo en modo desarrollo)
 */

'use client'

import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { timelineProcesoStyles as styles } from './timeline-proceso.styles'

interface Progreso {
  pasosCompletados: number
  pasosEnProceso: number
  pasosPendientes: number
  pasosOmitidos: number
  totalPasos: number
  porcentajeCompletado: number
}

interface HeaderProcesoProps {
  progreso: Progreso
  onRecargarPlantilla?: () => void
  recargando?: boolean
}

export function HeaderProceso({ progreso, onRecargarPlantilla, recargando }: HeaderProcesoProps) {
  if (!progreso) return null

  return (
    <div className={styles.header.container}>
      <div className={styles.header.topRow}>
        <h2 className={styles.header.title}>Proceso de Compra</h2>
        <div className={styles.header.actions}>
          <span className={styles.header.badge}>
            {progreso.porcentajeCompletado}% Completado
          </span>

          {/* 🔧 Botón de Desarrollo */}
          {onRecargarPlantilla && (
            <button
              onClick={onRecargarPlantilla}
              disabled={recargando}
              className={styles.header.devButton}
              title="Recargar pasos desde plantilla predeterminada (solo desarrollo)"
            >
              <RefreshCw className={`w-4 h-4 ${recargando ? 'animate-spin' : ''}`} />
              <span className={styles.header.devButtonText}>
                {recargando ? 'Recargando...' : '🔧 DEV: Recargar Plantilla'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className={styles.header.progressBar.container}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progreso.porcentajeCompletado}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={styles.header.progressBar.fill}
        />
      </div>

      {/* Estadísticas */}
      <div className={styles.header.stats.grid}>
        <div className={styles.header.stats.item}>
          <div className={styles.header.stats.value}>{progreso.pasosCompletados}</div>
          <div className={styles.header.stats.label}>Completados</div>
        </div>
        <div className={styles.header.stats.item}>
          <div className={styles.header.stats.value}>{progreso.pasosOmitidos || 0}</div>
          <div className={styles.header.stats.label}>Omitidos</div>
        </div>
        <div className={styles.header.stats.item}>
          <div className={styles.header.stats.value}>{progreso.pasosEnProceso || 0}</div>
          <div className={styles.header.stats.label}>En Proceso</div>
        </div>
        <div className={styles.header.stats.item}>
          <div className={styles.header.stats.value}>{progreso.pasosPendientes}</div>
          <div className={styles.header.stats.label}>Pendientes</div>
        </div>
        <div className={styles.header.stats.item}>
          <div className={styles.header.stats.value}>{progreso.totalPasos}</div>
          <div className={styles.header.stats.label}>Total</div>
        </div>
      </div>
    </div>
  )
}
