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
    <div className={`
      flex flex-col items-center justify-center
      py-12 md:py-16 lg:py-20
      px-4
      text-center
      ${className}
    `}>
      {icon && (
        <div className="text-slate-400 dark:text-slate-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}
