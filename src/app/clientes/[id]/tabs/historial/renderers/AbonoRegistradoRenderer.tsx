/**
 * AbonoRegistradoRenderer
 * Muestra los datos del pago registrado con énfasis en el monto
 */

'use client'

import {
  Banknote,
  CalendarDays,
  CreditCard,
  FileText,
  Hash,
} from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda, formatearValor } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

export function AbonoRegistradoRenderer({ evento }: Props) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = evento.metadata ?? {}

  const monto = get('monto') ?? get('valor_abono')
  const fuente = String(meta.fuente_nombre ?? meta.tipo_fuente ?? '—')
  const vivienda = String(meta.vivienda_nombre ?? meta.vivienda_numero ?? '—')

  return (
    <div className='space-y-3'>
      {/* Monto destacado */}
      <div className='flex items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-4 shadow-lg shadow-green-500/20'>
        <div className='text-center'>
          <p className='text-xs font-semibold uppercase tracking-widest text-green-100'>
            Monto del abono
          </p>
          <p className='mt-1 text-3xl font-black text-white'>
            {formatearMoneda(monto)}
          </p>
        </div>
      </div>

      {/* Detalles del pago */}
      <section>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
          Detalles del pago
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          {/* Método de pago */}
          {get('metodo_pago') ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <CreditCard className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Método de pago
                </p>
                <p className='mt-0.5 text-sm font-semibold text-gray-900 dark:text-white'>
                  {formatearValor(get('metodo_pago'))}
                </p>
              </div>
            </div>
          ) : null}

          {/* Fecha */}
          {get('fecha_abono') ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <CalendarDays className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Fecha del abono
                </p>
                <p className='mt-0.5 text-sm font-medium text-gray-900 dark:text-white'>
                  {formatearValor(get('fecha_abono'))}
                </p>
              </div>
            </div>
          ) : null}

          {/* Referencia */}
          {get('numero_referencia') ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <Hash className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Número de referencia
                </p>
                <p className='mt-0.5 font-mono text-sm text-gray-900 dark:text-white'>
                  {String(get('numero_referencia'))}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Contexto (fuente / vivienda) */}
      {fuente !== '—' || vivienda !== '—' ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Contexto
          </p>
          <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
            {fuente !== '—' ? (
              <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
                <Banknote className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
                <div>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Fuente de pago
                  </p>
                  <p className='mt-0.5 text-sm font-medium text-gray-900 dark:text-white'>
                    {fuente}
                  </p>
                </div>
              </div>
            ) : null}
            {vivienda !== '—' ? (
              <div className='flex items-start gap-2.5 px-3 py-2'>
                <Banknote className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
                <div>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Vivienda
                  </p>
                  <p className='mt-0.5 text-sm font-medium text-gray-900 dark:text-white'>
                    {vivienda}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Notas */}
      {(get('notas') ?? get('observaciones')) ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Observaciones
          </p>
          <div className='flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <FileText className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {String(get('notas') ?? get('observaciones'))}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  )
}
