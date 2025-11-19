'use client'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log completo del error
    console.error('🔴 ERROR EN DETALLE DE VIVIENDA:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      name: error.name,
      fullError: error,
    })

    // También guardarlo en sessionStorage para no perderlo
    try {
      sessionStorage.setItem('last_vivienda_error', JSON.stringify({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }))
    } catch (e) {
      console.error('No se pudo guardar error en sessionStorage:', e)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center text-center">
          {/* Icono de error */}
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error al cargar vivienda
          </h1>

          {/* Mensaje de error */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {error.message || 'Ocurrió un error inesperado'}
          </p>

          {/* Stack trace (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && error.stack && (
            <div className="w-full mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-x-auto">
              <pre className="text-xs text-left text-red-600 dark:text-red-400 whitespace-pre-wrap">
                {error.stack}
              </pre>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 w-full">
            <button
              onClick={() => window.location.href = '/viviendas'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Volver a Viviendas
            </button>
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>

          {/* Instrucción para ver error */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            El error completo está en la consola del navegador (F12)
          </p>
        </div>
      </div>
    </div>
  )
}
