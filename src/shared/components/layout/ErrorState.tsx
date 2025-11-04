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
    <div className={`
      flex flex-col items-center justify-center
      py-12 md:py-16 lg:py-20
      px-4
      text-center
      ${className}
    `}>
      <div className="text-red-500 dark:text-red-400 mb-4">
        <AlertCircle size={48} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            px-4 py-2
            bg-red-600 hover:bg-red-700
            dark:bg-red-500 dark:hover:bg-red-600
            text-white
            rounded-lg
            font-medium
            transition-colors duration-200
          "
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}
