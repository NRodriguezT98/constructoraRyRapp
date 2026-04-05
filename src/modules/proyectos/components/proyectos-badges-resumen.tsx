/**
 * ProyectosBadgesResumen - Badges de resumen para header de modal
 * ✅ Muestra manzanas y viviendas totales
 * ✅ Tema verde esmeralda (proyectos)
 */

import { Building2, Home } from 'lucide-react'

interface ProyectosBadgesResumenProps {
  totalManzanas: number
  totalViviendas: number
}

export function ProyectosBadgesResumen({
  totalManzanas,
  totalViviendas,
}: ProyectosBadgesResumenProps) {
  return (
    <div className='flex items-center gap-2'>
      {/* Badge Manzanas */}
      <div className='inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'>
        <Building2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
        <span className='font-bold text-emerald-900 dark:text-white'>
          {totalManzanas}
        </span>
        <span>{totalManzanas === 1 ? 'Manzana' : 'Manzanas'}</span>
      </div>

      {/* Badge Viviendas */}
      <div className='inline-flex items-center gap-1.5 rounded-full border-2 border-teal-300 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-300'>
        <Home className='h-3.5 w-3.5 text-teal-600 dark:text-teal-400' />
        <span className='font-bold text-teal-900 dark:text-white'>
          {totalViviendas}
        </span>
        <span>{totalViviendas === 1 ? 'Vivienda' : 'Viviendas'}</span>
      </div>
    </div>
  )
}
