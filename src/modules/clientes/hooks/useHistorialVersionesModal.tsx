/**
 * ============================================
 * HOOK: Lógica de Historial de Versiones Modal
 * ============================================
 * Separación de responsabilidades:
 * - Manejo de estado de expansión de versiones
 * - Formato de datos para presentación
 * - Helpers para íconos y labels
 */

import { useState, useMemo } from 'react'
import type { SnapshotVersion } from '../types/historial'
import {
  Plus,
  Trash2,
  RefreshCw,
  FileText,
} from 'lucide-react'

interface UseHistorialVersionesModalProps {
  versiones: SnapshotVersion[]
}

export function useHistorialVersionesModal({
  versiones,
}: UseHistorialVersionesModalProps) {
  // Estado de expansión de versiones
  const [versionesExpandidas, setVersionesExpandidas] = useState<Set<string>>(
    new Set()
  )

  // Manejar toggle de expansión
  const toggleVersion = (versionId: string) => {
    setVersionesExpandidas((prev) => {
      const next = new Set(prev)
      if (next.has(versionId)) {
        next.delete(versionId)
      } else {
        next.add(versionId)
      }
      return next
    })
  }

  // Verificar si una versión está expandida
  const isExpanded = (versionId: string) => versionesExpandidas.has(versionId)

  // Versiones ordenadas por versión descendente
  const versionesOrdenadas = useMemo(
    () => [...versiones].sort((a, b) => b.version - a.version),
    [versiones]
  )

  return {
    versionesOrdenadas,
    toggleVersion,
    isExpanded,
  }
}

// ============================================
// Helpers de Formato
// ============================================

export function getTipoCambioIcon(tipo: string) {
  const icons: Record<string, React.ReactElement> = {
    fuente_agregada: <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />,
    fuente_inactivada: <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />,
    fuente_modificada: <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    fuente_eliminada: <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />,
    fuentes_pago_actualizadas: <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
  }
  return icons[tipo] || <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
}

export function getTipoCambioLabel(tipo: string): string {
  const labels: Record<string, string> = {
    fuente_agregada: '✅ Nueva fuente agregada',
    fuente_inactivada: '🔄 Fuente inactivada',
    fuente_modificada: '✏️ Fuente modificada',
    fuente_eliminada: '🗑️ Fuente eliminada',
    creacion_inicial: '📝 Creación inicial',
    modificacion_negociacion: '🔄 Negociación modificada',
    fuentes_pago_actualizadas: '💰 Fuentes de pago actualizadas',
  }
  return labels[tipo] || tipo
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
