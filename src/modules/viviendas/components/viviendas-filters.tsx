'use client'

import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { VIVIENDA_ESTADOS } from '../constants'
import { viviendasService } from '../services/viviendas.service'
import type { FiltrosViviendas, Proyecto } from '../types'

interface ViviendasFiltersProps {
  filtros: FiltrosViviendas
  onFiltrosChange: (filtros: Partial<FiltrosViviendas>) => void
  onLimpiarFiltros: () => void
}

/**
 * Barra de filtros para viviendas
 * Componente presentacional con mínima lógica local (solo para cargar proyectos)
 */
export function ViviendasFilters({
  filtros,
  onFiltrosChange,
  onLimpiarFiltros,
}: ViviendasFiltersProps) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // Cargar proyectos al montar
  useEffect(() => {
    viviendasService.obtenerProyectos().then(setProyectos).catch(console.error)
  }, [])

  const hayFiltrosActivos = filtros.busqueda || filtros.proyectoId || filtros.estado

  return (
    <div className='space-y-4'>
      {/* Barra de búsqueda y selectores */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        {/* Búsqueda moderna */}
        <div className='relative flex-1'>
          <Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            value={filtros.busqueda || ''}
            onChange={e => onFiltrosChange({ busqueda: e.target.value })}
            placeholder='Buscar por matrícula, nomenclatura o número...'
            className='h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-emerald-400'
          />
        </div>

        {/* Filtros rápidos */}
        <div className='flex gap-2'>
          <select
            value={filtros.proyectoId || ''}
            onChange={e => onFiltrosChange({ proyectoId: e.target.value || undefined })}
            className='h-12 min-w-[160px] rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
          >
            <option value=''>Todos los proyectos</option>
            {proyectos.map(proyecto => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>

          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-medium shadow-sm transition-all ${
              mostrarFiltros || filtros.estado
                ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750'
            }`}
          >
            Estado
            {filtros.estado && <span className='text-xs'>✓</span>}
          </button>

          {hayFiltrosActivos && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={onLimpiarFiltros}
              className='flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750'
              title='Limpiar filtros'
            >
              <X className='h-5 w-5' />
            </motion.button>
          )}
        </div>
      </div>

      {/* Panel de estados desplegable */}
      {mostrarFiltros && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className='overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'
        >
          <h3 className='mb-3 text-sm font-semibold text-gray-900 dark:text-white'>
            Filtrar por estado
          </h3>
          <div className='flex flex-wrap gap-2'>
            {VIVIENDA_ESTADOS.map(estado => (
              <button
                key={estado.value}
                onClick={() =>
                  onFiltrosChange({
                    estado: filtros.estado === estado.value ? undefined : (estado.value as any),
                  })
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  filtros.estado === estado.value
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {estado.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
