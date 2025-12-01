'use client'

/**
 * ============================================
 * COMPONENTE: MetricasDashboard
 * ============================================
 *
 * ✅ DASHBOARD DE MÉTRICAS HORIZONTALES
 * 4 cards compactos mostrando valores clave de la negociación.
 *
 * Métricas:
 * - Valor Base (gray)
 * - Descuento (orange)
 * - Total Pagado (emerald)
 * - Saldo Pendiente (cyan)
 *
 * @version 1.0.0 - 2025-01-26 (Nuevo componente dashboard)
 */

import { motion } from 'framer-motion'
import { DollarSign, Home, Percent, TrendingDown } from 'lucide-react'

import { Tooltip } from '@/shared/components/ui'

// ============================================
// TYPES
// ============================================

interface MetricasDashboardProps {
  valorBase: number
  descuento: number
  totalPagado: number
  saldoPendiente: number
}

// ============================================
// CONFIGURACIÓN DE MÉTRICAS
// ============================================

const METRICAS_CONFIG = {
  valorBase: {
    label: 'Valor Base',
    icon: Home,
    bgCard: 'bg-gray-100 dark:bg-gray-800/50',
    bgIcon: 'bg-gray-100 dark:bg-gray-700',
    colorIcon: 'text-gray-600 dark:text-gray-300',
    colorValue: 'text-gray-900 dark:text-white',
    border: 'border-gray-200 dark:border-gray-700',
  },
  descuento: {
    label: 'Descuento',
    icon: TrendingDown,
    bgCard: 'bg-orange-50 dark:bg-orange-950/20',
    bgIcon: 'bg-orange-100 dark:bg-orange-900/30',
    colorIcon: 'text-orange-600 dark:text-orange-400',
    colorValue: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
  },
  totalPagado: {
    label: 'Total Pagado',
    icon: DollarSign,
    bgCard: 'bg-emerald-50 dark:bg-emerald-950/20',
    bgIcon: 'bg-emerald-100 dark:bg-emerald-900/30',
    colorIcon: 'text-emerald-600 dark:text-emerald-400',
    colorValue: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  saldoPendiente: {
    label: 'Saldo Pendiente',
    icon: Percent,
    bgCard: 'bg-red-50 dark:bg-red-950/20',
    bgIcon: 'bg-red-100 dark:bg-red-900/30',
    colorIcon: 'text-red-600 dark:text-red-400',
    colorValue: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
}

// ============================================
// COMPONENTE
// ============================================

export function MetricasDashboard({
  valorBase,
  descuento,
  totalPagado,
  saldoPendiente,
}: MetricasDashboardProps) {
  const metricas = [
    {
      key: 'valorBase',
      config: METRICAS_CONFIG.valorBase,
      valor: valorBase,
      prefix: '$',
      mostrar: true,
    },
    {
      key: 'descuento',
      config: METRICAS_CONFIG.descuento,
      valor: descuento,
      prefix: '-$',
      mostrar: true, // ✅ Mostrar SIEMPRE (incluso si es $0)
    },
    {
      key: 'totalPagado',
      config: METRICAS_CONFIG.totalPagado,
      valor: totalPagado,
      prefix: '$',
      mostrar: true,
    },
    {
      key: 'saldoPendiente',
      config: METRICAS_CONFIG.saldoPendiente,
      valor: saldoPendiente,
      prefix: '$',
      mostrar: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {metricas.map(({ key, config, valor, prefix, mostrar = true }) => {
        // Si es descuento con valor 0, usar borde gris en lugar de naranja
        const borderClass = key === 'descuento' && valor === 0
          ? 'border-gray-200 dark:border-gray-700'
          : config.border

        const tooltipContent = {
          valorBase: 'Valor negociado de la vivienda antes de descuentos',
          descuento: descuento > 0 ? `Descuento aplicado: ${((descuento / valorBase) * 100).toFixed(1)}%` : 'Sin descuento aplicado',
          totalPagado: `${((totalPagado / (valorBase - descuento)) * 100).toFixed(1)}% del valor final`,
          saldoPendiente: 'Cantidad pendiente por pagar',
        }[key] || ''

        return mostrar ? (
          <Tooltip key={key} content={tooltipContent} side="top">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden rounded-xl border ${borderClass} ${config.bgCard} p-3 shadow-md hover:shadow-lg transition-all cursor-help`}
            >
            {/* Icono */}
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.bgIcon} mb-2`}>
              <config.icon className={`w-5 h-5 ${config.colorIcon}`} />
            </div>

            {/* Valor */}
            <p className={`text-xl font-bold ${config.colorValue} mb-1`}>
              {key === 'descuento' && valor === 0 ? (
                <span className="text-gray-400 dark:text-gray-500">N/A</span>
              ) : (
                <>
                  {prefix}
                  {valor.toLocaleString('es-CO')}
                </>
              )}
            </p>

            {/* Label */}
            <p className="text-xs text-gray-600 dark:text-gray-400">{config.label}</p>
          </motion.div>
          </Tooltip>
        ) : null
      })}
    </div>
  )
}
