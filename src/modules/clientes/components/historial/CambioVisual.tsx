'use client'

import { ChevronDown } from 'lucide-react'

import { formatCurrency } from '../../hooks/useHistorialVersionesModal'
import type { SnapshotVersion } from '../../types/historial'
import { historialVersionesModalStyles as styles } from '../modals/HistorialVersionesModal.styles'

interface CambioVisualProps {
  version: SnapshotVersion
}

export function CambioVisual({ version }: CambioVisualProps) {
  type DatosCambio = {
    monto_aprobado?: number
    entidad?: string | null
    tipo?: string
  }
  const anterior = version.datos_anteriores as DatosCambio | undefined
  const nuevo = version.datos_nuevos as DatosCambio | undefined

  if (!anterior || !nuevo) return null

  // Detectar qué cambió de forma visual
  const cambios = []

  if (anterior.monto_aprobado !== nuevo.monto_aprobado) {
    cambios.push({
      campo: 'Monto Aprobado',
      anterior: formatCurrency(anterior.monto_aprobado ?? 0),
      nuevo: formatCurrency(nuevo.monto_aprobado ?? 0),
      tipo:
        (anterior.monto_aprobado ?? 0) > (nuevo.monto_aprobado ?? 0)
          ? 'disminuyo'
          : 'aumento',
    })
  }

  if (anterior.entidad !== nuevo.entidad) {
    cambios.push({
      campo: 'Entidad',
      anterior: anterior.entidad || 'Sin entidad',
      nuevo: nuevo.entidad || 'Sin entidad',
      tipo: 'cambio',
    })
  }

  if (anterior.tipo !== nuevo.tipo) {
    cambios.push({
      campo: 'Tipo de Fuente',
      anterior: anterior.tipo,
      nuevo: nuevo.tipo,
      tipo: 'cambio',
    })
  }

  if (cambios.length === 0) return null

  return (
    <div className={styles.cambio.container}>
      <p className={styles.cambio.title}>Cambios realizados:</p>
      {cambios.map((cambio, i) => (
        <div key={i} className={styles.cambio.cambioCard}>
          <p className={styles.cambio.cambioLabel}>{cambio.campo}</p>
          <div className={styles.cambio.cambioContent}>
            {/* Valor Anterior */}
            <div className={styles.cambio.valorAnterior.container}>
              <p className={styles.cambio.valorAnterior.label}>Antes:</p>
              <p className={styles.cambio.valorAnterior.value}>
                {cambio.anterior}
              </p>
            </div>

            {/* Flecha */}
            <div className={styles.cambio.arrow}>
              <ChevronDown className={styles.cambio.arrowIcon} />
            </div>

            {/* Valor Nuevo */}
            <div className={styles.cambio.valorNuevo.container}>
              <p className={styles.cambio.valorNuevo.label}>Ahora:</p>
              <p className={styles.cambio.valorNuevo.value}>{cambio.nuevo}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
