'use client'

/**
 * Componente de Badge y Alerta para Estados de Versión
 * Muestra indicadores visuales de: Válida, Errónea, Obsoleta, Supersedida
 */

import { AlertTriangle, CheckCircle, Package, XCircle } from 'lucide-react'

import type { EstadoVersion } from '@/modules/documentos/types/documento.types'

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export interface EstadoVersionBadgeProps {
  estado: EstadoVersion
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function EstadoVersionBadge({
  estado,
  size = 'md',
  showIcon = true,
}: EstadoVersionBadgeProps) {
  const getConfig = () => {
    switch (estado) {
      case 'valida':
        return {
          label: 'Válida',
          icon: CheckCircle,
          className:
            'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
        }
      case 'erronea':
        return {
          label: 'Errónea',
          icon: XCircle,
          className:
            'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
        }
      case 'obsoleta':
        return {
          label: 'Obsoleta',
          icon: Package,
          className:
            'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700',
        }
      case 'supersedida':
        return {
          label: 'Supersedida',
          icon: AlertTriangle,
          className:
            'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
        }
      default:
        return {
          label: 'Desconocido',
          icon: AlertTriangle,
          className:
            'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700',
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full border-2 font-bold ${config.className}`}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  )
}

// ============================================================================
// ALERT COMPONENT
// ============================================================================

export interface EstadoVersionAlertProps {
  estado: EstadoVersion
  motivo?: string | null
  versionCorrectaId?: string | null
  onVerVersionCorrecta?: () => void
}

export function EstadoVersionAlert({
  estado,
  motivo,
  versionCorrectaId,
  onVerVersionCorrecta,
}: EstadoVersionAlertProps) {
  // No mostrar alert para versiones válidas
  if (estado === 'valida') return null

  const getConfig = () => {
    switch (estado) {
      case 'erronea':
        return {
          title: '⚠️ Versión Errónea',
          description:
            'Esta versión contiene información incorrecta y no debe ser utilizada.',
          icon: XCircle,
          className:
            'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-500',
          textColor: 'text-red-900 dark:text-red-100',
        }
      case 'obsoleta':
        return {
          title: '📦 Versión Obsoleta',
          description: 'Esta versión ya no es relevante y ha sido reemplazada.',
          icon: Package,
          className:
            'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-500',
          textColor: 'text-gray-900 dark:text-gray-100',
        }
      case 'supersedida':
        return {
          title: '🔄 Versión Supersedida',
          description:
            'Esta versión ha sido reemplazada por una versión más reciente.',
          icon: AlertTriangle,
          className:
            'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-500',
          textColor: 'text-yellow-900 dark:text-yellow-100',
        }
      default:
        return null
    }
  }

  const config = getConfig()
  if (!config) return null

  const Icon = config.icon

  return (
    <div className={`rounded-lg border-2 p-4 ${config.className}`}>
      <div className='flex gap-3'>
        <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className='flex-1'>
          <h4 className={`text-sm font-semibold ${config.textColor}`}>
            {config.title}
          </h4>
          <p className={`text-xs ${config.textColor} mt-1 opacity-90`}>
            {config.description}
          </p>

          {/* Motivo */}
          {motivo && (
            <div className='mt-2 border-t border-current pt-2 opacity-20'>
              <p className={`text-xs ${config.textColor} opacity-80`}>
                <strong>Motivo:</strong> {motivo}
              </p>
            </div>
          )}

          {/* Botón ver versión correcta */}
          {versionCorrectaId && onVerVersionCorrecta && (
            <button
              onClick={onVerVersionCorrecta}
              className='mt-3 inline-flex items-center gap-1.5 rounded-lg border-2 border-current bg-white px-3 py-1.5 text-xs font-medium opacity-60 transition-opacity hover:opacity-100 dark:bg-gray-800'
            >
              <CheckCircle size={14} />
              Ver versión correcta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
