'use client'

import { BotonRegistrarDesembolso } from '@/modules/abonos/components/BotonRegistrarDesembolso'
import type { FuentePagoConAbonos } from '@/modules/abonos/types'
import { motion } from 'framer-motion'
import { Banknote, Building2, Clock, Gift, Home } from 'lucide-react'
import { animations, colorSchemes, fuentesStyles } from '../styles/abonos-detalle.styles'

interface FuentePagoCardProps {
  fuente: FuentePagoConAbonos
  negociacionId: string  // ✅ NUEVO: Necesario para validación
  onRegistrarAbono: (fuente: FuentePagoConAbonos) => void
  index: number
  validacion?: {
    puedeRegistrarAbono: boolean
    estaCompletamentePagada: boolean
    razonBloqueo?: string
  }
}

export function FuentePagoCard({ fuente, negociacionId, onRegistrarAbono, index, validacion }: FuentePagoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Seleccionar esquema de color basado en tipo de fuente
  const colorScheme = colorSchemes[fuente.tipo as keyof typeof colorSchemes] || {
    from: 'rgb(59, 130, 246)',
    to: 'rgb(37, 99, 235)'
  }

  // Calcular progreso
  const porcentajeCompletado = fuente.monto_aprobado > 0
    ? (fuente.monto_recibido / fuente.monto_aprobado) * 100
    : 0

  // Seleccionar ícono según tipo de fuente
  const getIconForFuente = () => {
    switch (fuente.tipo) {
      case 'Cuota Inicial':
        return Home
      case 'Crédito Hipotecario':
        return Building2
      case 'Subsidio Mi Casa Ya':
      case 'Subsidio Caja Compensación':
        return Gift
      default:
        return Banknote
    }
  }

  const IconComponent = getIconForFuente()

  // Clase condicional para card completada
  const cardClassName = validacion?.estaCompletamentePagada
    ? `${fuentesStyles.card} ${fuentesStyles.cardCompletada}`
    : fuentesStyles.card

  return (
    <motion.div
      className={cardClassName}
      variants={animations.fadeInUp}
      transition={{ delay: 0.3 + index * 0.1 }}
    >
      {/* Borde lateral con gradiente (verde si está completada) */}
      <div
        className={fuentesStyles.cardBorder}
        style={{
          background: validacion?.estaCompletamentePagada
            ? 'linear-gradient(to bottom, rgb(34, 197, 94), rgb(22, 163, 74))'
            : `linear-gradient(to bottom, ${colorScheme.from}, ${colorScheme.to})`
        }}
      />

      <div className={fuentesStyles.cardContent}>
        {/* Header con tipo de fuente y botón */}
        <div className={fuentesStyles.cardHeader}>
          <div className={fuentesStyles.iconSection}>
            {/* Ícono circular con gradiente */}
            <div
              className={fuentesStyles.iconCircle}
              style={{ background: `linear-gradient(135deg, ${colorScheme.from}, ${colorScheme.to})` }}
            >
              <IconComponent className={fuentesStyles.iconImage} />
            </div>

            {/* Info de fuente */}
            <div className={fuentesStyles.infoWrapper}>
              <h3 className={fuentesStyles.infoTitle}>{fuente.tipo}</h3>
              <p className={fuentesStyles.infoSubtitle}>
                <Clock className={fuentesStyles.infoIcon} />
                {fuente.fecha_creacion
                  ? new Date(fuente.fecha_creacion).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'Sin fecha'}
              </p>
            </div>
          </div>

          {/* Botón de registrar abono/desembolso con validación */}
          <BotonRegistrarDesembolso
            negociacionId={negociacionId}
            tipoFuente={fuente.tipo}
            fuenteCompletada={validacion?.estaCompletamentePagada || false}
            onClick={() => onRegistrarAbono(fuente)}
            className={fuentesStyles.button}
            colorScheme={colorScheme}
          />
        </div>

        {/* Grid de métricas */}
        <div className={fuentesStyles.metricsGrid}>
          <div className={fuentesStyles.metricItem}>
            <p className={fuentesStyles.metricLabel}>Aprobado</p>
            <p className={fuentesStyles.metricValue} style={{ color: colorScheme.from }}>
              {formatCurrency(fuente.monto_aprobado)}
            </p>
          </div>

          <div className={fuentesStyles.metricItem}>
            <p className={fuentesStyles.metricLabel}>Recibido</p>
            <p className={fuentesStyles.metricValue} style={{ color: 'rgb(34, 197, 94)' }}>
              {formatCurrency(fuente.monto_recibido)}
            </p>
          </div>

          <div className={fuentesStyles.metricItem}>
            <p className={fuentesStyles.metricLabel}>Pendiente</p>
            <p className={fuentesStyles.metricValue} style={{ color: 'rgb(239, 68, 68)' }}>
              {formatCurrency(fuente.saldo_pendiente)}
            </p>
          </div>
        </div>

        {/* Barra de progreso con efecto shine */}
        <div className={fuentesStyles.progressSection}>
          <div className={fuentesStyles.progressHeader}>
            <span className={fuentesStyles.progressLabel}>Progreso de pago</span>
            <span className={fuentesStyles.progressPercent} style={{ color: colorScheme.from }}>
              {porcentajeCompletado.toFixed(1)}%
            </span>
          </div>

          <div className={fuentesStyles.progressBar}>
            <motion.div
              className={fuentesStyles.progressFill}
              style={{ background: `linear-gradient(to right, ${colorScheme.from}, ${colorScheme.to})` }}
              initial={{ width: 0 }}
              animate={{ width: `${porcentajeCompletado}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + index * 0.1 }}
            >
              {/* Efecto de brillo animado */}
              <motion.div
                className={fuentesStyles.progressShine}
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Entidad (opcional) */}
        {fuente.entidad && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Entidad:</strong> {fuente.entidad}
              {fuente.numero_referencia && ` - Ref: ${fuente.numero_referencia}`}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
