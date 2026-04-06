/**
 * NegociacionCreadaRenderer
 * Muestra los datos económicos y condiciones con que arrancó la negociación
 */

'use client'

import {
  BadgePercent,
  Building2,
  CalendarDays,
  DollarSign,
  FileText,
  Handshake,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda, formatearValor } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

interface CampoProps {
  icono: React.ReactNode
  label: string
  valor: unknown
  formato?: 'moneda' | 'normal'
  negrita?: boolean
  colorValor?: string
}

function Campo({
  icono,
  label,
  valor,
  formato = 'normal',
  negrita = false,
  colorValor,
}: CampoProps) {
  const texto =
    formato === 'moneda' ? formatearMoneda(valor) : formatearValor(valor)
  if (texto === '—') return null
  return (
    <div className='flex items-start gap-2.5 border-b border-gray-100 py-2 last:border-0 dark:border-gray-800'>
      <div className='mt-0.5 shrink-0 text-gray-400 dark:text-gray-500'>
        {icono}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm ${negrita ? 'font-bold' : 'font-medium'} ${colorValor ?? 'text-gray-900 dark:text-white'}`}
        >
          {texto}
        </p>
      </div>
    </div>
  )
}

export function NegociacionCreadaRenderer({ evento }: Props) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = evento.metadata ?? {}

  const vivienda = String(
    meta.vivienda_nombre ?? meta.vivienda_numero ?? get('vivienda_id') ?? '—'
  )

  return (
    <div className='space-y-3'>
      {/* Vivienda */}
      {vivienda !== '—' ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Vivienda asignada
          </p>
          <div className='flex items-start gap-2.5 rounded-xl border border-green-100 bg-green-50 px-3 py-2.5 dark:border-green-900/40 dark:bg-green-950/30'>
            <Building2 className='mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
            <p className='text-sm font-bold text-green-900 dark:text-green-100'>
              {vivienda}
            </p>
          </div>
        </section>
      ) : null}

      {/* Valores económicos */}
      <section>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
          Condiciones económicas
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          <Campo
            icono={<DollarSign className='h-4 w-4' />}
            label='Valor negociado'
            valor={get('valor_negociado')}
            formato='moneda'
            negrita
            colorValor='text-green-700 dark:text-green-300'
          />
          {get('descuento_aplicado') ? (
            <Campo
              icono={<TrendingDown className='h-4 w-4' />}
              label='Descuento aplicado'
              valor={get('descuento_aplicado')}
              formato='moneda'
              colorValor='text-orange-600 dark:text-orange-400'
            />
          ) : null}
          {get('porcentaje_descuento') ? (
            <Campo
              icono={<BadgePercent className='h-4 w-4' />}
              label='Porcentaje de descuento'
              valor={`${get('porcentaje_descuento')}%`}
            />
          ) : null}
          {get('tipo_descuento') ? (
            <Campo
              icono={<BadgePercent className='h-4 w-4' />}
              label='Tipo de descuento'
              valor={get('tipo_descuento')}
            />
          ) : null}
          <Campo
            icono={<DollarSign className='h-4 w-4' />}
            label='Valor total'
            valor={get('valor_total')}
            formato='moneda'
          />
          <Campo
            icono={<TrendingUp className='h-4 w-4' />}
            label='Saldo pendiente'
            valor={get('saldo_pendiente')}
            formato='moneda'
          />
          {get('valor_escritura_publica') ? (
            <Campo
              icono={<DollarSign className='h-4 w-4' />}
              label='Valor escritura pública'
              valor={get('valor_escritura_publica')}
              formato='moneda'
            />
          ) : null}
        </div>
      </section>

      {/* Estado y fechas */}
      <section>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
          Estado y fecha
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          <Campo
            icono={<Handshake className='h-4 w-4' />}
            label='Estado inicial'
            valor={get('estado')}
          />
          <Campo
            icono={<CalendarDays className='h-4 w-4' />}
            label='Fecha de negociación'
            valor={get('fecha_negociacion')}
          />
        </div>
      </section>

      {/* Notas */}
      {get('notas') ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Notas
          </p>
          <div className='flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <FileText className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {String(get('notas'))}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  )
}
