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

export function AuditoriaMetadata({
  navegador,
  registroId,
  ip,
}: AuditoriaMetadataProps) {
  if (!navegador && !registroId && !ip) return null

  return (
    <div className='mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
      <div className='mb-3 flex items-center gap-2'>
        <Monitor className='h-4 w-4 text-gray-500 dark:text-gray-400' />
        <h3 className='text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
          Información Técnica de la Sesión
        </h3>
      </div>

      <div className='space-y-2'>
        {navegador && (
          <div className='flex items-start gap-2'>
            <span className='min-w-[80px] text-xs font-semibold text-gray-500 dark:text-gray-400'>
              Navegador:
            </span>
            <span className='font-mono text-xs text-gray-700 dark:text-gray-300'>
              {navegador}
            </span>
          </div>
        )}

        {registroId && (
          <div className='flex items-start gap-2'>
            <span className='min-w-[80px] text-xs font-semibold text-gray-500 dark:text-gray-400'>
              ID Registro:
            </span>
            <span className='font-mono text-xs text-gray-700 dark:text-gray-300'>
              {registroId}
            </span>
          </div>
        )}

        {ip && (
          <div className='flex items-start gap-2'>
            <span className='min-w-[80px] text-xs font-semibold text-gray-500 dark:text-gray-400'>
              IP:
            </span>
            <span className='font-mono text-xs text-gray-700 dark:text-gray-300'>
              {ip}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
