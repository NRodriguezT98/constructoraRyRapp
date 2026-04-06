/**
 * ClienteActualizadoRenderer
 * Muestra diff visual campo a campo de lo que cambió en el perfil del cliente
 */

'use client'

import { ArrowRight } from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import {
  esCampoMoneda,
  formatearMoneda,
  formatearValor,
} from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

export function ClienteActualizadoRenderer({ evento }: Props) {
  const detalles = evento.detalles ?? []
  if (detalles.length === 0) {
    return (
      <p className='py-3 text-center text-sm text-gray-400 dark:text-gray-500'>
        No se registraron cambios específicos.
      </p>
    )
  }

  return (
    <div className='space-y-2'>
      <p className='text-[10px] font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-400'>
        {detalles.length} campo{detalles.length > 1 ? 's' : ''} modificado
        {detalles.length > 1 ? 's' : ''}
      </p>
      {detalles.map(d => {
        const fmtAntes = esCampoMoneda(d.campo)
          ? formatearMoneda(d.valorAnterior)
          : formatearValor(d.valorAnterior)
        const fmtDespues = esCampoMoneda(d.campo)
          ? formatearMoneda(d.valorNuevo)
          : formatearValor(d.valorNuevo)

        return (
          <div
            key={d.campo}
            className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'
          >
            <div className='border-b border-gray-100 px-3 py-1.5 dark:border-gray-800'>
              <p className='text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                {d.etiqueta}
              </p>
            </div>
            <div className='flex items-stretch'>
              {/* Antes */}
              <div className='flex-1 bg-red-50 px-3 py-2.5 dark:bg-red-950/30'>
                <p className='mb-0.5 text-[10px] font-semibold uppercase text-red-500 dark:text-red-400'>
                  Antes
                </p>
                <p className='text-sm text-red-800 line-through decoration-red-400 dark:text-red-200'>
                  {fmtAntes}
                </p>
              </div>
              {/* Flecha */}
              <div className='flex shrink-0 items-center px-2'>
                <ArrowRight className='h-4 w-4 text-gray-400' />
              </div>
              {/* Después */}
              <div className='flex-1 bg-green-50 px-3 py-2.5 dark:bg-green-950/30'>
                <p className='mb-0.5 text-[10px] font-semibold uppercase text-green-600 dark:text-green-400'>
                  Ahora
                </p>
                <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
                  {fmtDespues}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
