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

export function AuditoriaManzanas({ manzanas, totalViviendas }: AuditoriaManzanasProps) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
            <Home className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
            Manzanas
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md">
            <Home className="w-3 h-3" />
            {manzanas.length}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold shadow-md">
            <Building2 className="w-3 h-3" />
            {totalViviendas}
          </span>
        </div>
      </div>

      {/* Grid de manzanas */}
      <div className="space-y-2 mt-4">
        {manzanas.map((manzana, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-emerald-200/30 dark:border-emerald-800/30 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {manzana.nombre}
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                Manzana {manzana.nombre}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {manzana.numero_viviendas} viviendas
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
