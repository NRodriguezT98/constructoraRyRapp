'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL PURO (REFACTORIZADO 2025-11-27)
 * ProgressSection - 100% Separación de Responsabilidades
 *
 * CAMBIOS:
 * - ✅ Cálculos movidos a useProgressSection hook
 * - ✅ Estilos centralizados en progress-section.styles.ts
 * - ✅ Diseño compact (p-6 → p-3, gap-3 → gap-2)
 * - ✅ Paleta rosa/púrpura/índigo (negociaciones)
 * - ✅ Glassmorphism aplicado
 */

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

import { useProgressSection } from '@/modules/clientes/hooks/useProgressSection'

import {
    progressAnimations,
    progressSectionStyles as styles,
    VALORES_CONFIG,
} from './progress-section.styles'

interface ProgressSectionProps {
  valorNegociado: number
  descuento: number
  totalAbonado: number
  totalFuentesPago: number
}

export function ProgressSection({
  valorNegociado,
  descuento,
  totalAbonado,
  totalFuentesPago,
}: ProgressSectionProps) {
  // ✅ Hook con TODA la lógica
  const { valoresDisplay, tieneDescuento } = useProgressSection({
    valorNegociado,
    descuento,
    totalAbonado,
    totalFuentesPago,
  })

  const valores = [
    {
      key: 'valorBase',
      config: VALORES_CONFIG.valorBase,
      valor: valoresDisplay.valorNegociado,
      mostrar: true,
    },
    {
      key: 'descuento',
      config: VALORES_CONFIG.descuento,
      valor: valoresDisplay.descuento,
      mostrar: tieneDescuento,
      prefix: '-',
    },
    {
      key: 'valorFinal',
      config: VALORES_CONFIG.valorFinal,
      valor: valoresDisplay.valorFinal,
      mostrar: true,
    },
    {
      key: 'totalAbonado',
      config: VALORES_CONFIG.totalAbonado,
      valor: valoresDisplay.totalAbonado,
      mostrar: true,
    },
  ]

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header.container}>
        <h3 className={styles.header.title}>
          <TrendingUp className={styles.header.titleIcon} />
          Progreso de Pago
        </h3>
      </div>

      {/* Grid de Valores */}
      <div className={styles.valores.grid}>
        {valores.map(({ key, config, valor, mostrar, prefix }) =>
          mostrar ? (
            <div key={key} className={`${styles.valores.card} ${config.bg}`}>
              <div className={`${styles.valores.label} ${config.labelColor}`}>
                <config.icon className={styles.valores.labelIcon} />
                <span>{config.label}</span>
              </div>
              <p className={`${styles.valores.value} ${config.valueColor}`}>
                {prefix}${valor.toLocaleString('es-CO')}
              </p>
            </div>
          ) : null
        )}
      </div>

      {/* Barra de Progreso - Abonos */}
      <div className={styles.progreso.container}>
        <div className={styles.progreso.header}>
          <span className={styles.progreso.label}>Progreso de Abonos</span>
          <span className={`${styles.progreso.porcentaje} ${styles.progreso.porcentajeAbonos}`}>
            {valoresDisplay.porcentajePagadoTexto}%
          </span>
        </div>
        <div className={styles.progreso.barraContainer}>
          <motion.div
            className={`${styles.progreso.barra} ${styles.progreso.barraAbonos}`}
            initial={progressAnimations.barra.initial}
            animate={progressAnimations.barra.animate(valoresDisplay.porcentajePagado)}
            transition={progressAnimations.barra.transition}
          />
        </div>
      </div>

      {/* Barra de Progreso - Fuentes de Pago */}
      <div className={styles.progreso.container}>
        <div className={styles.progreso.header}>
          <span className={styles.progreso.label}>Fuentes de Pago Configuradas</span>
          <span className={`${styles.progreso.porcentaje} ${styles.progreso.porcentajeFuentes}`}>
            {valoresDisplay.porcentajeFuentesTexto}%
          </span>
        </div>
        <div className={styles.progreso.barraContainer}>
          <motion.div
            className={`${styles.progreso.barra} ${styles.progreso.barraFuentes}`}
            initial={progressAnimations.barra.initial}
            animate={progressAnimations.barra.animate(valoresDisplay.porcentajeFuentes)}
            transition={progressAnimations.barra.transition}
          />
        </div>
      </div>

      {/* Saldo Pendiente */}
      <div className={styles.saldo.container}>
        <div className={styles.saldo.row}>
          <span className={styles.saldo.label}>Saldo Pendiente</span>
          <span className={styles.saldo.value}>
            ${valoresDisplay.saldoPendiente.toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </div>
  )
}
