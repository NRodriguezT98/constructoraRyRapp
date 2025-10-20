// ============================================
// TYPES: Documentos de Cliente
// ============================================

import type { Json } from '@/lib/supabase/database.types'

/**
 * Documento asociado a un cliente
 */
export interface DocumentoCliente {
  id: string
  cliente_id: string
  categoria_id: string | null

  // Información del documento
  titulo: string
  descripcion: string | null

  // Información del archivo
  nombre_archivo: string
  nombre_original: string
  tamano_bytes: number
  tipo_mime: string
  url_storage: string

  // Organización
  etiquetas: string[] | null

  // Versionado
  version: number
  es_version_actual: boolean
  documento_padre_id: string | null

  // Estado
  estado: string
  metadata: Json | null

  // Auditoría
  subido_por: string
  fecha_documento: string | null
  fecha_vencimiento: string | null
  es_importante: boolean
  es_documento_identidad: boolean // 🆔 Marca si es cédula/pasaporte (requerido para negociaciones)

  // Timestamps
  fecha_creacion: string
  fecha_actualizacion: string
}

/**
 * Parámetros para subir un documento de cliente
 */
export interface SubirDocumentoClienteParams {
  archivo: File
  cliente_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  etiquetas?: string[]
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  es_documento_identidad?: boolean // 🆔 Marcar si es documento de identidad
  metadata?: Record<string, any>
}

/**
 * Filtros para documentos de cliente
 */
export interface FiltrosDocumentosCliente {
  categoria_id?: string | null
  etiquetas?: string[]
  busqueda?: string
  solo_importantes?: boolean
  estado?: string
}

/**
 * Estadísticas de documentos
 */
export interface EstadisticasDocumentosCliente {
  total: number
  por_categoria: Record<string, number>
  importantes: number
  proximos_a_vencer: number
  sin_categoria: number
}

/**
 * Utilidades para manejo de archivos
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || ''
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️'
  if (mimeType.includes('text')) return '📃'
  return '📎'
}

/**
 * Validación de archivo
 */
export function validarArchivo(file: File): string | null {
  // Tamaño máximo: 50MB
  const MAX_SIZE = 50 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return `El archivo excede el tamaño máximo de 50 MB`
  }

  // Tipos permitidos
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-powerpoint', // .ppt
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'text/plain',
    'text/csv',
  ]

  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Tipo de archivo no permitido: ${file.type}`
  }

  return null
}
