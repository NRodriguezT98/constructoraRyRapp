'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import { formatCurrency } from '@/shared/utils/format'

interface IndicadorBalanceProps {
  valorVivienda: number
  totalFuentes: number
  diferencia: number
  estaBalanceado: boolean
}

export function IndicadorBalance({
  valorVivienda,
  totalFuentes,
  diferencia,
  estaBalanceado,
}: IndicadorBalanceProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
        estaBalanceado
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/60'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/60'
      }`}
    >
      {estaBalanceado ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        {estaBalanceado ? (
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Ecuación balanceada —{' '}
            <span className="font-bold tabular-nums">{formatCurrency(valorVivienda)}</span>
          </p>
        ) : diferencia > 0 ? (
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            Déficit de{' '}
            <span className="font-bold tabular-nums">{formatCurrency(Math.abs(diferencia))}</span>
            {' '}— las fuentes no cubren el valor total
          </p>
        ) : (
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            Excedente de{' '}
            <span className="font-bold tabular-nums">{formatCurrency(Math.abs(diferencia))}</span>
            {' '}— las fuentes superan el valor total
          </p>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 tabular-nums">
          Total fuentes: {formatCurrency(totalFuentes)} · Vivienda: {formatCurrency(valorVivienda)}
        </p>
      </div>
    </div>
  )
}
