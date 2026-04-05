/**
 * NoResults — Estado "sin resultados" cuando hay filtros activos
 * ✅ Reutilizable en cualquier módulo con theming dinámico
 * ✅ Botón para limpiar filtros
 * ✅ Dark mode completo
 */

'use client'

import { motion } from 'framer-motion'
import { FilterX, Search } from 'lucide-react'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

interface NoResultsProps {
  moduleName?: ModuleName
  onLimpiarFiltros?: () => void
  mensaje?: string
}

export function NoResults({
  moduleName = 'proyectos',
  onLimpiarFiltros,
  mensaje = 'No se encontraron resultados con los filtros aplicados',
}: NoResultsProps) {
  const theme = moduleThemes[moduleName]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='flex flex-col items-center justify-center px-6 py-20'
    >
      <div className='relative mb-6'>
        <div className='absolute inset-0 animate-ping opacity-20'>
          <div
            className={`h-20 w-20 rounded-full ${theme.classes.badge.primary}`}
          />
        </div>
        <div
          className={`relative h-20 w-20 rounded-full bg-gradient-to-r ${theme.classes.gradient.triple} flex items-center justify-center shadow-2xl`}
        >
          <FilterX className='h-10 w-10 text-white' />
        </div>
      </div>

      <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
        No hay resultados
      </h3>

      <p className='mb-6 max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
        {mensaje}
      </p>

      {onLimpiarFiltros ? (
        <motion.button
          onClick={onLimpiarFiltros}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r px-5 py-2.5 ${theme.classes.gradient.triple} text-sm font-semibold text-white shadow-lg transition-all hover:shadow-2xl`}
        >
          <Search className='h-4 w-4' />
          Limpiar filtros y ver todos
        </motion.button>
      ) : null}

      <div className='mt-8 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500'>
        <div
          className={`h-1.5 w-1.5 rounded-full ${theme.classes.badge.primary} animate-pulse`}
        />
        <span>Intenta ajustar los filtros de búsqueda</span>
      </div>
    </motion.div>
  )
}
