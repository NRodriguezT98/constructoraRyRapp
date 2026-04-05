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

import { motion } from 'framer-motion'
import { Calendar, CreditCard, DollarSign, FileText } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'

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

export function UltimosAbonosSection({
  abonos,
  onVerTodos,
}: UltimosAbonosSectionProps) {
  const ultimosAbonos = abonos.slice(0, 3)

  if (abonos.length === 0) {
    return (
      <div className='rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'>
        <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white'>
          <DollarSign className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
          Últimos Abonos
        </h3>
        <div className='py-8 text-center'>
          <DollarSign className='mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600' />
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            No hay abonos registrados aún
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-xl border border-gray-200/50 bg-white/80 p-4 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white'>
          <DollarSign className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
          Últimos Abonos ({abonos.length})
        </h3>
        {abonos.length > 3 && onVerTodos && (
          <button
            onClick={onVerTodos}
            className='text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300'
          >
            Ver todos →
          </button>
        )}
      </div>

      <div className='space-y-2'>
        {ultimosAbonos.map((abono, index) => (
          <motion.div
            key={abono.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className='rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-3 transition-all hover:shadow-md dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50'
          >
            {/* Header: Monto + Fecha */}
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-lg font-bold text-green-600 dark:text-green-400'>
                ${abono.monto.toLocaleString('es-CO')}
              </span>
              <div className='flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400'>
                <Calendar className='h-3 w-3' />
                {formatDateCompact(abono.fecha_abono)}
              </div>
            </div>

            {/* Detalles */}
            <div className='space-y-1'>
              <div className='flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300'>
                <CreditCard className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                <span className='font-medium'>{abono.metodo_pago}</span>
              </div>

              {abono.numero_recibo && (
                <div className='flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400'>
                  <FileText className='h-3 w-3' />
                  Recibo: {abono.numero_recibo}
                </div>
              )}

              {abono.observaciones && (
                <p className='mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-500'>
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
