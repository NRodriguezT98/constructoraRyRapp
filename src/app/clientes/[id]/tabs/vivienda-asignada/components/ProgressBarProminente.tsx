/**
 * ============================================
 * COMPONENTE: ProgressBarProminente
 * ============================================
 *
 * Barra de progreso prominente con visualización de pagos.
 * Muestra progreso de abonos vs fuentes de pago.
 *
 * @version 1.0.0 - 2025-12-12
 */

'use client'

import { motion } from 'framer-motion'
import { Clock, DollarSign, TrendingUp } from 'lucide-react'

interface ProgressBarProminenteProps {
  valorTotal: number
  totalAbonado: number
  totalFuentesPago: number
  diasDesdeUltimoAbono: number | null
}

export function ProgressBarProminente({
  valorTotal,
  totalAbonado,
  totalFuentesPago,
  diasDesdeUltimoAbono,
}: ProgressBarProminenteProps) {
  const porcentajeAbonado =
    valorTotal > 0 ? (totalAbonado / valorTotal) * 100 : 0
  const porcentajeFuentes =
    valorTotal > 0 ? (totalFuentesPago / valorTotal) * 100 : 0
  const saldoPendiente = valorTotal - totalAbonado

  return (
    <div className='space-y-3'>
      {/* Header con Stats */}
      <div className='flex items-center justify-between'>
        <h3 className='flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white'>
          <TrendingUp className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
          Progreso de Pagos
        </h3>
        {diasDesdeUltimoAbono !== null && (
          <div className='flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400'>
            <Clock className='h-3.5 w-3.5' />
            Último abono hace {diasDesdeUltimoAbono} día
            {diasDesdeUltimoAbono !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Progress Bars Container */}
      <div className='space-y-3 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50'>
        {/* Abonos Progress */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between text-xs'>
            <span className='flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300'>
              <DollarSign className='h-3 w-3 text-green-600 dark:text-green-400' />
              Abonado
            </span>
            <span className='font-bold text-green-600 dark:text-green-400'>
              ${totalAbonado.toLocaleString('es-CO')} (
              {porcentajeAbonado.toFixed(1)}%)
            </span>
          </div>
          <div className='h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(porcentajeAbonado, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className='h-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50'
            />
          </div>
        </div>

        {/* Fuentes Progress */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between text-xs'>
            <span className='flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300'>
              <DollarSign className='h-3 w-3 text-blue-600 dark:text-blue-400' />
              Fuentes de Pago
            </span>
            <span className='font-bold text-blue-600 dark:text-blue-400'>
              ${totalFuentesPago.toLocaleString('es-CO')} (
              {porcentajeFuentes.toFixed(1)}%)
            </span>
          </div>
          <div className='h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(porcentajeFuentes, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className='h-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50'
            />
          </div>
        </div>

        {/* Saldo Pendiente */}
        <div className='border-t border-gray-300 pt-2 dark:border-gray-600'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
              Saldo Pendiente
            </span>
            <span className='text-sm font-bold text-rose-600 dark:text-rose-400'>
              ${saldoPendiente.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
