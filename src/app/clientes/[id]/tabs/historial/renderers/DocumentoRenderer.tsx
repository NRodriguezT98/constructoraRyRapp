/**
 * DocumentoRenderer
 * Muestra datos de documento subido o actualizado
 */

'use client'

import { CalendarDays, FileText, Info, Star, Tag } from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearValor } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

export function DocumentoRenderer({ evento }: Props) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = evento.metadata ?? {}

  const titulo = String(get('titulo') ?? meta.titulo ?? '—')
  const descripcion = get('descripcion') ?? meta.descripcion

  return (
    <div className='space-y-3'>
      {/* Nombre del documento */}
      <div className='flex items-start gap-2.5 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-3 dark:border-cyan-900/40 dark:bg-cyan-950/30'>
        <FileText className='mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400' />
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400'>
            Documento
          </p>
          <p className='text-sm font-bold text-cyan-900 dark:text-cyan-100'>
            {titulo}
          </p>
        </div>
      </div>

      {/* Metadatos */}
      <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
        {descripcion ? (
          <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
            <Info className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                Descripción
              </p>
              <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
                {String(descripcion)}
              </p>
            </div>
          </div>
        ) : null}

        {get('fecha_documento') ? (
          <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
            <CalendarDays className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                Fecha del documento
              </p>
              <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                {formatearValor(get('fecha_documento'))}
              </p>
            </div>
          </div>
        ) : null}

        {get('fecha_vencimiento') ? (
          <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
            <CalendarDays className='mt-0.5 h-4 w-4 shrink-0 text-orange-400' />
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                Fecha de vencimiento
              </p>
              <p className='mt-0.5 text-sm font-medium text-orange-700 dark:text-orange-300'>
                {formatearValor(get('fecha_vencimiento'))}
              </p>
            </div>
          </div>
        ) : null}

        {get('es_importante') ? (
          <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
            <Star className='mt-0.5 h-4 w-4 shrink-0 text-yellow-500' />
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                Importancia
              </p>
              <p className='mt-0.5 text-sm font-semibold text-yellow-700 dark:text-yellow-300'>
                Marcado como importante
              </p>
            </div>
          </div>
        ) : null}

        {(meta.categoria_nombre ?? get('tipo_documento')) ? (
          <div className='flex items-start gap-2.5 px-3 py-2'>
            <Tag className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                Categoría / Tipo
              </p>
              <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                {String(meta.categoria_nombre ?? get('tipo_documento'))}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
