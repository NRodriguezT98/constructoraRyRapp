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
    <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <div className='mb-6 flex items-center gap-3'>
        <div className='rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20'>
          <Info className='h-6 w-6 text-blue-600 dark:text-blue-400' />
        </div>
        <div>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Información del Proyecto
          </h2>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Detalles generales y configuración
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Nombre del Proyecto
          </label>
          <p className='font-semibold text-gray-900 dark:text-white'>
            {proyecto.nombre}
          </p>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Ubicación
          </label>
          <p className='text-gray-900 dark:text-white'>{proyecto.ubicacion}</p>
        </div>

        <div className='md:col-span-2'>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Descripción
          </label>
          <p className='text-gray-700 dark:text-gray-300'>
            {proyecto.descripcion}
          </p>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Responsable
          </label>
          <p className='text-gray-900 dark:text-white'>
            {proyecto.responsable}
          </p>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Estado
          </label>
          <span className='inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400'>
            {proyecto.estado}
          </span>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Teléfono
          </label>
          <p className='text-gray-900 dark:text-white'>{proyecto.telefono}</p>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Email
          </label>
          <p className='text-gray-900 dark:text-white'>{proyecto.email}</p>
        </div>
      </div>
    </div>
  )
}
