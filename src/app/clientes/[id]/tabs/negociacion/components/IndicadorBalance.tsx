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
  totalFuentes: _totalFuentes,
  diferencia,
  estaBalanceado,
}: IndicadorBalanceProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
        estaBalanceado
          ? 'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-400'
          : diferencia > 0
            ? 'bg-red-50/80 text-red-600 dark:bg-red-900/15 dark:text-red-400'
            : 'bg-amber-50/80 text-amber-600 dark:bg-amber-900/15 dark:text-amber-500'
      }`}
    >
      {estaBalanceado ? (
        <CheckCircle2 className='h-3.5 w-3.5 flex-shrink-0' />
      ) : (
        <AlertTriangle className='h-3.5 w-3.5 flex-shrink-0' />
      )}

      {estaBalanceado ? (
        <span className='font-medium'>
          Valor cubierto ·{' '}
          <span className='tabular-nums'>{formatCurrency(valorVivienda)}</span>
        </span>
      ) : diferencia > 0 ? (
        <span className='font-medium'>
          Faltan{' '}
          <span className='font-bold tabular-nums'>
            {formatCurrency(Math.abs(diferencia))}
          </span>{' '}
          por asignar
        </span>
      ) : (
        <span className='font-medium'>
          Sobran{' '}
          <span className='font-bold tabular-nums'>
            {formatCurrency(Math.abs(diferencia))}
          </span>{' '}
          — exceso en fuentes
        </span>
      )}
    </div>
  )
}
