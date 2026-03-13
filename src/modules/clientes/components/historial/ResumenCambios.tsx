'use client'

import { FileText } from 'lucide-react'
import type { SnapshotVersion } from '../../types/historial'
import { historialVersionesModalStyles as styles } from '../modals/HistorialVersionesModal.styles'

interface ResumenCambiosProps {
  version: SnapshotVersion
}

export function ResumenCambios({ version }: ResumenCambiosProps) {
  const datos = version.datos_nuevos as any

  // Si no tiene motivo_usuario, no mostrar nada
  if (!datos?.motivo_usuario) return null

  const { motivo_usuario, resumen } = datos

  return (
    <div className={styles.resumen.container}>
      {/* Motivo del Usuario */}
      <div className={styles.resumen.motivoBox}>
        <p className={styles.resumen.motivoLabel}>
          <FileText className={styles.resumen.motivoIcon} />
          Motivo del cambio:
        </p>
        <p className={styles.resumen.motivoText}>{motivo_usuario}</p>
      </div>

      {/* Estadísticas de Cambios */}
      {resumen &&
        (resumen.agregadas > 0 || resumen.eliminadas > 0 || resumen.modificadas > 0) && (
          <div className={styles.resumen.statsGrid}>
            {resumen.agregadas > 0 && (
              <div className={styles.resumen.statCard.agregada}>
                <p className={styles.resumen.statValue.agregada}>+{resumen.agregadas}</p>
                <p className={styles.resumen.statLabel.agregada}>Agregada(s)</p>
              </div>
            )}
            {resumen.eliminadas > 0 && (
              <div className={styles.resumen.statCard.eliminada}>
                <p className={styles.resumen.statValue.eliminada}>-{resumen.eliminadas}</p>
                <p className={styles.resumen.statLabel.eliminada}>Eliminada(s)</p>
              </div>
            )}
            {resumen.modificadas > 0 && (
              <div className={styles.resumen.statCard.modificada}>
                <p className={styles.resumen.statValue.modificada}>✏️{resumen.modificadas}</p>
                <p className={styles.resumen.statLabel.modificada}>Modificada(s)</p>
              </div>
            )}
          </div>
        )}
    </div>
  )
}
