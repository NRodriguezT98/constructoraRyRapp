'use client'

import { useEffect } from 'react'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

import Link from 'next/link'

import { logger } from '@/lib/utils/logger'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Este componente reemplaza el root layout — no puede usar framer-motion ni providers externos
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error('[GlobalError] Error crítico en root layout:', error)
  }, [error])

  return (
    <html lang='es'>
      <body className='m-0 flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-red-50/20 to-rose-50/20 p-6 font-sans dark:from-gray-900 dark:via-red-950/10 dark:to-rose-950/10'>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100% { opacity:0.5; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.1); } }
          .ring-spin { animation: spin 2s linear infinite; }
          .ring-pulse { animation: pulse 2s ease-in-out infinite; }
        `}</style>

        <div className='flex max-w-md flex-col items-center gap-6 text-center'>
          {/* Icon con animación CSS pura */}
          <div className='relative h-24 w-24'>
            <div className='ring-spin absolute inset-0 rounded-full border-4 border-transparent border-r-rose-500 border-t-red-500' />
            <div className='ring-pulse absolute inset-2 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20' />
            <div className='relative flex h-24 w-24 items-center justify-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-500/30'>
                <AlertTriangle className='h-8 w-8 text-white' strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Texto */}
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Error crítico de la aplicación
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Ocurrió un error que impidió cargar la aplicación. Puedes
              reintentar o volver al inicio.
            </p>
            {error.digest && (
              <p className='font-mono text-xs text-gray-400 dark:text-gray-600'>
                Ref: {error.digest}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className='flex gap-3'>
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
          </div>
        </div>
      </body>
    </html>
  )
}
