'use client'

import { motion } from 'framer-motion'

/**
 * Skeleton de carga para proyectos — imita la vista de tabla real
 */
const COLS = [
  { w: '25%' }, // Proyecto (nombre + icon)
  { w: '22%' }, // Ubicación
  { w: '12%' }, // Estado
  { w: '28%' }, // Viviendas (stats grid + barra progreso)
  { w: '13%' }, // Acciones
]

export function ProyectosSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className='overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'
    >
      {/* Barra de color del módulo */}
      <div className='h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500' />

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
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className='flex items-center gap-3 px-4 py-4'>
            {/* Proyecto — icon + nombre */}
            <div className='flex items-center gap-2.5' style={{ width: '25%' }}>
              <div className='h-8 w-8 flex-shrink-0 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700' />
              <div className='flex-1 space-y-1.5'>
                <div
                  className='h-3.5 animate-pulse rounded bg-gray-200 dark:bg-gray-700'
                  style={{ width: `${55 + ((row * 13) % 35)}%` }}
                />
              </div>
            </div>
            {/* Ubicación */}
            <div style={{ width: '22%' }}>
              <div
                className='h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-800'
                style={{ width: `${50 + ((row * 9) % 35)}%` }}
              />
            </div>
            {/* Estado badge */}
            <div style={{ width: '12%' }}>
              <div className='h-5 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
            </div>
            {/* Viviendas stats — mini grid + barra */}
            <div className='space-y-2' style={{ width: '28%' }}>
              <div className='flex gap-2'>
                {[1, 2, 3].map(k => (
                  <div
                    key={k}
                    className='h-8 w-14 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800'
                  />
                ))}
              </div>
              <div className='h-2 w-full animate-pulse rounded-full bg-gray-100 dark:bg-gray-800' />
            </div>
            {/* Acciones */}
            <div className='flex gap-1.5' style={{ width: '13%' }}>
              <div className='h-7 w-7 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
              <div className='h-7 w-7 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
              <div className='h-7 w-7 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
