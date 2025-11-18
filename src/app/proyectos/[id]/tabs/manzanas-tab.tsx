'use client'

import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

import type { Proyecto } from '@/modules/proyectos/types'
import { formatCurrency } from '@/shared/utils/format'

interface ManzanasTabProps {
  proyecto: Proyecto
}

export function ManzanasTab({ proyecto }: ManzanasTabProps) {
  // Calcular el número óptimo de columnas según la cantidad de manzanas
  const numManzanas = proyecto.manzanas.length
  const gridCols = numManzanas === 1
    ? 'grid-cols-1' // 1 manzana: ocupa todo el ancho
    : numManzanas === 2
    ? 'grid-cols-1 sm:grid-cols-2' // 2 manzanas: 2 columnas
    : numManzanas === 3
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' // 3 manzanas: 3 columnas en desktop
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' // 4+ manzanas: hasta 4 columnas

  return (
    <motion.div
      key='manzanas'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-4'
    >
      <div className={`grid gap-4 ${gridCols}`}>
        {proyecto.manzanas.map((manzana, index) => (
          <motion.div
            key={manzana.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800'
          >
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2'>
                  <Home className='h-4 w-4 text-white' />
                </div>
                <h3 className='font-semibold text-gray-900 dark:text-white'>
                  {manzana.nombre}
                </h3>
              </div>
            </div>

            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Total Viviendas
                </span>
                <span className='font-medium text-gray-900 dark:text-white'>
                  {manzana.totalViviendas}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>Vendidas</span>
                <span className='font-medium text-green-600 dark:text-green-400'>
                  {manzana.viviendasVendidas}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Disponibles
                </span>
                <span className='font-medium text-blue-600 dark:text-blue-400'>
                  {manzana.totalViviendas - manzana.viviendasVendidas}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Precio Base
                </span>
                <span className='font-medium text-gray-900 dark:text-white'>
                  {formatCurrency(manzana.precioBase)}
                </span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className='mt-3'>
              <div className='mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400'>
                <span>Progreso</span>
                <span>
                  {Math.round(
                    (manzana.viviendasVendidas / manzana.totalViviendas) * 100
                  )}
                  %
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                <div
                  className='h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300'
                  style={{
                    width: `${(manzana.viviendasVendidas / manzana.totalViviendas) * 100}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
