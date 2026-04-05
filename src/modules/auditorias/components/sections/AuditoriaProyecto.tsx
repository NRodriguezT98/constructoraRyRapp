/**
 * AuditoriaProyecto - Card de información de proyecto
 * Reutilizable en CREATE, UPDATE, DELETE
 */

'use client'

import { Building2, MapPin } from 'lucide-react'

interface AuditoriaProyectoProps {
  nombre: string
  ubicacion?: string
  descripcion?: string
}

export function AuditoriaProyecto({
  nombre,
  ubicacion,
  descripcion,
}: AuditoriaProyectoProps) {
  return (
    <div className='rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4 backdrop-blur-sm dark:border-blue-800/50'>
      <div className='mb-3 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg'>
          <Building2 className='h-5 w-5 text-white' />
        </div>
        <h3 className='text-sm font-bold uppercase tracking-wide text-blue-900 dark:text-blue-300'>
          Proyecto
        </h3>
      </div>

      <p className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
        {nombre}
      </p>

      {ubicacion && (
        <div className='mb-3 flex items-center gap-2'>
          <MapPin className='h-4 w-4 text-gray-500 dark:text-gray-400' />
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {ubicacion}
          </p>
        </div>
      )}

      {descripcion && (
        <div className='mt-3 border-t border-blue-200/50 pt-3 dark:border-blue-800/50'>
          <p className='mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400'>
            Descripción
          </p>
          <p className='text-sm text-gray-700 dark:text-gray-300'>
            {descripcion}
          </p>
        </div>
      )}
    </div>
  )
}
