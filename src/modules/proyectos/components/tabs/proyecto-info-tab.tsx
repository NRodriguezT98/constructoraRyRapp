'use client'

import { Info } from 'lucide-react'

import { Proyecto } from '../../types'

interface ProyectoInfoTabProps {
  proyecto: Proyecto
}

/**
 * Tab de información del proyecto
 * Componente de presentación puro
 */
export function ProyectoInfoTab({ proyecto }: ProyectoInfoTabProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <div className='mb-4 flex items-center gap-2.5'>
        <div className='rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900/20'>
          <Info className='h-5 w-5 text-blue-600 dark:text-blue-400' />
        </div>
        <div>
          <h2 className='text-base font-bold text-gray-900 dark:text-white'>
            Información del Proyecto
          </h2>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Detalles generales y configuración
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
            Nombre del Proyecto
          </label>
          <p className='text-sm font-semibold text-gray-900 dark:text-white'>
            {proyecto.nombre}
          </p>
        </div>

        <div>
          <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
            Ubicación
          </label>
          <p className='text-sm text-gray-900 dark:text-white'>{proyecto.ubicacion}</p>
        </div>

        <div className='md:col-span-2'>
          <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
            Descripción
          </label>
          <p className='text-xs text-gray-700 dark:text-gray-300'>
            {proyecto.descripcion}
          </p>
        </div>

        <div>
          <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
            Responsable
          </label>
          <p className='text-sm text-gray-900 dark:text-white'>
            {proyecto.responsable}
          </p>
        </div>

        <div>
          <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
            Estado
          </label>
          <span className='inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400'>
            {proyecto.estado}
          </span>
        </div>

        <div>
          <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
            Teléfono
          </label>
          <p className='text-sm text-gray-900 dark:text-white'>{proyecto.telefono}</p>
        </div>

        <div>
          <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
            Email
          </label>
          <p className='text-sm text-gray-900 dark:text-white'>{proyecto.email}</p>
        </div>
      </div>
    </div>
  )
}
