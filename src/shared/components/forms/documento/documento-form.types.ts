import type { FieldValues } from 'react-hook-form'

export interface CategoriaDocumentoBase {
  id: string
  nombre: string
  descripcion?: string | null
}

export interface DocumentoFormValuesBase extends FieldValues {
  titulo: string
  descripcion?: string
  categoria_id?: string | null
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  es_documento_identidad?: boolean
  metadata?: Record<string, unknown>
}
