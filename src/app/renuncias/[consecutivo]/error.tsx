'use client'

import { useEffect } from 'react'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

import { errorLog } from '@/lib/utils/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    errorLog('ERROR EN DETALLE DE RENUNCIA', error, { digest: error.digest })
  }, [error])

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900'>
      <div className='w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
            <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
          </div>

          <h1 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
            Error al cargar expediente de renuncia
          </h1>

          <p className='mb-6 text-sm text-gray-600 dark:text-gray-400'>
            {error.message ||
              'Ocurrió un error inesperado al cargar el expediente'}
          </p>

          {process.env.NODE_ENV === 'development' && error.stack ? (
            <div className='mb-6 w-full overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-900'>
              <pre className='whitespace-pre-wrap text-left text-xs text-red-600 dark:text-red-400'>
                {error.stack}
              </pre>
            </div>
          ) : null}

          <div className='flex w-full gap-3'>
            <button
              onClick={() => (window.location.href = '/renuncias')}
              className='flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-200 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              <Home className='h-4 w-4' />
              Volver a Renuncias
            </button>
            <button
              onClick={reset}
              className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700'
            >
              <RefreshCw className='h-4 w-4' />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
