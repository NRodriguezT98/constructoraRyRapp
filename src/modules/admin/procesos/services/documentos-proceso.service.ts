/**
 * 📄 SERVICIO DE DOCUMENTOS DE PROCESO
 *
 * Maneja la subida y eliminación de documentos adjuntos a pasos del proceso.
 * Incluye validación de archivos y almacenamiento en Supabase Storage.
 */

import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ===================================
// TIPOS
// ===================================

interface SubirDocumentoParams {
  file: File
  userId: string
  negociacionId: string
  pasoId: string
  documentoId: string
  documentoNombre: string
}

interface ResultadoSubida {
  exito: boolean
  url?: string
  error?: string
}

// ===================================
// CONFIGURACIÓN
// ===================================

const CONFIG = {
  maxTamanoMB: 10,
  extensionesPermitidas: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  bucketName: 'documentos-procesos'
} as const

// ===================================
// VALIDACIONES
// ===================================

function validarArchivo(file: File): { valido: boolean; error?: string } {
  // Validar tamaño
  const maxBytes = CONFIG.maxTamanoMB * 1024 * 1024
  if (file.size > maxBytes) {
    return {
      valido: false,
      error: `El archivo no puede superar los ${CONFIG.maxTamanoMB}MB`
    }
  }

  // Validar extensión
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!CONFIG.extensionesPermitidas.includes(extension as any)) {
    return {
      valido: false,
      error: `Tipo de archivo no permitido. Usa: ${CONFIG.extensionesPermitidas.join(', ')}`
    }
  }

  return { valido: true }
}

// ===================================
// UTILIDADES
// ===================================

function construirStoragePath(
  userId: string,
  negociacionId: string,
  pasoId: string,
  documentoNombre: string,
  extension: string
): string {
  const timestamp = Date.now()
  const nombreLimpio = documentoNombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')

  return `${userId}/procesos/${negociacionId}/${pasoId}/${nombreLimpio}_${timestamp}${extension}`
}

function obtenerExtension(fileName: string): string {
  return '.' + fileName.split('.').pop()?.toLowerCase()
}

// ===================================
// SUBIR DOCUMENTO
// ===================================

export async function subirDocumento(params: SubirDocumentoParams): Promise<ResultadoSubida> {
  const { file, userId, negociacionId, pasoId, documentoId, documentoNombre } = params

  try {
    // 1. Validar archivo
    const validacion = validarArchivo(file)
    if (!validacion.valido) {
      return { exito: false, error: validacion.error }
    }

    // 2. Construir path
    const extension = obtenerExtension(file.name)
    const storagePath = construirStoragePath(userId, negociacionId, pasoId, documentoNombre, extension)

    // 3. Subir a Storage
    const { error: uploadError } = await supabase.storage
      .from(CONFIG.bucketName)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Error en Storage:', uploadError)
      return { exito: false, error: uploadError.message }
    }

    // 4. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(CONFIG.bucketName)
      .getPublicUrl(storagePath)

    // 5. Guardar en documentos_cliente
    const { data: negociacion } = await supabase
      .from('negociaciones')
      .select('cliente_id')
      .eq('id', negociacionId)
      .single()

    if (negociacion?.cliente_id) {
      const nombreLimpio = documentoNombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')

      await supabase
        .from('documentos_cliente')
        .insert({
          cliente_id: negociacion.cliente_id,
          categoria_id: null,
          titulo: documentoNombre,
          descripcion: `Subido desde proceso - Paso ${pasoId}`,
          nombre_archivo: `${nombreLimpio}_${Date.now()}${extension}`,
          nombre_original: file.name,
          tamano_bytes: file.size,
          tipo_mime: file.type,
          url_storage: publicUrl,
          subido_por: userId,
          es_importante: false,
          es_version_actual: true,
          version: 1,
          estado: 'activo',
          etiquetas: ['Proceso', 'Negociación']
        })
    }

    return { exito: true, url: publicUrl }

  } catch (error: any) {
    console.error('❌ Error al subir documento:', error)
    return { exito: false, error: error.message || 'Error desconocido' }
  }
}

// ===================================
// ELIMINAR DOCUMENTO (Storage)
// ===================================

/**
 * Elimina un documento del Storage de Supabase.
 * Nota: La URL ya se elimina de la DB mediante el hook useProcesoNegociacion
 */
export async function eliminarDocumentoStorage(url: string): Promise<boolean> {
  try {
    // Extraer path del storage desde la URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split(`/${CONFIG.bucketName}/`)

    if (pathParts.length !== 2) {
      console.warn('⚠️ No se pudo extraer el path del storage de la URL')
      return false
    }

    const storagePath = pathParts[1]

    // Eliminar del storage
    const { error } = await supabase.storage
      .from(CONFIG.bucketName)
      .remove([storagePath])

    if (error) {
      console.error('❌ Error al eliminar del storage:', error)
      return false
    }

    return true

  } catch (error: any) {
    console.error('❌ Error al procesar eliminación:', error)
    return false
  }
}
