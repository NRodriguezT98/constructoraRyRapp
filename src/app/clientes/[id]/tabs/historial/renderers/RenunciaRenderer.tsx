/**
 * RenunciaRenderer
 * Muestra los datos de la renuncia (motivo, monto devolución, estado)
 * Sirve para creación, aprobación y rechazo
 */

'use client'

import {
  AlertTriangle,
  CalendarDays,
  DollarSign,
  FileText,
  TrendingUp,
} from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda, formatearValor } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

const ESTADO_COLORES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  pendiente: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  aprobada: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
  },
  rechazada: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
}

export function RenunciaRenderer({ evento }: Props) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = evento.metadata ?? {}

  const estado = String(
    get('estado') ?? meta.estado ?? 'pendiente'
  ).toLowerCase()
  const colores = ESTADO_COLORES[estado] ?? ESTADO_COLORES.pendiente

  const motivo = get('motivo') ?? get('motivo_renuncia')
  const montoDevolucion =
    get('monto_devolucion') ?? get('monto_a_devolver') ?? meta.monto_devolucion

  return (
    <div className='space-y-3'>
      {/* Estado de la renuncia */}
      <div
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 ${colores.bg} ${colores.border}`}
      >
        <AlertTriangle className={`h-5 w-5 shrink-0 ${colores.text}`} />
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${colores.text}`}
          >
            Estado de la renuncia
          </p>
          <p className={`text-sm font-bold capitalize ${colores.text}`}>
            {String(get('estado') ?? meta.estado ?? 'Pendiente')}
          </p>
        </div>
      </div>

      {/* Motivo */}
      {motivo ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400'>
            Motivo de renuncia
          </p>
          <div className='flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <FileText className='mt-0.5 h-4 w-4 shrink-0 text-orange-400' />
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {String(motivo)}
            </p>
          </div>
        </section>
      ) : null}

      {/* Monto de devolución */}
      {montoDevolucion ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400'>
            Devolución pactada
          </p>
          <div className='flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <DollarSign className='h-4 w-4 shrink-0 text-gray-400' />
            <p className='text-sm font-bold text-gray-900 dark:text-white'>
              {formatearMoneda(montoDevolucion)}
            </p>
          </div>
        </section>
      ) : null}

      {/* Fechas */}
      <section>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400'>
          Fechas
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          {get('fecha_renuncia') ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <CalendarDays className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Fecha de renuncia
                </p>
                <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                  {formatearValor(get('fecha_renuncia'))}
                </p>
              </div>
            </div>
          ) : null}
          {get('fecha_renuncia_efectiva') ? (
            <div className='flex items-start gap-2.5 px-3 py-2'>
              <TrendingUp className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Fecha efectiva
                </p>
                <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                  {formatearValor(get('fecha_renuncia_efectiva'))}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
