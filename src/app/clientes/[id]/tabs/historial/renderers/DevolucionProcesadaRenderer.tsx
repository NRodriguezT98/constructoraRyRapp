/**
 * DevolucionProcesadaRenderer
 * Muestra los detalles de la devolución procesada que cierra la renuncia:
 * monto devuelto, método, comprobante, notas y enlace al expediente.
 * Lee desde metadata (evento UPDATE con modulo='renuncia_devolucion_procesada').
 */

'use client'

import {
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  ExternalLink,
  Home,
  Receipt,
} from 'lucide-react'

import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'

import { formatearMoneda } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

export function DevolucionProcesadaRenderer({ evento }: Props) {
  const meta = evento.metadata ?? {}

  const { esAdmin, puede } = usePermisosQuery()
  const canVerRenuncias = esAdmin || puede('renuncias', 'ver')

  const consecutivo = String(meta.consecutivo ?? '').trim() || null
  const montoDevuelto = meta.monto_devuelto as number | null | undefined
  const metodoDevolucion = String(meta.metodo_devolucion ?? '').trim() || null
  const numeroComprobante = String(meta.numero_comprobante ?? '').trim() || null
  const fechaDevolucion = String(meta.fecha_devolucion ?? '').trim() || null
  const notasCierre = String(meta.notas_cierre ?? '').trim() || null
  const procesadoPor = String(meta.procesado_por ?? '').trim() || null

  const viviendaNumero = String(meta.vivienda_numero ?? '').trim() || null
  const manzanaNombre = String(meta.manzana_nombre ?? '').trim() || null
  const proyectoNombre = String(meta.proyecto_nombre ?? '').trim() || null

  const tieneUbicacion = viviendaNumero ?? manzanaNombre ?? proyectoNombre

  return (
    <div className='space-y-3'>
      {/* Banner: renuncia cerrada */}
      <div className='flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-3 py-3 dark:border-green-800 dark:bg-green-950/30'>
        <CheckCircle2 className='h-5 w-5 shrink-0 text-green-600 dark:text-green-400' />
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300'>
            Renuncia cerrada
          </p>
          <p className='text-sm font-bold text-green-700 dark:text-green-300'>
            Devolución procesada exitosamente
          </p>
        </div>
      </div>

      {/* Vivienda / Proyecto */}
      {tieneUbicacion ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Vivienda de la renuncia
          </p>
          <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
            {(manzanaNombre ?? viviendaNumero) ? (
              <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
                <Home className='mt-0.5 h-4 w-4 shrink-0 text-green-400' />
                <div>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Vivienda
                  </p>
                  <p className='mt-0.5 text-sm font-medium text-gray-900 dark:text-white'>
                    {[
                      manzanaNombre ? `Mza. ${manzanaNombre}` : null,
                      viviendaNumero ? `Casa ${viviendaNumero}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
            ) : null}
            {proyectoNombre ? (
              <div className='flex items-start gap-2.5 px-3 py-2'>
                <Building2 className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
                <div>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Proyecto
                  </p>
                  <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                    {proyectoNombre}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Datos de la devolución */}
      <section>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
          Detalle de la devolución
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          {/* Monto */}
          {montoDevuelto ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <DollarSign className='mt-0.5 h-4 w-4 shrink-0 text-green-500 dark:text-green-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Monto devuelto
                </p>
                <p className='mt-0.5 text-sm font-bold text-green-700 dark:text-green-300'>
                  {formatearMoneda(montoDevuelto)}
                </p>
              </div>
            </div>
          ) : null}

          {/* Método */}
          {metodoDevolucion ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <Receipt className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Método de devolución
                </p>
                <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                  {metodoDevolucion}
                </p>
              </div>
            </div>
          ) : null}

          {/* Número de comprobante */}
          {numeroComprobante ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <ClipboardList className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  N.º comprobante
                </p>
                <p className='mt-0.5 font-mono text-sm text-gray-900 dark:text-white'>
                  {numeroComprobante}
                </p>
              </div>
            </div>
          ) : null}

          {/* Fecha de devolución */}
          {fechaDevolucion ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <Calendar className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Fecha de devolución
                </p>
                <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                  {formatDateCompact(fechaDevolucion)}
                </p>
              </div>
            </div>
          ) : null}

          {/* Procesado por */}
          {procesadoPor ? (
            <div className='flex items-start gap-2.5 px-3 py-2'>
              <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Procesado por
                </p>
                <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                  {procesadoPor}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Notas de cierre */}
      {notasCierre ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Notas de cierre
          </p>
          <div className='flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <ClipboardList className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {notasCierre}
            </p>
          </div>
        </section>
      ) : null}

      {/* Enlace al expediente */}
      {consecutivo && canVerRenuncias ? (
        <div className='space-y-1.5'>
          <Link
            href={`/renuncias/${consecutivo}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-800/50 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/40'
          >
            <ExternalLink className='h-4 w-4 shrink-0' />
            Ver expediente {consecutivo}
          </Link>
          <p className='text-center text-[11px] text-gray-400 dark:text-gray-500'>
            El expediente contiene el comprobante de devolución adjunto y el
            detalle completo del cierre de la renuncia.
          </p>
        </div>
      ) : null}
    </div>
  )
}
