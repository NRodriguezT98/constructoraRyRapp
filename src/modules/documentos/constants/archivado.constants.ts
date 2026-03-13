/**
 * ============================================
 * CONSTANTS: Motivos de Archivado
 * ============================================
 */

export const MOTIVOS_ARCHIVADO = [
  { value: 'fuente_reemplazada', label: 'Fuente de pago reemplazada' },
  { value: 'documento_vencido', label: 'Documento vencido o desactualizado' },
  { value: 'documento_duplicado', label: 'Documento duplicado' },
  { value: 'documento_incorrecto', label: 'Documento incorrecto' },
  { value: 'cambio_proyecto', label: 'Cambio en el proyecto' },
  { value: 'otro', label: 'Otro motivo' },
] as const

export type MotivoArchivadoValue = typeof MOTIVOS_ARCHIVADO[number]['value']
