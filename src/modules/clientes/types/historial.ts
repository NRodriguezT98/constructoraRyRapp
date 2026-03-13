/**
 * ============================================
 * TYPES: Historial de Versiones
 * ============================================
 */

export interface SnapshotVersion {
  id: string
  version: number
  tipo_cambio: string
  razon_cambio: string
  created_at: string
  fuentes_pago_snapshot: any[]
  documentos_snapshot: any[]
  datos_anteriores?: any
  datos_nuevos?: any
  campos_modificados?: string[]
}
