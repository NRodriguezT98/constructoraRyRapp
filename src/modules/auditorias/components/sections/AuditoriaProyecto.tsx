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

export function AuditoriaProyecto({ nombre, ubicacion, descripcion }: AuditoriaProyectoProps) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
          Proyecto
        </h3>
      </div>

      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {nombre}
      </p>

      {ubicacion && (
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{ubicacion}</p>
        </div>
      )}

      {descripcion && (
        <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-blue-800/50">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
            Descripción
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {descripcion}
          </p>
        </div>
      )}
    </div>
  )
}
