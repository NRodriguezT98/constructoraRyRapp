'use client'

import { motion } from 'framer-motion'

/**
 * Skeleton de carga para viviendas — imita la vista de tabla real
 */
const COLS = [
  { w: '18%' }, // Vivienda (manzana + nro)
  { w: '16%' }, // Proyecto
  { w: '13%' }, // Nomenclatura
  { w: '12%' }, // Matrícula
  { w: '8%' }, // Tipo
  { w: '11%' }, // Estado
  { w: '14%' }, // Valor
  { w: '8%' }, // Acciones
]

export function ViviendasSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className='overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'
    >
      {/* Barra de color del módulo */}
      <div className='h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500' />

      {/* Cabecera de columnas */}
      <div className='flex items-center gap-3 border-b border-gray-200/60 bg-gray-50/80 px-4 py-3 dark:border-gray-700/60 dark:bg-gray-900/40'>
        {COLS.map((col, i) => (
          <div
            key={i}
            className='h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700'
            style={{ width: col.w }}
          />
        ))}
      </div>

      {/* Filas */}
      <div className='divide-y divide-gray-100 dark:divide-gray-700/50'>
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className='flex items-center gap-3 px-4 py-3'>
            {/* Vivienda — icon + texto */}
            <div className='flex items-center gap-2' style={{ width: '18%' }}>
              <div className='h-7 w-7 flex-shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
              <div
                className='h-3.5 flex-1 animate-pulse rounded bg-gray-200 dark:bg-gray-700'
                style={{ width: `${55 + ((row * 11) % 30)}%` }}
              />
            </div>
            {/* Proyecto */}
            <div style={{ width: '16%' }}>
              <div
                className='h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-800'
                style={{ width: `${60 + ((row * 7) % 30)}%` }}
              />
            </div>
            {/* Nomenclatura */}
            <div style={{ width: '13%' }}>
              <div className='h-3 w-4/5 animate-pulse rounded bg-gray-100 dark:bg-gray-800' />
            </div>
            {/* Matrícula */}
            <div style={{ width: '12%' }}>
              <div className='h-3 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-gray-800' />
            </div>
            {/* Tipo */}
            <div style={{ width: '8%' }}>
              <div className='h-3 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800' />
            </div>
            {/* Estado badge */}
            <div style={{ width: '11%' }}>
              <div className='h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
            </div>
            {/* Valor */}
            <div style={{ width: '14%' }}>
              <div className='space-y-1'>
                <div className='h-3.5 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                <div className='h-2.5 w-3/5 animate-pulse rounded bg-gray-100 dark:bg-gray-800' />
              </div>
            </div>
            {/* Acciones */}
            <div className='flex gap-1.5' style={{ width: '8%' }}>
              <div className='h-7 w-7 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
              <div className='h-7 w-7 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
