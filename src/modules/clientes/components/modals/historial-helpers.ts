/**
 * ============================================
 * HELPERS: Historial de Versiones
 * ============================================
 * Funciones puras para iconos, labels y lógica de diff
 * Separación: Solo lógica, sin UI
 */

import type { LucideIcon } from 'lucide-react'
import { DollarSign, FileText, Plus, RefreshCw, Trash2 } from 'lucide-react'

import type { FuentePago } from '../../types/fuentes-pago'

// ============================================
// Iconos por tipo de cambio
// ============================================

export function getTipoCambioIcon(tipo: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    fuentes_pago_actualizadas: DollarSign,
    fuente_agregada: Plus,
    fuente_eliminada: Trash2,
    fuente_modificada: RefreshCw,
    estado_cambiado: RefreshCw,
    creacion: Plus,
  }

  return icons[tipo] || FileText
}

// ============================================
// Color por tipo de cambio
// ============================================

export function getTipoCambioColor(tipo: string): string {
  const colors: Record<string, string> = {
    fuentes_pago_actualizadas: 'text-purple-600 dark:text-purple-400',
    fuente_agregada: 'text-green-600 dark:text-green-400',
    fuente_eliminada: 'text-red-600 dark:text-red-400',
    fuente_modificada: 'text-blue-600 dark:text-blue-400',
    estado_cambiado: 'text-orange-600 dark:text-orange-400',
    creacion: 'text-cyan-600 dark:text-cyan-400',
  }

  return colors[tipo] || 'text-gray-600 dark:text-gray-400'
}

// ============================================
// Labels legibles por tipo de cambio
// ============================================

export function getTipoCambioLabel(tipo: string): string {
  const labels: Record<string, string> = {
    fuentes_pago_actualizadas: '💰 Fuentes de pago actualizadas',
    fuente_agregada: '➕ Fuente agregada',
    fuente_eliminada: '🗑️ Fuente eliminada',
    fuente_modificada: '🔄 Fuente modificada',
    estado_cambiado: '📊 Estado modificado',
    creacion: '✨ Negociación creada',
  }

  // Fallback: convertir snake_case a Title Case
  return (
    labels[tipo] ||
    tipo.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  )
}

// ============================================
// Detectar cambios entre fuentes (Diff)
// ============================================

export interface CambioFuente {
  tipo: 'agregada' | 'eliminada' | 'modificada' | 'sin_cambios'
  fuente: FuentePago
  cambiosDetectados?: {
    monto?: { anterior: number; nuevo: number }
    entidad?: { anterior?: string; nuevo?: string }
  }
}

export function detectarCambiosFuentes(
  fuentesActuales: FuentePago[],
  fuentesAnteriores: FuentePago[]
): CambioFuente[] {
  const cambios: CambioFuente[] = []

  // Detectar fuentes eliminadas
  fuentesAnteriores.forEach(anterior => {
    const existe = fuentesActuales.find(actual => actual.tipo === anterior.tipo)
    if (!existe) {
      cambios.push({
        tipo: 'eliminada',
        fuente: anterior,
      })
    }
  })

  // Detectar fuentes agregadas o modificadas
  fuentesActuales.forEach(actual => {
    const anterior = fuentesAnteriores.find(a => a.tipo === actual.tipo)

    if (!anterior) {
      // Nueva fuente
      cambios.push({
        tipo: 'agregada',
        fuente: actual,
      })
    } else {
      // Verificar si hay cambios
      const cambiosDetectados: NonNullable<CambioFuente['cambiosDetectados']> =
        {}

      if (anterior.monto_aprobado !== actual.monto_aprobado) {
        cambiosDetectados.monto = {
          anterior: anterior.monto_aprobado,
          nuevo: actual.monto_aprobado,
        }
      }

      if (anterior.entidad !== actual.entidad) {
        cambiosDetectados.entidad = {
          anterior: anterior.entidad ?? undefined,
          nuevo: actual.entidad ?? undefined,
        }
      }

      if (Object.keys(cambiosDetectados).length > 0) {
        cambios.push({
          tipo: 'modificada',
          fuente: actual,
          cambiosDetectados,
        })
      } else {
        cambios.push({
          tipo: 'sin_cambios',
          fuente: actual,
        })
      }
    }
  })

  return cambios
}

// ============================================
// Filtrar solo cambios reales
// ============================================

export function filtrarCambiosReales(cambios: CambioFuente[]): CambioFuente[] {
  return cambios.filter(c => c.tipo !== 'sin_cambios')
}

// ============================================
// Formatear monto (helper reutilizable)
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
