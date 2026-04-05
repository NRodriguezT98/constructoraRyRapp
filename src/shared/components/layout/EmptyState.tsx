/**
 * EmptyState - Estado vacío estandarizado
 *
 * Características:
 * - Icono configurable
 * - Título y descripción
 * - Acción opcional (botón)
 * - Soporte para modo oscuro
 * - Centrado y padding consistente
 */

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-12 text-center md:py-16 lg:py-20 ${className} `}
    >
      {icon && (
        <div className='mb-4 text-slate-400 dark:text-slate-500'>{icon}</div>
      )}
      <h3 className='mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100'>
        {title}
      </h3>
      {description && (
        <p className='mb-6 max-w-md text-slate-600 dark:text-slate-400'>
          {description}
        </p>
      )}
      {action && <div className='mt-4'>{action}</div>}
    </div>
  )
}
