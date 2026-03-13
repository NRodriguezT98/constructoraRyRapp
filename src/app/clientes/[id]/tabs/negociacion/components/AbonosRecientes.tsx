'use client'

import { ArrowRight, Calendar, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/shared/utils/format'

interface Abono {
  id: string
  monto: number
  fecha_abono: string
  metodo_pago?: string
  numero_referencia?: string
}

interface AbonosRecientesProps {
  abonos: Abono[]
  totalAbonado: number
  negociacionId: string
  isLoading?: boolean
}

export function AbonosRecientes({
  abonos,
  totalAbonado,
  negociacionId,
  isLoading,
}: AbonosRecientesProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-700/40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (abonos.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        No hay abonos registrados aún.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {abonos.map((abono) => (
        <div
          key={abono.id}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/50"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
              {formatCurrency(abono.monto)}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDateCompact(abono.fecha_abono)}</span>
              {abono.metodo_pago && (
                <>
                  <span>·</span>
                  <span>{abono.metodo_pago}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Footer: total y link */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total abonado:{' '}
          <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
            {formatCurrency(totalAbonado)}
          </span>
        </p>
        <button
          onClick={() => router.push(`/abonos?negociacion=${negociacionId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
        >
          Ver todos
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
