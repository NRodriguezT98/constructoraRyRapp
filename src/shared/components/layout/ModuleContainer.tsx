/**
 * ModuleContainer - Contenedor estandarizado para todos los módulos
 *
 * Características:
 * - Padding responsivo
 * - Fondo degradado con modo oscuro
 * - Ancho máximo configurable
 * - Altura mínima de pantalla completa
 */

interface ModuleContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
}

export function ModuleContainer({
  children,
  maxWidth = '2xl',
  className = '',
}: ModuleContainerProps) {
  return (
    <div
      className={`
        min-h-screen
        bg-gradient-to-br from-slate-50 via-white to-slate-100
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
        p-4 md:p-6 lg:p-8
        ${className}
      `}
    >
      <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>{children}</div>
    </div>
  )
}
