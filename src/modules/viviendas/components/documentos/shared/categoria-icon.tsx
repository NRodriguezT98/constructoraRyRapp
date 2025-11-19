'use client'

import * as LucideIcons from 'lucide-react'

interface CategoriaIconProps {
  icono: string
  color?: string
  size?: number
  className?: string
}

export function CategoriaIcon({
  icono,
  color = 'blue',
  size = 24,
  className = '',
}: CategoriaIconProps) {
  // Obtener el componente de ícono dinámicamente
  const IconComponent = (LucideIcons as any)[icono] || LucideIcons.Folder

  // Mapeo de colores a clases de Tailwind
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    yellow: 'text-yellow-500',
    pink: 'text-pink-500',
    indigo: 'text-indigo-500',
    orange: 'text-orange-500',
    teal: 'text-teal-500',
    cyan: 'text-cyan-500',
    gray: 'text-gray-500',
  }

  return (
    <IconComponent
      size={size}
      className={`${colorClasses[color] || colorClasses.blue} ${className}`}
    />
  )
}
