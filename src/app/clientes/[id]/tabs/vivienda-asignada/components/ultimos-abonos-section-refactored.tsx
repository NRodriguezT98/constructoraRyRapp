/**
 * ============================================
 * COMPONENTE: UltimosAbonosSection
 * ============================================
 *
 * Sección que muestra los últimos abonos realizados.
 * Lista compacta con información clave de cada abono.
 *
 * @version 1.0.0 - 2025-12-12
 */

'use client'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { motion } from 'framer-motion'
import { Calendar, CreditCard, DollarSign, FileText } from 'lucide-react'

interface Abono {
  id: string
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_recibo?: string | null
  observaciones?: string | null
}

interface UltimosAbonosSectionProps {
  abonos: Abono[]
  onVerTodos?: () => void
}

export function UltimosAbonosSection({ abonos, onVerTodos }: UltimosAbonosSectionProps) {
  const ultimosAbonos = abonos.slice(0, 3)

  if (abonos.length === 0) {
    return (
      <div className="p-6 rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          Últimos Abonos
        </h3>
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No hay abonos registrados aún
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          Últimos Abonos ({abonos.length})
        </h3>
        {abonos.length > 3 && onVerTodos && (
          <button
            onClick={onVerTodos}
            className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
          >
            Ver todos →
          </button>
        )}
      </div>

      <div className="space-y-2">
        {ultimosAbonos.map((abono, index) => (
          <motion.div
            key={abono.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-all"
          >
            {/* Header: Monto + Fecha */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                ${abono.monto.toLocaleString('es-CO')}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                {formatDateCompact(abono.fecha_abono)}
              </div>
            </div>

            {/* Detalles */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                <CreditCard className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">{abono.metodo_pago}</span>
              </div>

              {abono.numero_recibo && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <FileText className="w-3 h-3" />
                  Recibo: {abono.numero_recibo}
                </div>
              )}

              {abono.observaciones && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">
                  {abono.observaciones}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
