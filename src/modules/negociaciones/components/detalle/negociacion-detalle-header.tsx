/**
 * Componente: NegociacionDetalleHeader
 *
 * Header mejorado con toda la información relevante:
 * - Cliente, Vivienda, Proyecto
 * - Estado de la negociación
 * - Métricas de pago
 *
 * ⚠️ CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
 */

import { motion } from 'framer-motion'
import { DollarSign, Home, TrendingUp, User } from 'lucide-react'
import * as styles from '../../styles/detalle.styles'
import { EstadoBadge } from './estado-badge'

interface NegociacionDetalleHeaderProps {
  negociacion: any
  totalesPago: {
    totalPagado: number
    saldoPendiente: number
    porcentajePagado: number
    valorTotal: number
  }
}

export function NegociacionDetalleHeader({
  negociacion,
  totalesPago,
}: NegociacionDetalleHeaderProps) {
  // Formatear moneda
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CO')}`
  }

  // Construir descripción de vivienda
  const viviendaDescripcion = negociacion.vivienda
    ? [
        negociacion.vivienda.manzana?.nombre ? `Manzana ${negociacion.vivienda.manzana.nombre}` : null,
        `Casa ${negociacion.vivienda.numero}`,
      ]
        .filter(Boolean)
        .join(' - ')
    : '—'

  return (
    <motion.div
      {...styles.animations.fadeInUp}
      className={styles.headerClasses.container}
    >
      {/* Patrón de fondo */}
      <div className={styles.headerClasses.pattern} />

      <div className={styles.headerClasses.content}>
        {/* Top: Título y Estado */}
        <div className={styles.headerClasses.top}>
          <div className={styles.headerClasses.titleSection}>
            <h1 className={styles.headerClasses.title}>Detalle de Negociación</h1>
            <p className={styles.headerClasses.subtitle}>
              {negociacion.proyecto?.nombre || 'Proyecto sin nombre'}
            </p>
            <span className={styles.headerClasses.idBadge}>
              ID: {negociacion.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <EstadoBadge estado={negociacion.estado} className="bg-white/20 border border-white/30" />
        </div>

        {/* Grid de Estadísticas */}
        <div className={styles.headerClasses.statsGrid}>
          {/* Cliente */}
          <div className={styles.headerClasses.statCard}>
            <div className={styles.headerClasses.statLabel}>
              <User className={styles.headerClasses.statIcon} />
              <span>Cliente</span>
            </div>
            <div className={styles.headerClasses.statValue}>
              {negociacion.cliente?.nombre_completo || negociacion.cliente?.nombres || '—'}
            </div>
            {negociacion.cliente?.numero_documento && (
              <div className={styles.headerClasses.statSubtext}>
                {negociacion.cliente.tipo_documento} {negociacion.cliente.numero_documento}
              </div>
            )}
          </div>

          {/* Vivienda */}
          <div className={styles.headerClasses.statCard}>
            <div className={styles.headerClasses.statLabel}>
              <Home className={styles.headerClasses.statIcon} />
              <span>Vivienda</span>
            </div>
            <div className={styles.headerClasses.statValue}>{viviendaDescripcion}</div>
            {negociacion.vivienda?.estado && (
              <div className={styles.headerClasses.statSubtext}>
                Estado: {negociacion.vivienda.estado}
              </div>
            )}
          </div>

          {/* Valor Total */}
          <div className={styles.headerClasses.statCard}>
            <div className={styles.headerClasses.statLabel}>
              <DollarSign className={styles.headerClasses.statIcon} />
              <span>Valor Total</span>
            </div>
            <div className={styles.headerClasses.statValue}>
              {formatCurrency(negociacion.valor_total || 0)}
            </div>
            {negociacion.descuento_aplicado > 0 && (
              <div className={styles.headerClasses.statSubtext}>
                Descuento: {formatCurrency(negociacion.descuento_aplicado)}
              </div>
            )}
          </div>

          {/* Progreso de Pago */}
          <div className={styles.headerClasses.statCard}>
            <div className={styles.headerClasses.statLabel}>
              <TrendingUp className={styles.headerClasses.statIcon} />
              <span>Progreso</span>
            </div>
            <div className={styles.headerClasses.statValue}>
              {totalesPago.porcentajePagado.toFixed(1)}%
            </div>
            <div className={styles.headerClasses.statSubtext}>
              {formatCurrency(totalesPago.totalPagado)} pagado
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
