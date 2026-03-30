'use client'

import { motion } from 'framer-motion'

/**
 * Skeleton de carga para la página principal de Abonos.
 * Replica la estructura: Header + Métricas + Filtros + Lista.
 */
export function AbonosSkeleton() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950'>
      <div className='mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='h-24 animate-pulse rounded-2xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700'
        />

        {/* Métricas Skeleton */}
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className='h-20 animate-pulse rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700'
            />
          ))}
        </div>

        {/* Filtros Skeleton */}
        <div className='h-28 animate-pulse rounded-2xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700' />

        {/* Lista Skeleton */}
        <div className='divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-lg dark:divide-gray-700/50 dark:border-gray-700/50 dark:bg-gray-800'>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className='flex items-center gap-3 px-4 py-3'
            >
              <div className='h-9 w-9 flex-shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
              <div className='flex-1 space-y-1.5'>
                <div className='h-3.5 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                <div className='h-2.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
              </div>
              <div className='hidden w-40 items-center gap-2 sm:flex'>
                <div className='h-1.5 flex-1 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
                <div className='h-3 w-7 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
              </div>
              <div className='hidden w-32 lg:block'>
                <div className='h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
