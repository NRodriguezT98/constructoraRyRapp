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
  const porcentajeFuentes = valorFinal > 0 ? (totalFuentesPago / valorFinal) * 100 : 0

  return (
    <div className="space-y-3">
      {/* NIVEL 1: Valor Final Prominente */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 shadow-2xl shadow-cyan-500/30"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-100">Valor Total de la Vivienda</p>
              <p className="text-xs text-cyan-200">{fuentesCount} fuente{fuentesCount !== 1 ? 's' : ''} de pago</p>
            </div>
          </div>
        </div>
        <p className="text-4xl font-bold text-white mb-2">
          ${valorFinal.toLocaleString('es-CO')}
        </p>

        {/* Composición compacta */}
        <div className="flex items-center gap-3 text-xs text-cyan-100">
          <span>Base: ${valorVivienda.toLocaleString('es-CO')}</span>
          {gastosNotariales > 0 && <span>+ Gastos: ${gastosNotariales.toLocaleString('es-CO')}</span>}
          {recargoEsquinera > 0 && <span>+ Recargo: ${recargoEsquinera.toLocaleString('es-CO')}</span>}
          {descuento > 0 && <span className="text-green-300">- Desc: ${descuento.toLocaleString('es-CO')}</span>}
        </div>
      </motion.div>

      {/* NIVEL 2: Progreso Financiero (3 cards principales) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Pagado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-4 rounded-xl backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Pagado</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 truncate">
                ${totalPagado.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Progreso</span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
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
          className="p-4 rounded-xl backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Fuentes Totales</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 truncate">
                ${totalFuentesPago.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Cobertura</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
          className="p-4 rounded-xl backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border-2 border-rose-200 dark:border-rose-800 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Saldo Pendiente</p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400 truncate">
                ${saldoPendiente.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Restante</span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
              {(100 - porcentajePagado).toFixed(1)}%
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
