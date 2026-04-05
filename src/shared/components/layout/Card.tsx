/**
 * Card - Componente de tarjeta estandarizado
 *
 * Características:
 * - Bordes redondeados consistentes (rounded-xl)
 * - Padding configurable
 * - Sombra sutil
 * - Soporte para modo oscuro
 * - Variantes de padding (sm, md, lg)
 */

interface CardProps {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

const paddingVariants = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, padding = 'md', className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${paddingVariants[padding]} ${className} `}
    >
      {children}
    </div>
  )
}
