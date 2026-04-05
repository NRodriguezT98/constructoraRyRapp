/**
 * AuditoriaManzanas - Card de manzanas con estadísticas
 * Muestra resumen y detalle de manzanas del proyecto
 */

'use client'

import { Building2, Home } from 'lucide-react'

interface Manzana {
  nombre: string
  numero_viviendas: number
}

interface AuditoriaManzanasProps {
  manzanas: Manzana[]
  totalViviendas: number
}

export function AuditoriaManzanas({
  manzanas,
  totalViviendas,
}: AuditoriaManzanasProps) {
  return (
    <div className='rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 backdrop-blur-sm dark:border-emerald-800/50'>
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg'>
            <Home className='h-5 w-5 text-white' />
          </div>
          <h3 className='text-sm font-bold uppercase tracking-wide text-emerald-900 dark:text-emerald-300'>
            Manzanas
          </h3>
        </div>

        <div className='flex items-center gap-2'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-md'>
            <Home className='h-3 w-3' />
            {manzanas.length}
          </span>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white shadow-md'>
            <Building2 className='h-3 w-3' />
            {totalViviendas}
          </span>
        </div>
      </div>

      {/* Grid de manzanas */}
      <div className='mt-4 space-y-2'>
        {manzanas.map((manzana, index) => (
          <div
            key={index}
            className='flex items-center justify-between rounded-lg border border-emerald-200/30 bg-white/50 p-3 transition-colors hover:bg-white/80 dark:border-emerald-800/30 dark:bg-gray-800/50 dark:hover:bg-gray-800/80'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 text-sm font-bold text-white shadow-md'>
                {manzana.nombre}
              </div>
              <span className='font-semibold text-gray-900 dark:text-white'>
                Manzana {manzana.nombre}
              </span>
            </div>

            <div className='flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 dark:border-emerald-800 dark:bg-emerald-900/30'>
              <Building2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              <span className='text-sm font-bold text-emerald-700 dark:text-emerald-300'>
                {manzana.numero_viviendas} viviendas
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
