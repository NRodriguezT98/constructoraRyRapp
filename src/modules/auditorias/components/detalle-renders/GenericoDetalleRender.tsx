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

export function GenericoDetalleRender({ registro }: GenericoDetalleRenderProps) {
  return (
    <div className="space-y-4">
      {registro.datosNuevos && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Datos del Registro
          </label>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 overflow-auto max-h-64 border border-gray-200 dark:border-gray-700">
            <pre className="text-xs text-gray-900 dark:text-gray-100 font-mono">
              {JSON.stringify(registro.datosNuevos, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {registro.metadata && Object.keys(registro.metadata).length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Metadata Adicional
          </label>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 overflow-auto max-h-64 border border-gray-200 dark:border-gray-700">
            <pre className="text-xs text-gray-900 dark:text-gray-100 font-mono">
              {JSON.stringify(registro.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {registro.cambiosEspecificos && Object.keys(registro.cambiosEspecificos).length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Cambios Específicos
          </label>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 overflow-auto max-h-64 border border-gray-200 dark:border-gray-700">
            <pre className="text-xs text-gray-900 dark:text-gray-100 font-mono">
              {JSON.stringify(registro.cambiosEspecificos, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
