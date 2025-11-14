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

export function ProyectosBadgesResumen({ totalManzanas, totalViviendas }: ProyectosBadgesResumenProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Badge Manzanas */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
        <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-emerald-900 dark:text-white font-bold">{totalManzanas}</span>
        <span>{totalManzanas === 1 ? 'Manzana' : 'Manzanas'}</span>
      </div>

      {/* Badge Viviendas */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 border-2 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-xs font-semibold">
        <Home className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        <span className="text-teal-900 dark:text-white font-bold">{totalViviendas}</span>
        <span>{totalViviendas === 1 ? 'Vivienda' : 'Viviendas'}</span>
      </div>
    </div>
  )
}
