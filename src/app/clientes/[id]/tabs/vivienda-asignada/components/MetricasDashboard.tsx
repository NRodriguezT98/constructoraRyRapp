/**
 * ============================================
 * COMPONENTE: MetricasDashboard
 * ============================================
 *
 * Dashboard de métricas financieras reorganizado.
 * Jerarquía visual clara: Valor Final > Progreso > Composición
 *
 * @version 2.0.0 - 2025-12-12 - Reorganizado para mayor claridad
 */

'use client'

import { motion } from 'framer-motion'
import { DollarSign, Home, TrendingUp, Wallet } from 'lucide-react'

interface MetricasDashboardProps {
  valorVivienda: number
  gastosNotariales: number
  recargoEsquinera: number
  descuento: number
  valorFinal: number
  totalPagado: number
  totalFuentesPago: number
  saldoPendiente: number
  fuentesCount: number
}

export function MetricasDashboard({
  valorVivienda,
  gastosNotariales,
  recargoEsquinera,
  descuento,
  valorFinal,
  totalPagado,
  totalFuentesPago,
  saldoPendiente,
  fuentesCount,
}: MetricasDashboardProps) {
  const porcentajePagado = valorFinal > 0 ? (totalPagado / valorFinal) * 100 : 0
  const porcentajeFuentes =
    valorFinal > 0 ? (totalFuentesPago / valorFinal) * 100 : 0

  return (
    <div className='space-y-3'>
      {/* NIVEL 1: Valor Final Prominente */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-6 shadow-2xl shadow-cyan-500/30'
      >
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
              <Home className='h-6 w-6 text-white' />
            </div>
            <div>
              <p className='text-sm font-medium text-cyan-100'>
                Valor Total de la Vivienda
              </p>
              <p className='text-xs text-cyan-200'>
                {fuentesCount} fuente{fuentesCount !== 1 ? 's' : ''} de pago
              </p>
            </div>
          </div>
        </div>
        <p className='mb-2 text-4xl font-bold text-white'>
          ${valorFinal.toLocaleString('es-CO')}
        </p>

        {/* Composición compacta */}
        <div className='flex items-center gap-3 text-xs text-cyan-100'>
          <span>Base: ${valorVivienda.toLocaleString('es-CO')}</span>
          {gastosNotariales > 0 && (
            <span>+ Gastos: ${gastosNotariales.toLocaleString('es-CO')}</span>
          )}
          {recargoEsquinera > 0 && (
            <span>+ Recargo: ${recargoEsquinera.toLocaleString('es-CO')}</span>
          )}
          {descuento > 0 && (
            <span className='text-green-300'>
              - Desc: ${descuento.toLocaleString('es-CO')}
            </span>
          )}
        </div>
      </motion.div>

      {/* NIVEL 2: Progreso Financiero (3 cards principales) */}
      <div className='grid grid-cols-3 gap-3'>
        {/* Total Pagado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className='rounded-xl border-2 border-green-200 bg-white/90 p-4 shadow-lg backdrop-blur-xl transition-all hover:shadow-xl dark:border-green-800 dark:bg-gray-800/90'
        >
          <div className='mb-2 flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md'>
              <DollarSign className='h-5 w-5 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                Total Pagado
              </p>
              <p className='truncate text-xl font-bold text-green-600 dark:text-green-400'>
                ${totalPagado.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
          <div className='mt-2 flex items-center justify-between'>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              Progreso
            </span>
            <span className='text-sm font-bold text-green-600 dark:text-green-400'>
              {porcentajePagado.toFixed(1)}%
            </span>
          </div>
        </motion.div>

        {/* Fuentes de Pago */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className='rounded-xl border-2 border-blue-200 bg-white/90 p-4 shadow-lg backdrop-blur-xl transition-all hover:shadow-xl dark:border-blue-800 dark:bg-gray-800/90'
        >
          <div className='mb-2 flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md'>
              <Wallet className='h-5 w-5 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                Fuentes Totales
              </p>
              <p className='truncate text-xl font-bold text-blue-600 dark:text-blue-400'>
                ${totalFuentesPago.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
          <div className='mt-2 flex items-center justify-between'>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              Cobertura
            </span>
            <span className='text-sm font-bold text-blue-600 dark:text-blue-400'>
              {porcentajeFuentes.toFixed(1)}%
            </span>
          </div>
        </motion.div>

        {/* Saldo Pendiente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className='rounded-xl border-2 border-rose-200 bg-white/90 p-4 shadow-lg backdrop-blur-xl transition-all hover:shadow-xl dark:border-rose-800 dark:bg-gray-800/90'
        >
          <div className='mb-2 flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-md'>
              <TrendingUp className='h-5 w-5 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                Saldo Pendiente
              </p>
              <p className='truncate text-xl font-bold text-rose-600 dark:text-rose-400'>
                ${saldoPendiente.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
          <div className='mt-2 flex items-center justify-between'>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              Restante
            </span>
            <span className='text-sm font-bold text-rose-600 dark:text-rose-400'>
              {(100 - porcentajePagado).toFixed(1)}%
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
