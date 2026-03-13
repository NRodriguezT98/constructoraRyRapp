/**
 * Componente: Header de Card de Versión
 * Header colapsable con información resumida del cambio
 * ✅ Separación de responsabilidades: Solo UI, recibe datos procesados
 */

'use client'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { ChevronDown, ChevronUp, Clock, Plus, RefreshCw, Trash2 } from 'lucide-react'
import type { SnapshotVersion } from '../../../hooks/useHistorialVersiones'
import { getTipoCambioLabel } from '../historial-helpers'
import { TipoCambioIcon } from './TipoCambioIcon'

interface VersionCardHeaderProps {
  version: SnapshotVersion
  isLatest: boolean
  isExpanded: boolean
  onToggle: () => void
}

export function VersionCardHeader({ version, isLatest, isExpanded, onToggle }: VersionCardHeaderProps) {
  const resumen = version.datos_nuevos?.resumen

  return (
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* Badge Versión */}
        <div
          className={`
            px-3 py-1 rounded-full text-sm font-bold
            ${
              isLatest
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }
          `}
        >
          v{version.version}
        </div>

        {/* Info */}
        <div className="text-left flex-1">
          <div className="flex items-center gap-2">
            <TipoCambioIcon tipoCambio={version.tipo_cambio} />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {getTipoCambioLabel(version.tipo_cambio)}
            </p>
          </div>

          {/* Motivo */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Motivo:</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
              "{version.datos_nuevos?.motivo_usuario || version.razon_cambio}"
            </p>
          </div>

          {/* Resumen de cambios */}
          {resumen ? (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Cambios realizados:
              </p>
              <div className="flex items-center gap-3 text-xs">
                {resumen.agregadas > 0 && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Plus className="w-3 h-3" />
                    {resumen.agregadas} agregada(s)
                  </span>
                )}
                {resumen.eliminadas > 0 && (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <Trash2 className="w-3 h-3" />
                    {resumen.eliminadas} eliminada(s)
                  </span>
                )}
                {resumen.modificadas > 0 && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <RefreshCw className="w-3 h-3" />
                    {resumen.modificadas} modificada(s)
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Fecha y usuario */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
              <Clock className="w-3 h-3" />
              <span className="font-medium">Fecha:</span>
              {formatDateCompact(version.fecha_cambio)}
            </div>
            {version.usuario_nombre && (
              <div className="flex items-center gap-1 text-xs">
                <span className="font-medium text-gray-500 dark:text-gray-500">Realizado por:</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                  {version.usuario_nombre}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expand Icon */}
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </button>
  )
}
