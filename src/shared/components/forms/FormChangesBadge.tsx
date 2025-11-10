/**
 * FormChangesBadge - Componente para mostrar cambios detectados en formularios
 *
 * Muestra:
 * - Badge informativo cuando NO hay cambios
 * - Badge naranja con lista de cambios cuando SÍ hay cambios
 * - Lista expandible/colapsable de cambios
 */

'use client'

import { cn } from '@/shared/utils/helpers'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Edit3, Info } from 'lucide-react'
import { useState } from 'react'

// ============================================================================
// TIPOS
// ============================================================================

interface FieldChange {
  field: string
  label: string
  oldValue: any
  newValue: any
}

interface FormChangesBadgeProps {
  hasChanges: boolean
  changes: FieldChange[]
  changesCount: number
  className?: string
  showDetails?: boolean // Mostrar detalles por defecto
  variant?: 'full' | 'compact' // ← Nueva prop para diseño compacto
}

// ============================================================================
// HELPER: Formatear valores para display
// ============================================================================

function formatValue(value: any): string {
  if (value === null || value === undefined) return '(vacío)'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'object') {
    if (Array.isArray(value)) return `${value.length} elemento(s)`
    return 'Objeto'
  }
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...'
  }
  return String(value)
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function FormChangesBadge({
  hasChanges,
  changes,
  changesCount,
  className,
  showDetails = true,
  variant = 'full', // ← Por defecto full
}: FormChangesBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails)

  // ============================================================================
  // SIN CAMBIOS - VERSIÓN COMPACTA
  // ============================================================================

  if (!hasChanges && variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
          'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-300 dark:border-blue-700',
          'text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide shadow-md',
          className
        )}
      >
        <Info className="w-3.5 h-3.5" />
        Sin cambios
      </motion.div>
    )
  }

  // ============================================================================
  // SIN CAMBIOS - VERSIÓN FULL
  // ============================================================================

  if (!hasChanges) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-lg',
          'bg-blue-50 dark:bg-blue-950/20',
          'border border-blue-200 dark:border-blue-800',
          className
        )}
      >
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          Sin cambios por guardar
        </p>
      </motion.div>
    )
  }

  // ============================================================================
  // CON CAMBIOS - VERSIÓN COMPACTA (solo badge, sin expandible)
  // ============================================================================

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
          'bg-orange-500/20 border border-orange-500/30',
          'text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide',
          className
        )}
      >
        <Edit3 className="w-3 h-3" />
        {changesCount} cambio{changesCount !== 1 ? 's' : ''}
      </motion.div>
    )
  }

  // ============================================================================
  // CON CAMBIOS - VERSIÓN FULL (con lista expandible)
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-orange-50 dark:bg-orange-950/20',
        'border border-orange-200 dark:border-orange-800',
        className
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-3',
          'hover:bg-orange-100 dark:hover:bg-orange-900/20',
          'transition-colors duration-200'
        )}
      >
        <div className="flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
            {changesCount} cambio{changesCount !== 1 ? 's' : ''} detectado
            {changesCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Toggle icon */}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        )}
      </button>

      {/* Lista de cambios (expandible) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-orange-200 dark:border-orange-800"
          >
            <ul className="px-4 py-3 space-y-2">
              {changes.map((change) => (
                <li
                  key={change.field}
                  className="text-xs text-orange-700 dark:text-orange-300"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 dark:text-orange-400 mt-0.5">
                      •
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{change.label}</p>
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <span className="line-through opacity-60">
                          {formatValue(change.oldValue)}
                        </span>
                        <span>→</span>
                        <span className="font-medium">
                          {formatValue(change.newValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// VARIANTE COMPACTA (solo icono + contador)
// ============================================================================

export function FormChangesBadgeCompact({
  hasChanges,
  changesCount,
  className,
}: Pick<FormChangesBadgeProps, 'hasChanges' | 'changesCount' | 'className'>) {
  if (!hasChanges) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
          'bg-blue-100 dark:bg-blue-900/30',
          'text-xs font-medium text-blue-700 dark:text-blue-300',
          className
        )}
      >
        <Info className="w-3.5 h-3.5" />
        Sin cambios
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
        'bg-orange-100 dark:bg-orange-900/30',
        'text-xs font-medium text-orange-700 dark:text-orange-300',
        'animate-pulse',
        className
      )}
    >
      <Edit3 className="w-3.5 h-3.5" />
      {changesCount} cambio{changesCount !== 1 ? 's' : ''}
    </span>
  )
}

// ============================================================================
// INDICADOR POR CAMPO (marcar campos individuales)
// ============================================================================

interface FieldChangedIndicatorProps {
  isChanged: boolean
  className?: string
}

export function FieldChangedIndicator({
  isChanged,
  className,
}: FieldChangedIndicatorProps) {
  if (!isChanged) return null

  return (
    <div
      className={cn(
        'absolute -top-1 -right-1 z-10',
        'w-2.5 h-2.5 rounded-full',
        'bg-orange-500 dark:bg-orange-400',
        'border-2 border-white dark:border-gray-900',
        'animate-pulse',
        className
      )}
      title="Campo modificado"
    />
  )
}
