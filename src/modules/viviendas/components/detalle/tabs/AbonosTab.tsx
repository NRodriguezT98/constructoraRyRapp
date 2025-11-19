'use client'

import { CircleDollarSign, Hash, Plus, Receipt } from 'lucide-react'

import type { Vivienda } from '@/modules/viviendas/types'
import { formatCurrency } from '@/shared/utils'

interface AbonosTabProps {
  vivienda: Vivienda
  onRegistrarAbono: () => void
}

/**
 * Tab de abonos de la vivienda
 * Muestra resumen financiero y historial de pagos
 */
export function AbonosTab({ vivienda, onRegistrarAbono }: AbonosTabProps) {
  return (
    <div
      key="abonos"
      className="animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        {/* Header del Tab */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Historial de Abonos
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Pagos y saldo de la vivienda
              </p>
            </div>
          </div>

          {/* CTA Principal */}
          <button
            onClick={onRegistrarAbono}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Abono</span>
          </button>
        </div>

        {/* Resumen de Pagos */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {/* Total Abonado */}
          <div className="border-l-4 border-blue-600 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total Abonado
              </p>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(vivienda.total_abonado || 0)}
            </p>
          </div>

          {/* Saldo Pendiente */}
          <div className="border-l-4 border-orange-600 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <CircleDollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Saldo Pendiente
              </p>
            </div>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(vivienda.saldo_pendiente || vivienda.valor_total)}
            </p>
          </div>

          {/* Número de Abonos */}
          <div className="border-l-4 border-emerald-600 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Hash className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Número de Abonos
              </p>
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {vivienda.cantidad_abonos || 0}
            </p>
          </div>
        </div>

        {/* Lista de Abonos - Placeholder */}
        <div className="py-12 text-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/30">
          <Receipt className="mx-auto mb-4 h-16 w-16 text-slate-400" />
          <p className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Sistema de abonos en desarrollo
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Próximamente podrás ver el historial completo de pagos y registrar nuevos abonos
          </p>
        </div>
      </div>
    </div>
  )
}
