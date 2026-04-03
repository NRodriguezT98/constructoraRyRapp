/**
 * ============================================
 * TYPES: Historial de Versiones
 * ============================================
 */

import type { FuentePago } from './fuentes-pago'

export type { FuentePago }

export interface SnapshotVersion {
  id: string
  version: number
  tipo_cambio: string
  razon_cambio: string
  created_at: string
  fuentes_pago_snapshot: FuentePago[]
  documentos_snapshot: Record<string, unknown>[]
  datos_anteriores?: Record<string, unknown>
  datos_nuevos?: Record<string, unknown>
  campos_modificados?: string[]
}
