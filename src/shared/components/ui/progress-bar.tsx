/**
 * Barra de progreso reutilizable
 * Componente presentacional puro con animaciones
 */

import { motion } from 'framer-motion'

interface ProgressBarProps {
  porcentaje: number // 0-100
  label?: string
  showPercentage?: boolean
  height?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const heightClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
}

const variantColors = {
  default: 'from-blue-500 to-blue-600',
  success: 'from-emerald-500 to-emerald-600',
  warning: 'from-yellow-500 to-yellow-600',
  danger: 'from-red-500 to-red-600',
}

/**
 * Determina el color según el porcentaje
 */
function getColorByPercentage(porcentaje: number): keyof typeof variantColors {
  if (porcentaje >= 100) return 'success'
  if (porcentaje >= 75) return 'success'
  if (porcentaje >= 50) return 'default'
  if (porcentaje >= 25) return 'warning'
  return 'danger'
}

export function ProgressBar({
  porcentaje,
  label,
  showPercentage = true,
  height = 'md',
  variant,
}: ProgressBarProps) {
  // Auto-determinar color si no se especifica variante
  const colorVariant = variant || getColorByPercentage(porcentaje)
  const clampedPercentage = Math.min(Math.max(porcentaje, 0), 100)

  return (
    <div className="w-full space-y-1">
      {/* Label superior */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="font-semibold text-gray-900 dark:text-white">
              {clampedPercentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      {/* Barra de progreso */}
      <div
        className={`
          w-full overflow-hidden rounded-full
          bg-gray-200 dark:bg-gray-700
          ${heightClasses[height]}
        `}
      >
        <motion.div
          className={`
            h-full rounded-full
            bg-gradient-to-r ${variantColors[colorVariant]}
            shadow-sm
          `}
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercentage}%` }}
          transition={{
            duration: 1,
            ease: 'easeOut',
          }}
        />
      </div>
    </div>
  )
}
