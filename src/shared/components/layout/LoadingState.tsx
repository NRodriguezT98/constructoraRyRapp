/**
 * LoadingState - Estado de carga estandarizado
 *
 * Características:
 * - Spinner animado
 * - Mensaje opcional
 * - Soporte para modo oscuro
 * - Centrado y padding consistente
 */

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

export function LoadingState({
  message = 'Cargando...',
  size = 'md',
  className = ''
}: LoadingStateProps) {
  return (
    <div className={`
      flex flex-col items-center justify-center
      py-12 md:py-16 lg:py-20
      px-4
      ${className}
    `}>
      <svg
        className={`animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message && (
        <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm md:text-base">
          {message}
        </p>
      )}
    </div>
  )
}
