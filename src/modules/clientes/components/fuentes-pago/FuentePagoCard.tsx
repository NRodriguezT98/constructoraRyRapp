'use client'

/**
 * ============================================
 * COMPONENTE: FuentePagoCard
 * ============================================
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * Tarjeta individual de fuente de pago con estado de documentación
 *
 * Features:
 * - Estado visual de documentación (Completo/Pendiente/No Requerida)
 * - Botón para subir carta si está pendiente
 * - Progreso de abonos
 * - Diseño compacto y profesional
 *
 * @version 1.0.0 - 2025-12-01
 */

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, DollarSign, FileText, Upload } from 'lucide-react'

import { fuentePagoCardStyles as styles } from './FuentePagoCard.styles'

// ============================================
// TYPES
// ============================================

export interface FuentePago {
  id: string
  tipo: string
  monto_aprobado: number
  monto_recibido: number
  entidad?: string
  numero_referencia?: string
  estado_documentacion?: string
  carta_aprobacion_url?: string
  saldo_pendiente?: number
  porcentaje_completado?: number
}

interface FuentePagoCardProps {
  fuente: FuentePago
  onSubirCarta?: (fuenteId: string) => void
}

// ============================================
// COMPONENTE
// ============================================

export function FuentePagoCard({ fuente, onSubirCarta }: FuentePagoCardProps) {
  const {
    tipo,
    monto_aprobado,
    monto_recibido,
    entidad,
    estado_documentacion,
    carta_aprobacion_url,
    saldo_pendiente,
    porcentaje_completado,
  } = fuente

  // Estados de documentación
  const estadoDoc = estado_documentacion || 'Sin Documentación Requerida'
  const requiereDocumento = tipo !== 'Cuota Inicial'
  const documentoPendiente = requiereDocumento && estadoDoc === 'Pendiente Documentación'
  const documentoCompleto = estadoDoc === 'Completo' || !requiereDocumento

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.container}
    >
      {/* Header con tipo y estado doc */}
      <div className={styles.header}>
        <div className="flex items-center gap-2">
          <div className={styles.iconWrapper}>
            <DollarSign className={styles.icon} />
          </div>
          <div>
            <h4 className={styles.title}>{tipo}</h4>
            {entidad && <p className={styles.subtitle}>{entidad}</p>}
          </div>
        </div>

        {/* Badge de estado de documentación */}
        <div>
          {documentoCompleto ? (
            <div className={styles.badge.completo}>
              <CheckCircle2 className={styles.badge.icon} />
              <span>Completo</span>
            </div>
          ) : documentoPendiente ? (
            <div className={styles.badge.pendiente}>
              <AlertCircle className={styles.badge.icon} />
              <span>Doc. Pendiente</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Montos y progreso */}
      <div className={styles.body}>
        <div className={styles.montos.grid}>
          <div>
            <p className={styles.montos.label}>Monto Aprobado:</p>
            <p className={styles.montos.valor}>
              ${monto_aprobado.toLocaleString('es-CO')}
            </p>
          </div>
          <div>
            <p className={styles.montos.label}>Recibido:</p>
            <p className={styles.montos.valorRecibido}>
              ${monto_recibido.toLocaleString('es-CO')}
            </p>
          </div>
          <div>
            <p className={styles.montos.label}>Saldo:</p>
            <p className={styles.montos.valorSaldo}>
              ${(saldo_pendiente || 0).toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className={styles.progreso.container}>
          <div className={styles.progreso.barra}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${porcentaje_completado || 0}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={styles.progreso.relleno}
            />
          </div>
          <p className={styles.progreso.texto}>
            {(porcentaje_completado || 0).toFixed(1)}% pagado
          </p>
        </div>
      </div>

      {/* Footer: Botón subir carta si está pendiente */}
      {documentoPendiente && (
        <div className={styles.footer}>
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="flex-1 text-xs text-orange-700 dark:text-orange-300">
              <strong>Carta de aprobación pendiente.</strong> Súbela para completar la documentación.
            </p>
          </div>
          <button
            onClick={() => onSubirCarta?.(fuente.id)}
            className={styles.botonSubir}
          >
            <Upload className="w-4 h-4" />
            <span>Subir Carta</span>
          </button>
        </div>
      )}
    </motion.div>
  )
}
