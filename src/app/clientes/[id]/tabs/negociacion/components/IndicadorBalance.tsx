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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
        estaBalanceado
          ? 'bg-emerald-50/80 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-400'
          : 'bg-red-50/80 dark:bg-red-900/15 text-red-600 dark:text-red-400'
      }`}
    >
      {estaBalanceado ? (
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
      )}

      {estaBalanceado ? (
        <span className="font-medium">
          Valor cubierto · <span className="tabular-nums">{formatCurrency(valorVivienda)}</span>
        </span>
      ) : diferencia > 0 ? (
        <span className="font-medium">
          Faltan <span className="font-bold tabular-nums">{formatCurrency(Math.abs(diferencia))}</span> por asignar
        </span>
      ) : (
        <span className="font-medium">
          Sobran <span className="font-bold tabular-nums">{formatCurrency(Math.abs(diferencia))}</span> — exceso en fuentes
        </span>
      )}
    </div>
  )
}
