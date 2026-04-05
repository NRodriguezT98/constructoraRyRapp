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
      <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
        <div className='flex-1'>
          <h1 className='mb-2 flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl'>
            {icon && (
              <span className='flex-shrink-0 text-blue-600 dark:text-blue-400'>
                {icon}
              </span>
            )}
            <span>{title}</span>
          </h1>
          {description && (
            <p className='max-w-3xl text-sm text-slate-600 dark:text-slate-400 md:text-base'>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className='flex flex-shrink-0 items-center gap-2'>{actions}</div>
        )}
      </div>
    </div>
  )
}
