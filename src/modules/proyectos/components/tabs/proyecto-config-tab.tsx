'use client'

import { Settings } from 'lucide-react'

import { Proyecto } from '../../types'

interface ProyectoConfigTabProps {
  proyecto: Proyecto
}

/**
 * Tab de configuración del proyecto
 * Componente de presentación puro
 */
export function ProyectoConfigTab({ proyecto }: ProyectoConfigTabProps) {
  return (
    <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <div className='mb-6 flex items-center gap-3'>
        <div className='rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20'>
          <Settings className='h-6 w-6 text-purple-600 dark:text-purple-400' />
        </div>
        <div>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Configuración
          </h2>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Ajustes y preferencias del proyecto
          </p>
        </div>
      </div>

      <div className='py-12 text-center'>
        <p className='text-gray-500 dark:text-gray-400'>
          Configuración en desarrollo...
        </p>
      </div>
    </div>
  )
}
