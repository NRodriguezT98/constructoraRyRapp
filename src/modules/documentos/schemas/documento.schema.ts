// ============================================
// SCHEMAS: Validaciones para Documentos
// ============================================

import { z } from 'zod'

// ============================================
// Constantes de Validación
// ============================================

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
export const MIN_FILE_SIZE = 1024 // 1 KB

export const TIPOS_MIME_PERMITIDOS = [
  // Documentos
  'application/pdf',

  // Imágenes
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',

  // Office
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-powerpoint', // .ppt

  // Comprimidos
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',

  // CAD
  'application/dwg',
  'application/dxf',
  'image/vnd.dwg',
  'image/vnd.dxf',

  // Texto
  'text/plain',
] as const

// ============================================
// Schema: Categoría de Documento
// ============================================

export const categoriaFormSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo (máx. 100 caracteres)')
    .trim()
    .refine(val => val.length > 0, 'El nombre es requerido'),

  descripcion: z
    .string()
    .max(500, 'La descripción es demasiado larga (máx. 500 caracteres)')
    .optional()
    .or(z.literal('')),

  color: z
    .string()
    .regex(/^[a-z]+$/, 'Color inválido')
    .default('blue'),

  icono: z.string().min(1, 'Debe seleccionar un ícono').default('Folder'),
})

export type CategoriaFormData = z.infer<typeof categoriaFormSchema>

// ============================================
// Schema: Documento
// ============================================

export const documentoFormSchema = z.object({
  // Campo obligatorio
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo (máx. 200 caracteres)')
    .trim()
    .refine(val => val.length > 0, 'El título es requerido'),

  // Campos opcionales
  descripcion: z
    .string()
    .max(1000, 'La descripción es demasiado larga (máx. 1000 caracteres)')
    .optional()
    .or(z.literal('')),

  categoria_id: z
    .string()
    .uuid('ID de categoría inválido')
    .optional()
    .or(z.literal(''))
    .or(z.null()),

  etiquetas: z
    .array(
      z
        .string()
        .min(2, 'Cada etiqueta debe tener al menos 2 caracteres')
        .max(30, 'Cada etiqueta es demasiado larga (máx. 30 caracteres)')
        .regex(
          /^[a-zA-Z0-9\-_áéíóúñÁÉÍÓÚÑ\s]+$/,
          'Etiqueta con caracteres inválidos'
        )
        .trim()
    )
    .max(10, 'Máximo 10 etiquetas')
    .optional()
    .default([]),

  fecha_documento: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(val => {
      if (!val) return true
      const fecha = new Date(val)
      return !isNaN(fecha.getTime())
    }, 'Fecha inválida'),

  fecha_vencimiento: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(val => {
      if (!val) return true
      const fecha = new Date(val)
      return !isNaN(fecha.getTime()) && fecha > new Date()
    }, 'La fecha de vencimiento debe ser futura'),

  es_importante: z.boolean().default(false),

  metadata: z.record(z.string(), z.any()).optional().default({}),
})

export type DocumentoFormData = z.infer<typeof documentoFormSchema>

// Schema para validación de archivo (separado porque File no se serializa bien)
export const archivoSchema = z.object({
  archivo: z
    .instanceof(File, { message: 'Debe seleccionar un archivo' })
    .refine(
      file => file.size >= MIN_FILE_SIZE,
      `El archivo es demasiado pequeño (mín. ${MIN_FILE_SIZE / 1024} KB)`
    )
    .refine(
      file => file.size <= MAX_FILE_SIZE,
      `El archivo supera el límite de ${MAX_FILE_SIZE / (1024 * 1024)} MB`
    )
    .refine(
      file => TIPOS_MIME_PERMITIDOS.includes(file.type as any),
      'Tipo de archivo no permitido'
    ),
})

// Schema completo combinado (para frontend)
export const documentoConArchivoSchema =
  documentoFormSchema.merge(archivoSchema)

export type DocumentoConArchivoFormData = z.infer<
  typeof documentoConArchivoSchema
>

// ============================================
// Helpers de Validación
// ============================================

export function validarNombreArchivo(nombre: string): {
  valido: boolean
  error?: string
} {
  // Caracteres prohibidos
  const caracteresProhibidos = /[<>:"|?*\x00-\x1f]/g
  if (caracteresProhibidos.test(nombre)) {
    return {
      valido: false,
      error: 'El nombre del archivo contiene caracteres no permitidos',
    }
  }

  // Longitud máxima
  if (nombre.length > 255) {
    return {
      valido: false,
      error: 'El nombre del archivo es demasiado largo (máx. 255 caracteres)',
    }
  }

  // Nombres reservados en Windows
  const nombresReservados = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'LPT1',
    'LPT2',
  ]
  const nombreBase = nombre.split('.')[0].toUpperCase()
  if (nombresReservados.includes(nombreBase)) {
    return {
      valido: false,
      error: 'El nombre del archivo está reservado por el sistema',
    }
  }

  return { valido: true }
}

export function validarExtensionArchivo(
  nombre: string,
  tipoMime: string
): { valido: boolean; error?: string } {
  const extension = nombre.toLowerCase().split('.').pop()

  if (!extension) {
    return {
      valido: false,
      error: 'El archivo no tiene extensión',
    }
  }

  // Mapeo de extensiones esperadas por tipo MIME
  const extensionesValidas: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      'docx',
    ],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
      'xlsx',
    ],
    'application/vnd.ms-excel': ['xls'],
    'application/zip': ['zip'],
    'application/dwg': ['dwg'],
    'application/dxf': ['dxf'],
  }

  const extensionesEsperadas = extensionesValidas[tipoMime]

  if (extensionesEsperadas && !extensionesEsperadas.includes(extension)) {
    return {
      valido: false,
      error: `La extensión .${extension} no coincide con el tipo de archivo ${tipoMime}`,
    }
  }

  // Validar extensión doble (posible bypass de seguridad)
  const partes = nombre.split('.')
  if (partes.length > 2) {
    const extensionesPeligrosas = [
      'exe',
      'bat',
      'cmd',
      'sh',
      'ps1',
      'vbs',
      'js',
      'msi',
    ]
    const penultimaExt = partes[partes.length - 2].toLowerCase()
    if (extensionesPeligrosas.includes(penultimaExt)) {
      return {
        valido: false,
        error: 'Archivo potencialmente peligroso detectado (extensión doble)',
      }
    }
  }

  return { valido: true }
}

export function obtenerTipoArchivoLegible(tipoMime: string): string {
  const tipos: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/jpeg': 'Imagen JPEG',
    'image/png': 'Imagen PNG',
    'image/webp': 'Imagen WebP',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'Word (DOCX)',
    'application/msword': 'Word (DOC)',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      'Excel (XLSX)',
    'application/vnd.ms-excel': 'Excel (XLS)',
    'application/zip': 'ZIP',
    'application/dwg': 'AutoCAD (DWG)',
    'text/plain': 'Texto',
  }

  return tipos[tipoMime] || 'Documento'
}
