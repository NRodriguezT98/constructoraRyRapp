'use client'

import type { ClienteResumen } from '../types'

interface MensajeEliminarClienteProps {
  clienteId: string
  clientes: ClienteResumen[]
}

export function MensajeEliminarCliente({
  clienteId,
  clientes,
}: MensajeEliminarClienteProps) {
  const nombreCliente = clientes.find(c => c.id === clienteId)?.nombre_completo

  return (
    <div className='space-y-4'>
      <p className='text-base'>
        ¿Estás seguro de eliminar al cliente{' '}
        <span className='font-bold text-gray-900 dark:text-white'>
          {nombreCliente}
        </span>
        ?
      </p>

      <div className='rounded-xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20'>
        <div className='mb-3 flex items-center gap-2'>
          <span className='text-xl'>⚠️</span>
          <h4 className='font-bold text-amber-900 dark:text-amber-100'>
            Restricciones
          </h4>
        </div>
        <ul className='space-y-2 text-sm text-amber-900 dark:text-amber-100'>
          <li className='flex items-start gap-2'>
            <span className='mt-0.5 text-amber-600 dark:text-amber-400'>▸</span>
            <span>
              Solo clientes en estado <strong>&quot;Interesado&quot;</strong>
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='mt-0.5 text-amber-600 dark:text-amber-400'>▸</span>
            <span>Sin viviendas asignadas</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='mt-0.5 text-amber-600 dark:text-amber-400'>▸</span>
            <span>Sin historial de negociaciones</span>
          </li>
        </ul>
      </div>

      <div className='rounded-xl border-2 border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20'>
        <div className='flex items-start gap-2'>
          <span className='text-lg'>💡</span>
          <p className='text-sm text-blue-900 dark:text-blue-100'>
            <strong>Alternativa:</strong> Usa el estado{' '}
            <strong>&quot;Inactivo&quot;</strong> para mantener la trazabilidad
            en lugar de eliminar.
          </p>
        </div>
      </div>
    </div>
  )
}
