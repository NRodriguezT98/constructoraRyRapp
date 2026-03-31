'use client'

import { useEffect } from 'react'

import { motion } from 'framer-motion'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

import Link from 'next/link'

import { logger } from '@/lib/utils/logger'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log to an error reporting service if available
    logger.error('[GlobalError]', error)
  }, [error])

  return (
    <div className='flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 via-red-50/20 to-rose-50/20 dark:from-gray-900 dark:via-red-950/10 dark:to-rose-950/10'>
      <div className='flex max-w-md flex-col items-center gap-6 px-6 text-center'>
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className='relative'
        >
          <div className='flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-500/30'>
            <AlertTriangle className='h-12 w-12 text-white' strokeWidth={2} />
          </div>
          <motion.div
            className='absolute inset-0 rounded-3xl border-2 border-red-400/50'
            animate={{ scale: [1, 1.15, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className='space-y-2'
        >
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Algo salió mal
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Ocurrió un error inesperado. Puedes intentar recargar la página o
            volver al inicio.
          </p>
          {error.digest && (
            <p className='font-mono text-xs text-gray-400 dark:text-gray-600'>
              Ref: {error.digest}
            </p>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className='flex gap-3'
        >
          <button
            onClick={reset}
            className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105 hover:shadow-red-500/40 active:scale-95'
          >
            <RefreshCw className='h-4 w-4' />
            Reintentar
          </button>
          <Link
            href='/'
            className='inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:scale-105 hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            <Home className='h-4 w-4' />
            Inicio
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
