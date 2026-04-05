/**
 * RendererGenerico - Fallback cuando no hay renderer específico
 * Muestra datos en formato JSON formateado
 */

'use client'

import { AlertCircle } from 'lucide-react'

import type { RendererAuditoriaProps } from '@/modules/auditorias/types'

export function RendererGenerico({
  metadata,
  datosNuevos,
  datosAnteriores,
}: RendererAuditoriaProps) {
  return (
    <div className='space-y-4 p-6'>
      {/* Mensaje informativo */}
      <div className='flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
        <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
        <div>
          <p className='mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300'>
            Vista Genérica
          </p>
          <p className='text-xs text-blue-700 dark:text-blue-400'>
            No hay un renderer personalizado para este tipo de auditoría.
            Mostrando datos en formato estándar.
          </p>
        </div>
      </div>

      {/* Metadata */}
      {metadata && Object.keys(metadata).length > 0 && (
        <div className='rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
          <h3 className='mb-3 text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300'>
            Información Adicional
          </h3>
          <div className='space-y-2'>
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className='flex items-start gap-3'>
                <span className='min-w-[150px] text-xs font-semibold text-gray-500 dark:text-gray-400'>
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className='flex-1 text-xs text-gray-700 dark:text-gray-300'>
                  {typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Datos Nuevos */}
      {datosNuevos && (
        <div className='rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
          <h3 className='mb-3 text-sm font-bold uppercase tracking-wide text-green-700 dark:text-green-300'>
            Datos Nuevos
          </h3>
          <pre className='overflow-x-auto font-mono text-xs text-gray-700 dark:text-gray-300'>
            {JSON.stringify(datosNuevos, null, 2)}
          </pre>
        </div>
      )}

      {/* Datos Anteriores (para updates) */}
      {datosAnteriores && (
        <div className='rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20'>
          <h3 className='mb-3 text-sm font-bold uppercase tracking-wide text-orange-700 dark:text-orange-300'>
            Datos Anteriores
          </h3>
          <pre className='overflow-x-auto font-mono text-xs text-gray-700 dark:text-gray-300'>
            {JSON.stringify(datosAnteriores, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
