/**
 * GenericoDetalleRender - Renderizado genérico para módulos sin render específico
 *
 * ✅ Componente presentacional puro
 * ✅ < 50 líneas
 * ✅ Sin lógica compleja
 */

import type { AuditLogRecord } from '../../types'

interface GenericoDetalleRenderProps {
  registro: AuditLogRecord
}

export function GenericoDetalleRender({
  registro,
}: GenericoDetalleRenderProps) {
  return (
    <div className='space-y-4'>
      {registro.datosNuevos && (
        <div className='space-y-2'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Datos del Registro
          </label>
          <div className='max-h-64 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50'>
            <pre className='font-mono text-xs text-gray-900 dark:text-gray-100'>
              {JSON.stringify(registro.datosNuevos, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {registro.metadata && Object.keys(registro.metadata).length > 0 && (
        <div className='space-y-2'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Metadata Adicional
          </label>
          <div className='max-h-64 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50'>
            <pre className='font-mono text-xs text-gray-900 dark:text-gray-100'>
              {JSON.stringify(registro.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {registro.cambiosEspecificos &&
        Object.keys(registro.cambiosEspecificos).length > 0 && (
          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Cambios Específicos
            </label>
            <div className='max-h-64 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50'>
              <pre className='font-mono text-xs text-gray-900 dark:text-gray-100'>
                {JSON.stringify(registro.cambiosEspecificos, null, 2)}
              </pre>
            </div>
          </div>
        )}
    </div>
  )
}
