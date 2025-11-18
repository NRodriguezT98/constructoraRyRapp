/**
 * AuditoriaMetadata - Información técnica de la sesión
 * Navegador, ID de registro, IP, etc.
 */

'use client'

import { Monitor } from 'lucide-react'

interface AuditoriaMetadataProps {
  navegador?: string
  registroId?: string
  ip?: string
}

export function AuditoriaMetadata({ navegador, registroId, ip }: AuditoriaMetadataProps) {
  if (!navegador && !registroId && !ip) return null

  return (
    <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Monitor className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Información Técnica de la Sesión
        </h3>
      </div>

      <div className="space-y-2">
        {navegador && (
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 min-w-[80px]">
              Navegador:
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">
              {navegador}
            </span>
          </div>
        )}

        {registroId && (
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 min-w-[80px]">
              ID Registro:
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">
              {registroId}
            </span>
          </div>
        )}

        {ip && (
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 min-w-[80px]">
              IP:
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">
              {ip}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
