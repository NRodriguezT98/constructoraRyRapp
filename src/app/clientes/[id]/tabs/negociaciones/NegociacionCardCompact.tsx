'use client'

/**
 * ============================================
 * COMPONENTE: NegociacionCardCompact
 * ============================================
 *
 * ✅ DISEÑO HORIZONTAL COMPACTO (Tabla-style)
 * Card individual de negociación con layout horizontal.
 *
 * Estructura:
 * - Barra de estado (izquierda, 1px)
 * - Icono + Info (centro-izquierda)
 * - Valores inline (centro)
 * - Badge de estado (centro-derecha)
 * - Acciones (derecha)
 *
 * @version 2.0.0 - 2025-01-26 (Rediseño horizontal)
 */

import { motion } from 'framer-motion'
import { ArrowRight, Building2, Calendar, History, Home } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { NegociacionConValores } from '@/modules/clientes/hooks/useNegociacionesQuery'
import { Tooltip } from '@/shared/components/ui'

import {
    getBadgeClassName,
    getCardClassName,
    getEstadoConfig,
    negociacionesAnimations,
    negociacionesTabStyles as styles,
} from '../negociaciones-tab.styles'

// ============================================
// TYPES
// ============================================

interface NegociacionCardCompactProps {
  negociacion: NegociacionConValores
  onVerDetalle: (negociacion: NegociacionConValores) => void
  onVerHistorial: (negociacionId: string) => void
}

// ============================================
// COMPONENTE
// ============================================

export function NegociacionCardCompact({
  negociacion,
  onVerDetalle,
  onVerHistorial,
}: NegociacionCardCompactProps) {
  const estadoConfig = getEstadoConfig(negociacion.estado)
  const IconoEstado = estadoConfig.icon

  return (
    <motion.div
      whileHover={negociacionesAnimations.cardHover}
      className={getCardClassName(negociacion.estado)}
    >
      {/* Barra de estado (izquierda) */}
      <div className={`${styles.card.statusIndicator} bg-gradient-to-b ${estadoConfig.gradient}`} />

      {/* Contenido horizontal */}
      <div className={styles.card.content}>
        {/* 1. Icono + Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`${styles.card.iconContainer} ${estadoConfig.bg}`}>
            <Building2 className={`${styles.card.icon} ${estadoConfig.text}`} />
          </div>

          <div className={styles.card.info}>
            <h4 className={styles.card.title}>
              {negociacion.proyecto?.nombre || 'Proyecto sin nombre'}
            </h4>
            <div className={styles.card.subtitle}>
              <Home className={styles.card.subtitleIcon} />
              <span className={styles.card.subtitleText}>
                {negociacion.vivienda?.manzanas?.nombre
                  ? `${negociacion.vivienda.manzanas.nombre} - `
                  : ''}
                Casa {negociacion.vivienda?.numero || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Valores inline (horizontal) */}
        <div className={styles.card.valores}>
          {/* Valor Base */}
          <Tooltip content="Valor negociado inicial" side="top">
            <div className={styles.card.valorItem}>
              <span className={styles.card.valorLabel}>Base:</span>
              <span className={styles.card.valorText}>
                ${negociacion.valorBase.toLocaleString('es-CO')}
              </span>
            </div>
          </Tooltip>

          {/* Descuento (condicional) */}
          {negociacion.descuento > 0 ? (
            <Tooltip content="Descuento aplicado" side="top">
              <div className={styles.card.valorItem}>
                <span className={`${styles.card.valorLabel} text-orange-600 dark:text-orange-400`}>
                  Desc:
                </span>
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  -${negociacion.descuento.toLocaleString('es-CO')}
                </span>
              </div>
            </Tooltip>
          ) : null}

          {/* Valor Final */}
          <Tooltip content="Valor final a pagar" side="top">
            <div className={styles.card.valorItem}>
              <span className={`${styles.card.valorLabel} text-emerald-600 dark:text-emerald-400`}>
                Final:
              </span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                ${negociacion.valorFinal.toLocaleString('es-CO')}
              </span>
            </div>
          </Tooltip>
        </div>

        {/* 3. Badge de estado */}
        <span className={getBadgeClassName(negociacion.estado)}>
          <IconoEstado className={styles.card.badgeIcon} />
          {negociacion.estado}
        </span>

        {/* 4. Acciones */}
        <div className={styles.card.actions}>
          {/* Fecha de creación */}
          <Tooltip content="Fecha de creación" side="top">
            <div className={styles.footer.fecha}>
              <Calendar className={styles.footer.fechaIcon} />
              <span>
                {negociacion.fecha_creacion
                  ? formatDateCompact(negociacion.fecha_creacion)
                  : '—'}
              </span>
            </div>
          </Tooltip>

          {/* Botón Historial */}
          <Tooltip content="Ver historial de versiones" side="top">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onVerHistorial(negociacion.id)
              }}
              className={styles.buttons.info}
            >
              <History className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          {/* Botón Ver Detalle */}
          <button
            onClick={() => onVerDetalle(negociacion)}
            className={styles.buttons.secondary}
          >
            <span>Ver Detalle</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
