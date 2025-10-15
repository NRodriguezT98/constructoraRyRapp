'use client'

import { motion } from 'framer-motion'
import { Grid3x3, List, Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { staggerItem } from '../../../shared/styles/animations'
import { ESTADOS_PROYECTO } from '../constants'
import { useProyectosStore } from '../store/proyectos.store'

export function ProyectosSearch() {
  const { filtros, setFiltros, vista, setVista } = useProyectosStore()
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const toggleVista = () => {
    setVista(vista === 'grid' ? 'lista' : 'grid')
  }

  return (
    <motion.div variants={staggerItem} className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        {/* Barra de búsqueda moderna */}
        <div className='relative flex-1'>
          <Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            value={filtros.busqueda || ''}
            onChange={e => setFiltros({ busqueda: e.target.value })}
            placeholder='Buscar proyectos por nombre, ubicación o responsable...'
            className='h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400'
          />
        </div>

        {/* Controles a la derecha */}
        <div className='flex gap-2'>
          {/* Botón de filtros */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-medium shadow-sm transition-all ${
              mostrarFiltros
                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-400'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750'
            }`}
          >
            <SlidersHorizontal className='h-4 w-4' />
            <span className='hidden sm:inline'>Filtros</span>
          </motion.button>

          {/* Toggle de vista */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleVista}
            className='flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750'
            title={vista === 'grid' ? 'Ver como lista' : 'Ver como grid'}
          >
            {vista === 'grid' ? <List className='h-5 w-5' /> : <Grid3x3 className='h-5 w-5' />}
          </motion.button>
        </div>
      </div>

      {/* Panel de filtros desplegable */}
      {mostrarFiltros && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className='overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'
        >
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
              Filtrar por estado
            </h3>
            {filtros.estado && (
              <button
                onClick={() => setFiltros({ estado: undefined })}
                className='flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400'
              >
                <X className='h-3 w-3' />
                Limpiar
              </button>
            )}
          </div>
          <div className='flex flex-wrap gap-2'>
            {ESTADOS_PROYECTO.map(estado => (
              <button
                key={estado.value}
                onClick={() =>
                  setFiltros({
                    estado: filtros.estado === estado.value ? undefined : estado.value,
                  })
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  filtros.estado === estado.value
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 dark:bg-blue-500/20 dark:text-blue-400 dark:ring-blue-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {estado.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
