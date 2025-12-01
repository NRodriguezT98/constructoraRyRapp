'use client'

/**
 * ============================================
 * COMPONENTE: ProgressBarProminente
 * ============================================
 *
 * ✅ BARRA DE PROGRESO PRINCIPAL COMPACTA
 * Muestra el progreso de pagos de forma visual y prominente.
 *
 * Features:
 * - Barra de progreso animada
 * - Info inline: Pagado / Total + Porcentaje
 * - Indicadores: Fuentes configuradas + Saldo pendiente
 * - Paleta cyan/azul
 *
 * @version 2.0.0 - 2025-01-26 (Refactorizado desde ProgressSection)
 */

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, DollarSign } from 'lucide-react'
import { useMemo } from 'react'

// ============================================
// TYPES
// ============================================

interface ProgressBarProminenteProps {
  valorTotal: number
  totalAbonado: number
  totalFuentesPago: number
  diasDesdeUltimoAbono?: number | null
}

// ============================================
// COMPONENTE
// ============================================

export function ProgressBarProminente({
  valorTotal,
  totalAbonado,
  totalFuentesPago,
  diasDesdeUltimoAbono,
}: ProgressBarProminenteProps) {
  // =====================================================
  // CÁLCULOS
  // =====================================================

  const porcentajePagado = useMemo(() => {
    if (valorTotal <= 0) return 0
    return Math.min((totalAbonado / valorTotal) * 100, 100)
  }, [totalAbonado, valorTotal])

  const porcentajeFuentes = useMemo(() => {
    if (valorTotal <= 0) return 0
    return Math.min((totalFuentesPago / valorTotal) * 100, 100)
  }, [totalFuentesPago, valorTotal])

  const saldoPendiente = useMemo(() => {
    return Math.max(valorTotal - totalAbonado, 0)
  }, [valorTotal, totalAbonado])

  const fuentesCompletas = porcentajeFuentes >= 100

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-800 shadow-md">
      {/* Header: Pagado / Total + Porcentaje + Último Abono */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs font-medium text-cyan-900 dark:text-cyan-100">
            Pagado: ${totalAbonado.toLocaleString('es-CO')} de ${valorTotal.toLocaleString('es-CO')}
          </span>

          {/* Badge: Último abono */}
          {diasDesdeUltimoAbono !== null && diasDesdeUltimoAbono !== undefined ? (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                diasDesdeUltimoAbono === 0
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : diasDesdeUltimoAbono <= 7
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : diasDesdeUltimoAbono <= 30
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
              }`}
            >
              {diasDesdeUltimoAbono === 0 ? '🎉 Hoy' : `⏱️ Hace ${diasDesdeUltimoAbono}d`}
            </span>
          ) : totalAbonado === 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
              ⚠️ Sin pagos
            </span>
          ) : null}
        </div>
        <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
          {porcentajePagado.toFixed(1)}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${porcentajePagado}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Info adicional inline */}
      <div className="flex items-center justify-between text-xs">
        {/* Fuentes configuradas */}
        <div className="flex items-center gap-1.5">
          {fuentesCompletas ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
          <span className={fuentesCompletas ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}>
            Fuentes configuradas: {porcentajeFuentes.toFixed(0)}%
          </span>
        </div>

        {/* Saldo pendiente */}
        {saldoPendiente > 0 ? (
          <span className="text-cyan-700 dark:text-cyan-300 font-semibold">
            ⚠️ Pendiente: ${saldoPendiente.toLocaleString('es-CO')}
          </span>
        ) : (
          <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
            ✅ Completado
          </span>
        )}
      </div>
    </div>
  )
}
