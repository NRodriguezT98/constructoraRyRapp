/**
 * ProyectosNoResults - Estado cuando hay filtros activos pero sin resultados
 * ✅ Mensaje diferente a empty state
 * ✅ Botón para limpiar filtros
 * ✅ Visual distinguible
 */

'use client'

import { motion } from 'framer-motion'
import { FilterX, Search } from 'lucide-react'

interface ProyectosNoResultsProps {
  onLimpiarFiltros: () => void
  tieneBusqueda?: boolean
  tieneEstado?: boolean
}

export function ProyectosNoResults({
  onLimpiarFiltros,
  tieneBusqueda = false,
  tieneEstado = false,
}: ProyectosNoResultsProps) {
  const getMessage = () => {
    if (tieneBusqueda && tieneEstado) {
      return 'No se encontraron proyectos que coincidan con tu búsqueda y el estado seleccionado'
    }
    if (tieneBusqueda) {
      return 'No se encontraron proyectos que coincidan con tu búsqueda'
    }
    if (tieneEstado) {
      return 'No hay proyectos con el estado seleccionado'
    }
    return 'No se encontraron resultados con los filtros aplicados'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='flex flex-col items-center justify-center px-6 py-20'
    >
      <div className='relative mb-6'>
        <div className='absolute inset-0 animate-ping opacity-20'>
          <div className='h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500' />
        </div>
        <div className='relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/50'>
          <FilterX className='h-10 w-10 text-white' />
        </div>
      </div>

      <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
        No hay resultados
      </h3>

      <p className='mb-6 max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
        {getMessage()}
      </p>

      <motion.button
        onClick={onLimpiarFiltros}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/50'
      >
        <Search className='h-4 w-4' />
        Limpiar filtros y ver todos
      </motion.button>

      <div className='mt-8 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500'>
        <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500' />
        <span>Intenta ajustar los filtros de búsqueda</span>
      </div>
    </motion.div>
  )
}
