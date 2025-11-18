/**
 * @file estado-version-badge.tsx
 * @description Badge visual para mostrar estado de versión de documentos
 * @module viviendas/components/documentos
 */

import { AlertCircle, Archive, ArrowRight, CheckCircle } from 'lucide-react'
import type { DocumentoVivienda } from '../../services/documentos-vivienda.service'

interface EstadoVersionBadgeProps {
  documento: DocumentoVivienda
  showMotivo?: boolean
  className?: string
}

/**
 * Badge visual que muestra el estado de una versión
 * Estados: valida, erronea, obsoleta, supersedida
 */
export function EstadoVersionBadge({
  documento,
  showMotivo = false,
  className = '',
}: EstadoVersionBadgeProps) {
  const estadoVersion = documento.estado_version || 'valida'

  // Configuración visual por estado
  const configs = {
    valida: {
      icon: CheckCircle,
      label: 'Válida',
      bgClass: 'bg-green-50 dark:bg-green-950/30',
      borderClass: 'border-green-200 dark:border-green-800',
      textClass: 'text-green-700 dark:text-green-400',
      iconClass: 'text-green-600 dark:text-green-500',
    },
    erronea: {
      icon: AlertCircle,
      label: 'Errónea',
      bgClass: 'bg-red-50 dark:bg-red-950/30',
      borderClass: 'border-red-200 dark:border-red-800',
      textClass: 'text-red-700 dark:text-red-400',
      iconClass: 'text-red-600 dark:text-red-500',
    },
    obsoleta: {
      icon: Archive,
      label: 'Obsoleta',
      bgClass: 'bg-gray-50 dark:bg-gray-800/50',
      borderClass: 'border-gray-200 dark:border-gray-700',
      textClass: 'text-gray-700 dark:text-gray-400',
      iconClass: 'text-gray-600 dark:text-gray-500',
    },
    supersedida: {
      icon: ArrowRight,
      label: 'Supersedida',
      bgClass: 'bg-blue-50 dark:bg-blue-950/30',
      borderClass: 'border-blue-200 dark:border-blue-800',
      textClass: 'text-blue-700 dark:text-blue-400',
      iconClass: 'text-blue-600 dark:text-blue-500',
    },
  }

  const config = configs[estadoVersion as keyof typeof configs] || configs.valida
  const Icon = config.icon

  // Si es válida y no hay motivo, no mostrar badge
  if (estadoVersion === 'valida' && !showMotivo) {
    return null
  }

  return (
    <div className={className}>
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgClass} ${config.borderClass}`}
      >
        <Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />
        <span className={`text-xs font-medium ${config.textClass}`}>{config.label}</span>
      </div>

      {/* Motivo del estado (si existe y se solicita mostrar) */}
      {showMotivo && documento.motivo_estado && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-1">
          {documento.motivo_estado}
        </p>
      )}

      {/* Link a versión correcta (si es errónea y existe) */}
      {estadoVersion === 'erronea' && documento.version_corrige_a && (
        <div className="mt-2 ml-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Versión correcta: <code className="text-xs">{documento.version_corrige_a}</code>
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Alerta expandida para versiones con problemas
 * Muestra información completa del estado
 */
export function EstadoVersionAlert({ documento }: { documento: DocumentoVivienda }) {
  const estadoVersion = documento.estado_version || 'valida'

  // No mostrar alerta si es válida
  if (estadoVersion === 'valida') {
    return null
  }

  const configs = {
    erronea: {
      icon: AlertCircle,
      title: 'Versión Errónea',
      description: 'Esta versión contiene errores y no debe ser utilizada.',
      bgClass: 'bg-red-50 dark:bg-red-950/30',
      borderClass: 'border-red-200 dark:border-red-800',
      titleClass: 'text-red-700 dark:text-red-400',
      textClass: 'text-red-600 dark:text-red-500',
      iconClass: 'text-red-600',
    },
    obsoleta: {
      icon: Archive,
      title: 'Versión Obsoleta',
      description: 'Esta versión ya no es aplicable o está desactualizada.',
      bgClass: 'bg-gray-50 dark:bg-gray-800/50',
      borderClass: 'border-gray-200 dark:border-gray-700',
      titleClass: 'text-gray-700 dark:text-gray-300',
      textClass: 'text-gray-600 dark:text-gray-400',
      iconClass: 'text-gray-600',
    },
    supersedida: {
      icon: ArrowRight,
      title: 'Versión Supersedida',
      description: 'Existe una versión más reciente que reemplaza a esta.',
      bgClass: 'bg-blue-50 dark:bg-blue-950/30',
      borderClass: 'border-blue-200 dark:border-blue-800',
      titleClass: 'text-blue-700 dark:text-blue-400',
      textClass: 'text-blue-600 dark:text-blue-500',
      iconClass: 'text-blue-600',
    },
  }

  const config = configs[estadoVersion as keyof typeof configs]
  if (!config) return null

  const Icon = config.icon

  return (
    <div
      className={`p-4 rounded-xl border ${config.bgClass} ${config.borderClass} space-y-2`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconClass} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 space-y-1">
          <p className={`text-sm font-semibold ${config.titleClass}`}>{config.title}</p>
          <p className={`text-xs ${config.textClass}`}>{config.description}</p>

          {/* Motivo */}
          {documento.motivo_estado && (
            <div className="mt-2 pt-2 border-t border-current/10">
              <p className={`text-xs font-medium ${config.titleClass}`}>Motivo:</p>
              <p className={`text-xs ${config.textClass} mt-1`}>{documento.motivo_estado}</p>
            </div>
          )}

          {/* Link a versión correcta */}
          {estadoVersion === 'erronea' && documento.version_corrige_a && (
            <div className="mt-2 pt-2 border-t border-current/10">
              <p className={`text-xs font-medium ${config.titleClass}`}>
                Versión correcta disponible:
              </p>
              <code className={`text-xs ${config.textClass} font-mono mt-1 block`}>
                {documento.version_corrige_a}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
