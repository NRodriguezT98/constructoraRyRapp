/**
 * Componente: Header de Card de Versión
 * Header colapsable con información resumida del cambio
 * ✅ Separación de responsabilidades: Solo UI, recibe datos procesados
 */

'use client'

import {
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { SnapshotVersion } from '@/modules/clientes/hooks/useHistorialVersiones'

import { getTipoCambioLabel } from '../historial-helpers'

import { TipoCambioIcon } from './TipoCambioIcon'

interface VersionCardHeaderProps {
  version: SnapshotVersion
  isLatest: boolean
  isExpanded: boolean
  onToggle: () => void
}

export function VersionCardHeader({
  version,
  isLatest,
  isExpanded,
  onToggle,
}: VersionCardHeaderProps) {
  const resumen = version.datos_nuevos?.resumen as
    | { agregadas?: number; eliminadas?: number; modificadas?: number }
    | null
    | undefined

  return (
    <button
      onClick={onToggle}
      className='flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50'
    >
      <div className='flex items-center gap-3'>
        {/* Badge Versión */}
        <div
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            isLatest
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          } `}
        >
          v{version.version}
        </div>

        {/* Info */}
        <div className='flex-1 text-left'>
          <div className='flex items-center gap-2'>
            <TipoCambioIcon tipoCambio={version.tipo_cambio} />
            <p className='text-sm font-semibold text-gray-900 dark:text-white'>
              {getTipoCambioLabel(version.tipo_cambio)}
            </p>
          </div>

          {/* Motivo */}
          <div className='mt-2'>
            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
              Motivo:
            </p>
            <p className='text-xs italic text-gray-600 dark:text-gray-400'>
              &quot;
              {(version.datos_nuevos?.motivo_usuario as string | undefined) ||
                version.razon_cambio}
              &quot;
            </p>
          </div>

          {/* Resumen de cambios */}
          {resumen ? (
            <div className='mt-2'>
              <p className='mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400'>
                Cambios realizados:
              </p>
              <div className='flex items-center gap-3 text-xs'>
                {(resumen.agregadas ?? 0) > 0 && (
                  <span className='flex items-center gap-1 text-green-600 dark:text-green-400'>
                    <Plus className='h-3 w-3' />
                    {resumen.agregadas} agregada(s)
                  </span>
                )}
                {(resumen.eliminadas ?? 0) > 0 && (
                  <span className='flex items-center gap-1 text-red-600 dark:text-red-400'>
                    <Trash2 className='h-3 w-3' />
                    {resumen.eliminadas} eliminada(s)
                  </span>
                )}
                {(resumen.modificadas ?? 0) > 0 && (
                  <span className='flex items-center gap-1 text-amber-600 dark:text-amber-400'>
                    <RefreshCw className='h-3 w-3' />
                    {resumen.modificadas} modificada(s)
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Fecha y usuario */}
          <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1'>
            <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500'>
              <Clock className='h-3 w-3' />
              <span className='font-medium'>Fecha:</span>
              {formatDateCompact(version.fecha_cambio)}
            </div>
            {version.usuario_nombre && (
              <div className='flex items-center gap-1 text-xs'>
                <span className='font-medium text-gray-500 dark:text-gray-500'>
                  Realizado por:
                </span>
                <span className='rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                  {version.usuario_nombre}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expand Icon */}
      {isExpanded ? (
        <ChevronUp className='h-5 w-5 text-gray-400' />
      ) : (
        <ChevronDown className='h-5 w-5 text-gray-400' />
      )}
    </button>
  )
}
