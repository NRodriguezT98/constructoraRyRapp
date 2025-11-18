/**
 * RendererGenerico - Fallback cuando no hay renderer específico
 * Muestra datos en formato JSON formateado
 */

'use client'

import { AlertCircle } from 'lucide-react'

interface RendererGenericoProps {
  metadata?: any
  datosNuevos?: any
  datosAnteriores?: any
}

export function RendererGenerico({ metadata, datosNuevos, datosAnteriores }: RendererGenericoProps) {
  return (
    <div className="space-y-4 p-6">
      {/* Mensaje informativo */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
            Vista Genérica
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            No hay un renderer personalizado para este tipo de auditoría. Mostrando datos en formato estándar.
          </p>
        </div>
      </div>

      {/* Metadata */}
      {metadata && Object.keys(metadata).length > 0 && (
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
            Información Adicional
          </h3>
          <div className="space-y-2">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex items-start gap-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 min-w-[150px]">
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Datos Nuevos */}
      {datosNuevos && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <h3 className="text-sm font-bold text-green-700 dark:text-green-300 mb-3 uppercase tracking-wide">
            Datos Nuevos
          </h3>
          <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono overflow-x-auto">
            {JSON.stringify(datosNuevos, null, 2)}
          </pre>
        </div>
      )}

      {/* Datos Anteriores (para updates) */}
      {datosAnteriores && (
        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <h3 className="text-sm font-bold text-orange-700 dark:text-orange-300 mb-3 uppercase tracking-wide">
            Datos Anteriores
          </h3>
          <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono overflow-x-auto">
            {JSON.stringify(datosAnteriores, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
