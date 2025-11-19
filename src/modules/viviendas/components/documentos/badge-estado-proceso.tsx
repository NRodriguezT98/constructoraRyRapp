/**
 * 🎯 BADGE DE ESTADO DE PROCESO
 *
 * Muestra el estado del paso del proceso del cual proviene un documento.
 * Ayuda a distinguir entre documentos de pasos completados vs en proceso.
 */

'use client'

import { CheckCircle2, Clock, Upload } from 'lucide-react'

interface BadgeEstadoProcesoProps {
  estadoPaso: 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido'
  className?: string
}

export function BadgeEstadoProceso({ estadoPaso, className = '' }: BadgeEstadoProcesoProps) {
  const configs = {
    'Completado': {
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle2,
      label: 'Completado'
    },
    'En Proceso': {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: Clock,
      label: 'En Proceso'
    },
    'Pendiente': {
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: Upload,
      label: 'Pendiente'
    },
    'Omitido': {
      color: 'bg-gray-100 text-gray-500 border-gray-200',
      icon: Upload,
      label: 'Omitido'
    }
  }

  const config = configs[estadoPaso]
  const Icon = config.icon

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        border ${config.color} ${className}
      `}
      title={`Paso ${config.label.toLowerCase()}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
