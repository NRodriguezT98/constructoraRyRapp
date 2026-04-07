/**
 * ActualizacionDocumentoClienteRenderer
 *
 * Muestra el diff legible de una edición de documento de cliente.
 * Lee `metadata.cambios` que almacena { anterior, nuevo } por campo.
 */

'use client'

import { ArrowRight, Calendar, FileText, Tag, Type } from 'lucide-react'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import type { RendererAuditoriaProps } from '@/modules/auditorias/types'

// Mapa de campos técnicos → etiquetas legibles
const CAMPO_LABELS: Record<string, string> = {
  titulo: 'Título',
  descripcion: 'Descripción',
  categoria_id: 'Categoría',
  fecha_documento: 'Fecha del documento',
  fecha_vencimiento: 'Fecha de vencimiento',
}

// Iconos por campo
const CAMPO_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  titulo: Type,
  descripcion: FileText,
  categoria_id: Tag,
  fecha_documento: Calendar,
  fecha_vencimiento: Calendar,
}

/** Formatea un valor para mostrarlo de forma legible */
function formatValor(campo: string, valor: unknown): string {
  if (valor == null || valor === '') return '(vacío)'
  if (campo.startsWith('fecha_') && typeof valor === 'string') {
    return formatDateForDisplay(valor)
  }
  return String(valor)
}

interface CambioEntry {
  anterior: unknown
  nuevo: unknown
}

export function ActualizacionDocumentoClienteRenderer({
  metadata,
}: RendererAuditoriaProps) {
  const titulo = metadata?.titulo as string | undefined
  const cambios = (metadata?.cambios ?? {}) as Record<string, CambioEntry>
  const camposModificados = Object.keys(cambios)

  return (
    <div className='space-y-3 px-4 py-3'>
      {/* Documento afectado */}
      {titulo ? (
        <div className='flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/50'>
          <FileText className='mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600 dark:text-cyan-400' />
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
              Documento:
            </p>
            <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
              {titulo}
            </p>
          </div>
        </div>
      ) : null}

      {/* Resumen */}
      <div className='flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-950/30'>
        <FileText className='h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
        <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
          {camposModificados.length} campo
          {camposModificados.length !== 1 ? 's' : ''} modificado
          {camposModificados.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Diff por campo */}
      <div className='space-y-3'>
        {camposModificados.map(campo => {
          const Icon = CAMPO_ICONS[campo] ?? FileText
          const label = CAMPO_LABELS[campo] ?? campo
          const anterior = formatValor(campo, cambios[campo].anterior)
          const nuevo = formatValor(campo, cambios[campo].nuevo)

          return (
            <div
              key={campo}
              className='overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 p-4 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'
            >
              {/* Nombre del campo */}
              <div className='mb-3 flex items-center gap-3'>
                <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30'>
                  <Icon className='h-4 w-4 text-white' />
                </div>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {label}
                </p>
              </div>

              {/* Antes → Después */}
              <div className='flex items-start gap-2'>
                {/* Valor anterior */}
                <div className='min-w-0 flex-1'>
                  <p className='mb-1 text-xs font-medium text-red-600 dark:text-red-400'>
                    Antes
                  </p>
                  <div className='rounded border border-red-300 bg-red-50 px-2.5 py-1.5 dark:border-red-800 dark:bg-red-950/50'>
                    <p className='break-words text-sm text-red-900 line-through dark:text-red-200'>
                      {anterior}
                    </p>
                  </div>
                </div>

                <ArrowRight className='mt-6 h-4 w-4 flex-shrink-0 text-gray-400' />

                {/* Valor nuevo */}
                <div className='min-w-0 flex-1'>
                  <p className='mb-1 text-xs font-medium text-green-600 dark:text-green-400'>
                    Ahora
                  </p>
                  <div className='rounded border border-green-300 bg-green-50 px-2.5 py-1.5 dark:border-green-800 dark:bg-green-950/50'>
                    <p className='break-words text-sm font-semibold text-green-900 dark:text-green-200'>
                      {nuevo}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Fallback si no hay cambios estructurados */}
      {camposModificados.length === 0 ? (
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          No hay detalle de cambios disponible.
        </p>
      ) : null}
    </div>
  )
}
