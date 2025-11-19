// ============================================
// TYPES: Documentos de Vivienda - Sistema Flexible
// ============================================

export type EstadoDocumento = 'activo' | 'archivado' | 'eliminado'
export type EstadoVersion = 'valida' | 'erronea' | 'obsoleta'

// ============================================
// Categorías Personalizadas - Sistema Flexible Multi-Módulo
// ============================================

export type ModuloDocumento = 'proyectos' | 'clientes' | 'viviendas'

export interface CategoriaDocumento {
  id: string
  user_id: string
  nombre: string
  descripcion?: string
  color: string // blue, green, red, purple, yellow, etc.
  icono: string // Nombre del ícono de Lucide
  orden: number

  // Sistema flexible multi-módulo
  es_global: boolean // true = disponible en TODOS los módulos
  modulos_permitidos: ModuloDocumento[] // ["proyectos"], ["clientes","viviendas"], etc.

  fecha_creacion: string
}

export interface CategoriaFormData {
  nombre: string
  descripcion?: string
  color: string
  icono: string

  // Nuevos campos para sistema flexible
  esGlobal?: boolean
  modulosPermitidos?: ModuloDocumento[]
}

// Categorías sugeridas por defecto (opcionales)
export const CATEGORIAS_SUGERIDAS = [
  {
    nombre: 'Licencias y Permisos',
    descripcion: 'Documentos legales y autorizaciones',
    color: 'blue',
    icono: 'FileCheck',
  },
  {
    nombre: 'Planos',
    descripcion: 'Planos técnicos y arquitectónicos',
    color: 'purple',
    icono: 'Drafting',
  },
  {
    nombre: 'Contratos',
    descripcion: 'Contratos y acuerdos',
    color: 'green',
    icono: 'FileSignature',
  },
  {
    nombre: 'Facturas',
    descripcion: 'Comprobantes y facturas',
    color: 'yellow',
    icono: 'Receipt',
  },
  {
    nombre: 'Fotografías',
    descripcion: 'Registro fotográfico de la vivienda',
    color: 'pink',
    icono: 'Camera',
  },
  {
    nombre: 'Informes',
    descripcion: 'Informes técnicos y reportes',
    color: 'indigo',
    icono: 'FileText',
  },
] as const

// Colores disponibles para categorías
export const COLORES_CATEGORIA = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'red', label: 'Rojo', class: 'bg-red-500' },
  { value: 'purple', label: 'Púrpura', class: 'bg-purple-500' },
  { value: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-500' },
  { value: 'indigo', label: 'Índigo', class: 'bg-indigo-500' },
  { value: 'orange', label: 'Naranja', class: 'bg-orange-500' },
  { value: 'teal', label: 'Verde azulado', class: 'bg-teal-500' },
  { value: 'cyan', label: 'Cian', class: 'bg-cyan-500' },
  { value: 'gray', label: 'Gris', class: 'bg-gray-500' },
] as const

// ============================================
// Documentos de Vivienda
// ============================================
export interface DocumentoVivienda {
  id: string
  vivienda_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  nombre_archivo: string
  nombre_original: string
  tamano_bytes: number | null
  tipo_mime: string
  url_storage: string
  etiquetas?: string[]
  version: number
  es_version_actual: boolean
  documento_padre_id?: string
  estado: EstadoDocumento
  metadata?: Record<string, any>
  subido_por: string
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante: boolean
  fecha_creacion: string
  fecha_actualizacion: string

  // ✅ Campos para versionado y estados
  estado_version?: 'valida' | 'erronea' | 'obsoleta'
  motivo_estado?: string | null
  version_corrige_a?: string | null

  // ✅ Relación opcional con usuario (cuando se carga con join)
  usuario?: {
    nombres: string
    apellidos: string
    email: string
  }

  // Relación opcional con categoría (cuando se carga con join)
  categoria?: CategoriaDocumento
}

export interface DocumentoFormData {
  vivienda_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  archivo: File
  etiquetas?: string[]
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  metadata?: Record<string, any>
}

// Tipos MIME permitidos
export const MIME_TYPES_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-rar-compressed',
  'text/plain',
  'application/dwg',
  'image/vnd.dwg',
] as const

// Límite de tamaño de archivo (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024

// Helper para formatear tamaño de archivo
export function formatFileSize(bytes: number | null | undefined): string {
  // 🔍 DEBUG: Log para identificar valores problemáticos
  if (bytes != null && bytes < 0) {
    console.error('❌ [formatFileSize VIVIENDAS] Valor negativo detectado:', bytes)
    console.trace('Stack trace del valor negativo:')
  }

  // Validar entrada
  if (bytes == null || bytes < 0 || isNaN(bytes) || !isFinite(bytes)) return '0 Bytes'
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // Validar que i esté en rango válido (prevenir índices negativos o fuera de rango)
  const sizeIndex = Math.max(0, Math.min(i, sizes.length - 1))

  // Calcular valor con seguridad
  const value = bytes / Math.pow(k, sizeIndex)
  const roundedValue = Math.round(value * 100) / 100

  return `${roundedValue} ${sizes[sizeIndex]}`
}

// Helper para obtener extensión de archivo
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

// Helper para validar tipo de archivo
export function isValidFileType(type: string): boolean {
  return MIME_TYPES_PERMITIDOS.includes(type as any)
}

// Helper para obtener ícono según tipo MIME
export function getFileIcon(mimeType: string): any {
  // Importamos desde lucide-react
  const {
    FileText,
    File,
    FileImage,
    FileVideo,
    FileArchive,
    FileSpreadsheet,
    FileCode,
  } = require('lucide-react')

  if (mimeType.includes('pdf')) return FileText
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType.startsWith('video/')) return FileVideo
  if (mimeType.includes('zip') || mimeType.includes('rar')) return FileArchive
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return FileSpreadsheet
  if (mimeType.includes('word') || mimeType.includes('document'))
    return FileText
  if (mimeType.includes('text/')) return FileCode

  return File // Default
}
