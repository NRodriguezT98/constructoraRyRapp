/**
 * ErrorState - Estado de error estandarizado
 *
 * Características:
 * - Icono de error
 * - Mensaje de error
 * - Botón de retry opcional
 * - Soporte para modo oscuro
 * - Colores consistentes (red)
 */

import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  title = 'Error',
  message,
  onRetry,
  retryLabel = 'Reintentar',
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-12 text-center md:py-16 lg:py-20 ${className} `}
    >
      <div className='mb-4 text-red-500 dark:text-red-400'>
        <AlertCircle size={48} />
      </div>
      <h3 className='mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100'>
        {title}
      </h3>
      <p className='mb-6 max-w-md text-slate-600 dark:text-slate-400'>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}
