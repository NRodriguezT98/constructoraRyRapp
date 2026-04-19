/**
 * AbonoEditadoRenderer
 * Muestra diff visual campo a campo de lo que cambió en un abono editado,
 * más el motivo de edición y el contexto del recibo.
 *
 * Patrón idéntico a ClienteActualizadoRenderer (antes → después por campo).
 */

'use client'

import { ArrowRight, Hash, Home, PenLine } from 'lucide-react'

import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import {
  esCampoMoneda,
  formatearMoneda,
  formatearValor,
} from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

// Nombres en español para cada campo del abono
const ETIQUETAS: Record<string, string> = {
  monto: 'Monto del abono',
  fecha_abono: 'Fecha del abono',
  metodo_pago: 'Método de pago',
  numero_referencia: 'Número de referencia',
  notas: 'Notas',
  comprobante_url: 'Comprobante',
}

export function AbonoEditadoRenderer({ evento }: Props) {
  const meta = (evento.metadata ?? {}) as Record<string, unknown>

  // Detalles de cambio campo a campo (construidos por el humanizador)
  const detalles = evento.detalles ?? []

  // Contexto del recibo
  const numeroRecibo = meta.abono_numero_recibo
    ? formatearNumeroRecibo(Number(meta.abono_numero_recibo))
    : null

  // Contexto vivienda/proyecto
  const viviendaNumero = meta.vivienda_numero as string | undefined
  const manzanaNombre = meta.manzana_nombre as string | undefined
  const proyectoNombre = meta.proyecto_nombre as string | undefined
  const ubicacion = [
    manzanaNombre ? `Mza. ${manzanaNombre}` : null,
    viviendaNumero ? `Casa ${viviendaNumero}` : null,
    proyectoNombre ?? null,
  ]
    .filter(Boolean)
    .join(' · ')

  // Motivo editorial
  const motivo = meta.motivo_edicion ? String(meta.motivo_edicion) : null

  // Campos editados para mostrar si no hay detalles individuales
  const camposEditados = meta.campos_editados as string[] | undefined

  return (
    <div className='space-y-3'>
      {/* Cabecera compacta: recibo + vivienda */}
      <div className='flex flex-wrap items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2.5 dark:border-yellow-800/40 dark:bg-yellow-950/30'>
        {numeroRecibo ? (
          <span className='flex items-center gap-1.5 text-xs font-semibold text-yellow-800 dark:text-yellow-200'>
            <Hash className='h-3.5 w-3.5' />
            Recibo {numeroRecibo}
          </span>
        ) : null}
        {ubicacion ? (
          <span className='flex items-center gap-1.5 text-xs text-yellow-700 dark:text-yellow-300'>
            <Home className='h-3.5 w-3.5' />
            {ubicacion}
          </span>
        ) : null}
      </div>

      {/* Diff por campo */}
      {detalles.length > 0 ? (
        <div className='space-y-2'>
          <p className='text-[10px] font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-400'>
            {detalles.length} campo{detalles.length > 1 ? 's' : ''} modificado
            {detalles.length > 1 ? 's' : ''}
          </p>

          {detalles.map(d => {
            const etiqueta = ETIQUETAS[d.campo] ?? d.etiqueta ?? d.campo
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
                {/* Label del campo */}
                <div className='border-b border-gray-100 px-3 py-1.5 dark:border-gray-800'>
                  <p className='text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                    {etiqueta}
                  </p>
                </div>
                {/* Antes → Después */}
                <div className='flex items-stretch'>
                  <div className='flex-1 bg-red-50 px-3 py-2.5 dark:bg-red-950/30'>
                    <p className='mb-0.5 text-[10px] font-semibold uppercase text-red-500 dark:text-red-400'>
                      Antes
                    </p>
                    <p className='text-sm text-red-800 line-through decoration-red-400 dark:text-red-200'>
                      {fmtAntes}
                    </p>
                  </div>
                  <div className='flex shrink-0 items-center px-2'>
                    <ArrowRight className='h-4 w-4 text-gray-400' />
                  </div>
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
      ) : camposEditados?.length ? (
        // Fallback: solo nombres de campos si no hay detalles individuales
        <div className='flex flex-wrap gap-1.5'>
          <span className='text-[10px] font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-400'>
            Campos editados:
          </span>
          {camposEditados.map(c => (
            <span
              key={c}
              className='rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            >
              {c}
            </span>
          ))}
        </div>
      ) : null}

      {/* Motivo de la edición */}
      {motivo ? (
        <div className='flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
          <PenLine className='mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500' />
          <div className='min-w-0'>
            <p className='text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
              Motivo de la edición
            </p>
            <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
              {motivo}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
