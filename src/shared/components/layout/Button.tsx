/**
 * Button - Componente de botón estandarizado
 *
 * Características:
 * - Variantes: primary, secondary, ghost, danger
 * - Tamaños: sm, md, lg
 * - Estados: loading, disabled
 * - Soporte para iconos
 * - Soporte para modo oscuro
 * - Animaciones suaves
 */

import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const variantStyles = {
  primary: `
    bg-blue-600 hover:bg-blue-700
    dark:bg-blue-500 dark:hover:bg-blue-600
    text-white
    shadow-sm hover:shadow-md
  `,
  secondary: `
    bg-slate-200 hover:bg-slate-300
    dark:bg-slate-700 dark:hover:bg-slate-600
    text-slate-900 dark:text-slate-100
    shadow-sm hover:shadow-md
  `,
  ghost: `
    bg-transparent hover:bg-slate-100
    dark:hover:bg-slate-800
    text-slate-700 dark:text-slate-300
  `,
  danger: `
    bg-red-600 hover:bg-red-700
    dark:bg-red-500 dark:hover:bg-red-600
    text-white
    shadow-sm hover:shadow-md
  `,
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      type={type}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg
        font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-[1.02]
        active:scale-[0.98]
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
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
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  )
}
