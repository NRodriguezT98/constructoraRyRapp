'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronDown, DollarSign } from 'lucide-react'
import {
    formatCurrency,
    formatDateTime,
    getTipoCambioIcon,
    getTipoCambioLabel,
} from '../../hooks/useHistorialVersionesModal'
import type { SnapshotVersion } from '../../types/historial'
import { historialVersionesModalStyles as styles } from '../modals/HistorialVersionesModal.styles'
import { CambioVisual } from './CambioVisual'
import { ResumenCambios } from './ResumenCambios'

interface VersionCardProps {
  version: SnapshotVersion
  isExpanded: boolean
  onToggle: () => void
}

export function VersionCard({ version, isExpanded, onToggle }: VersionCardProps) {
  const fuentesPago = (version.fuentes_pago_snapshot || []) as any[]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.versionCard.container}
    >
      {/* Header */}
      <div className={styles.versionCard.header.container} onClick={onToggle}>
        <div className={styles.versionCard.header.content}>
          {/* Información */}
          <div className={styles.versionCard.header.leftSection}>
            <div className="flex items-center gap-2">
              <span className={styles.versionCard.header.versionBadge}>
                {getTipoCambioIcon(version.tipo_cambio)}
                v{version.version}
              </span>
            </div>
            <p className={styles.versionCard.header.typeLabel}>
              {getTipoCambioLabel(version.tipo_cambio)}
            </p>
            {version.razon_cambio && (
              <p className={styles.versionCard.header.reasonText}>
                {version.razon_cambio}
              </p>
            )}
            <p className={styles.versionCard.header.dateText}>
              {formatDateTime(version.created_at)}
            </p>
          </div>

          {/* Botón Expandir */}
          <button className={styles.versionCard.header.expandButton}>
            <ChevronDown
              className={
                isExpanded
                  ? styles.versionCard.header.expandIconRotated
                  : styles.versionCard.header.expandIcon
              }
            />
          </button>
        </div>
      </div>

      {/* Contenido Expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.versionCard.expanded.container}
          >
            {/* Campos Modificados */}
            {version.campos_modificados && version.campos_modificados.length > 0 && (
              <div className={styles.versionCard.expanded.badgeContainer}>
                {version.campos_modificados.map((campo, i) => (
                  <span key={i} className={styles.versionCard.expanded.badge}>
                    {campo}
                  </span>
                ))}
              </div>
            )}

            {/* Fuentes de Pago Snapshot */}
            {fuentesPago.length > 0 && (
              <div>
                <p className={styles.fuentesPago.title}>
                  <DollarSign className={styles.fuentesPago.titleIcon} />
                  Fuentes de Pago Activas en esta Versión
                </p>
                <div className={styles.fuentesPago.container}>
                  {fuentesPago.map((fuente: any, i: number) => (
                    <div key={i} className={styles.fuentesPago.card}>
                      <div className={styles.fuentesPago.cardHeader}>
                        <div>
                          <p className={styles.fuentesPago.cardType}>{fuente.tipo}</p>
                          {fuente.entidad && (
                            <p className={styles.fuentesPago.cardEntidad}>
                              {fuente.entidad}
                            </p>
                          )}
                        </div>
                        <p className={styles.fuentesPago.cardMonto}>
                          {formatCurrency(fuente.monto_aprobado || 0)}
                        </p>
                      </div>
                      {fuente.monto_recibido > 0 && (
                        <div className={styles.fuentesPago.cardRecibido}>
                          <CheckCircle2 className={styles.fuentesPago.cardRecibidoIcon} />
                          Recibido: {formatCurrency(fuente.monto_recibido)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen de Cambios (motivo + estadísticas) */}
            {version.datos_nuevos && <ResumenCambios version={version} />}

            {/* Cambio Visual (diff anterior vs nuevo) */}
            {version.datos_anteriores && version.datos_nuevos && (
              <CambioVisual version={version} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
