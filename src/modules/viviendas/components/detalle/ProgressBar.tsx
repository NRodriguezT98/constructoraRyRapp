'use client'

import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

import type { Vivienda } from '@/modules/viviendas/types'
import { formatCurrency } from '@/shared/utils'

interface ProgressBarProps {
  vivienda: Vivienda
}

/**
 * Barra de progreso de pago de la vivienda
 * Muestra porcentaje pagado, abonado, pendiente y total
 */
export function ProgressBar({ vivienda }: ProgressBarProps) {
  // Solo mostrar para viviendas Asignadas o Pagadas
  if (vivienda.estado === 'Disponible') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="border-l-4 border-green-600 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Progreso de Pago
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Calculado según abonos realizados
            </p>
          </div>
        </div>

        {/* Porcentaje destacado */}
        <div className="text-right">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {vivienda.porcentaje_pagado || 0}%
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Completado</p>
        </div>
      </div>

      {/* Barra de progreso (mantener gradiente - funcional) */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600"
          initial={{ width: 0 }}
          animate={{ width: `${vivienda.porcentaje_pagado || 0}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </div>

      {/* Milestones */}
      <div className="mt-4 flex justify-between gap-3">
        <div className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-700/30 p-3 text-center">
          <p className="text-base font-bold text-green-600 dark:text-green-400">
            {formatCurrency(vivienda.total_abonado || 0)}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Abonado</p>
        </div>
        <div className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-700/30 p-3 text-center">
          <p className="text-base font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(vivienda.saldo_pendiente || vivienda.valor_total)}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Pendiente</p>
        </div>
        <div className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-700/30 p-3 text-center">
          <p className="text-base font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(vivienda.valor_total)}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Total</p>
        </div>
      </div>
    </motion.div>
  )
}
