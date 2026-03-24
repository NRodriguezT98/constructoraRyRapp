'use client'

import { ArrowRight, Calendar, CreditCard, Pencil } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { MetodoPago } from '@/modules/abonos/types'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import { formatCurrency } from '@/shared/utils/format'

interface Abono {
  id: string
  negociacion_id?: string
  fuente_pago_id?: string
  monto: number
  fecha_abono: string
  metodo_pago?: string | null
  numero_referencia?: string | null
  notas?: string | null
  comprobante_url?: string | null
}

interface AbonosRecientesProps {
  abonos: Abono[]
  totalAbonado: number
  negociacionId: string
  isLoading?: boolean
  isAdmin?: boolean
  onEditar?: (abono: AbonoParaEditar) => void
}

export function AbonosRecientes({
  abonos,
  totalAbonado,
  negociacionId,
  isLoading,
  isAdmin,
  onEditar,
}: AbonosRecientesProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className='h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/40'
          />
        ))}
      </div>
    )
  }

  if (abonos.length === 0) {
    return (
      <div className='flex flex-col items-center space-y-2 py-8 text-center'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700/50'>
          <CreditCard className='h-5 w-5 text-gray-400 dark:text-gray-500' />
        </div>
        <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
          Aún no se han registrado abonos
        </p>
        <p className='text-xs text-gray-400 dark:text-gray-500'>
          Los pagos aparecerán aquí a medida que se registren.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {abonos.map(abono => (
        <div
          key={abono.id}
          className='flex items-center gap-3 rounded-lg border border-gray-200/80 bg-white px-3.5 py-2.5 dark:border-gray-700/50 dark:bg-gray-800/60'
        >
          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30'>
            <CreditCard className='h-4 w-4 text-blue-600 dark:text-blue-400' />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='text-sm font-semibold tabular-nums text-gray-900 dark:text-white'>
              {formatCurrency(abono.monto)}
            </p>
            <div className='flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500'>
              <Calendar className='h-3 w-3' />
              <span>{formatDateCompact(abono.fecha_abono)}</span>
              {abono.metodo_pago ? (
                <>
                  <span>·</span>
                  <span>{abono.metodo_pago}</span>
                </>
              ) : null}
            </div>
          </div>

          {isAdmin && onEditar ? (
            <button
              onClick={() =>
                onEditar({
                  id: abono.id,
                  negociacion_id: abono.negociacion_id ?? negociacionId,
                  fuente_pago_id: abono.fuente_pago_id ?? '',
                  monto: abono.monto,
                  fecha_abono: abono.fecha_abono,
                  metodo_pago: (abono.metodo_pago ?? null) as MetodoPago | null,
                  numero_referencia: abono.numero_referencia ?? null,
                  notas: abono.notas ?? null,
                  comprobante_url: abono.comprobante_url ?? null,
                })
              }
              className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700/50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
              title='Editar abono'
            >
              <Pencil className='h-3.5 w-3.5' />
            </button>
          ) : null}
        </div>
      ))}

      {/* Footer: total y link */}
      <div className='flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Total abonado:{' '}
          <span className='font-semibold tabular-nums text-gray-900 dark:text-white'>
            {formatCurrency(totalAbonado)}
          </span>
        </p>
        <button
          onClick={() => router.push(`/abonos?negociacion=${negociacionId}`)}
          className='inline-flex items-center gap-1.5 text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300'
        >
          Ver todos
          <ArrowRight className='h-3.5 w-3.5' />
        </button>
      </div>
    </div>
  )
}
