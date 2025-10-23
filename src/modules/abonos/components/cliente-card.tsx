'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Building2, Home, User } from 'lucide-react'
import Link from 'next/link'
import { getAvatarGradient, seleccionClienteStyles as styles } from '../styles/seleccion-cliente.styles'
import { NegociacionConAbonos } from '../types'

interface ClienteCardProps {
  negociacion: NegociacionConAbonos
}

/**
 * 💳 Tarjeta premium de cliente con glassmorphism
 * Hover effect, gradientes y progress bar animado
 */
export function ClienteCard({ negociacion }: ClienteCardProps) {
  const { cliente, vivienda, proyecto } = negociacion
  const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.trim()

  const totalAbonado = negociacion.total_abonado || 0
  const saldoPendiente = negociacion.saldo_pendiente || 0
  const valorTotal = negociacion.valor_total || 0
  const porcentajePagado = negociacion.porcentaje_pagado || 0

  // Obtener gradient único para el avatar basado en el nombre
  const avatarGradient = getAvatarGradient(nombreCompleto)

  return (
    <Link href={`/abonos/${cliente.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={styles.card.container}
      >
        {/* Glow effect */}
        <div className={styles.card.glow} />

        {/* Content */}
        <div className={styles.card.content}>
          {/* TOP ROW: Cliente + Financiero */}
          <div className={styles.card.topRow}>
            {/* CLIENTE SECTION (Left) */}
            <div className={styles.card.clienteSection}>
              {/* Avatar con gradient único */}
              <div className={`${styles.card.avatarCircle} bg-gradient-to-br ${avatarGradient}`}>
                <User className={styles.card.avatarIcon} />
              </div>

              {/* Info del cliente */}
              <div className={styles.card.clienteInfo}>
                <h3 className={styles.card.clienteNombre}>{nombreCompleto}</h3>
                <p className={styles.card.clienteDocumento}>CC {cliente.numero_documento}</p>

                {/* Badges: Proyecto + Vivienda */}
                <div className={styles.card.viviendaBadges}>
                  {proyecto && (
                    <div className={styles.card.proyectoBadge}>
                      <Building2 className={styles.card.badgeIcon} />
                      <span>{proyecto.nombre}</span>
                    </div>
                  )}
                  <div className={styles.card.viviendaBadge}>
                    <Home className={styles.card.badgeIcon} />
                    <span>
                      {vivienda.manzana?.nombre ? `Mz. ${vivienda.manzana.nombre}` : ''}
                      {vivienda.manzana?.nombre && vivienda.numero ? ' - ' : ''}
                      {vivienda.numero ? `N° ${vivienda.numero}` : 'Vivienda'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FINANCIERO SECTION (Right) */}
            <div className="flex items-center gap-4">
              {/* Grid de métricas */}
              <div className={styles.card.financieroGrid}>
                {/* Total */}
                <div className={`${styles.card.metricBox} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700`}>
                  <p className={styles.card.metricLabel}>Total</p>
                  <p className={`${styles.card.metricValue} text-gray-900 dark:text-white`}>
                    ${(valorTotal / 1_000_000).toFixed(1)}M
                  </p>
                </div>

                {/* Pagado */}
                <div className={`${styles.card.metricBox} bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30`}>
                  <p className={styles.card.metricLabel}>Pagado</p>
                  <p className={`${styles.card.metricValue} text-green-600 dark:text-green-400`}>
                    ${(totalAbonado / 1_000_000).toFixed(1)}M
                  </p>
                </div>

                {/* Pendiente */}
                <div className={`${styles.card.metricBox} bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/30`}>
                  <p className={styles.card.metricLabel}>Pendiente</p>
                  <p className={`${styles.card.metricValue} text-orange-600 dark:text-orange-400`}>
                    ${(saldoPendiente / 1_000_000).toFixed(1)}M
                  </p>
                </div>
              </div>

              {/* Arrow icon con animación */}
              <ArrowRight className={styles.card.arrowIcon} />
            </div>
          </div>

          {/* PROGRESS BAR (Bottom) */}
          <div className={styles.card.progressSection}>
            <div className={styles.card.progressHeader}>
              <span className={styles.card.progressLabel}>Progreso de pago</span>
              <span className={styles.card.progressPercent}>
                {porcentajePagado.toFixed(1)}%
              </span>
            </div>
            <div className={styles.card.progressBar}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${porcentajePagado}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className={styles.card.progressFill}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
