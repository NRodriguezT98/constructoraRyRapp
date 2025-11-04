/**
 * ModuleHeader - Header estandarizado para todos los módulos
 *
 * Características:
 * - Título con tamaño responsivo
 * - Descripción opcional
 * - Icono opcional
 * - Área de acciones (botones, filtros, etc.)
 * - Soporte para modo oscuro
 */

interface ModuleHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function ModuleHeader({
  title,
  description,
  icon,
  actions,
  className = '',
}: ModuleHeaderProps) {
  return (
    <div className={`mb-6 md:mb-8 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            {icon && (
              <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                {icon}
              </span>
            )}
            <span>{title}</span>
          </h1>
          {description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
