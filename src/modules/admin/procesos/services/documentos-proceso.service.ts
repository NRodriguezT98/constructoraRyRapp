/**
 * 📄 SERVICIO DE DOCUMENTOS DE PROCESO
 *
 * ✅ SISTEMA UNIFICADO con documentos de clientes.
 *
 * Maneja la subida y eliminación de documentos adjuntos a pasos del proceso.
 * Usa el mismo bucket ('documentos-clientes') y tabla ('documentos_cliente')
 * que el sistema principal de documentos de clientes.
 *
 * Path de storage: {user_id}/{cliente_id}/{nombreArchivo}
 *
 * Incluye validación de archivos y almacenamiento en Supabase Storage.
 */

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ===================================
// TIPOS
// ===================================

interface SubirDocumentoParams {
  file: File
  userId: string
  negociacionId: string
  pasoId: string
  pasoNombre?: string  // Nombre del paso para mostrar en la descripción
  documentoId: string
  documentoNombre: string
  categoriaId?: string | null  // ✅ NUEVO: ID de la categoría a asignar automáticamente
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
  bucketName: 'documentos-clientes'  // ✅ UNIFICADO: Usar el mismo bucket que documentos de clientes
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

/**
 * Construye el path de storage usando la misma estructura que documentos de clientes
 * Path: {user_id}/{cliente_id}/{nombreArchivo}
 */
function construirStoragePath(
  userId: string,
  clienteId: string,
  documentoNombre: string,
  extension: string
): string {
  const timestamp = Date.now()
  const nombreLimpio = documentoNombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')

  // ✅ UNIFICADO: Misma estructura que documentos de clientes
  const nombreArchivo = `${nombreLimpio}_${timestamp}${extension}`
  return `${userId}/${clienteId}/${nombreArchivo}`
}

function obtenerExtension(fileName: string): string {
  return '.' + fileName.split('.').pop()?.toLowerCase()
}

// ===================================
// SUBIR DOCUMENTO
// ===================================

export async function subirDocumento(params: SubirDocumentoParams): Promise<ResultadoSubida> {
  const { file, userId, negociacionId, pasoId, pasoNombre, documentoId, documentoNombre, categoriaId } = params

  // 🔍 DEBUG: Verificar que categoriaId llega correctamente
  console.log('📋 Subiendo documento con categoriaId:', categoriaId)

  try {
    // 1. Validar archivo
    const validacion = validarArchivo(file)
    if (!validacion.valido) {
      return { exito: false, error: validacion.error }
    }

    // 2. Obtener cliente_id de la negociación (necesario para el path unificado)
    const { data: negociacion, error: negError } = await supabase
      .from('negociaciones')
      .select('cliente_id')
      .eq('id', negociacionId)
      .single()

    if (negError || !negociacion?.cliente_id) {
      console.error('❌ Error al obtener cliente_id:', negError)
      return { exito: false, error: 'No se pudo obtener el cliente asociado' }
    }

    // 3. Construir path usando estructura unificada: {user_id}/{cliente_id}/{nombreArchivo}
    const extension = obtenerExtension(file.name)
    const storagePath = construirStoragePath(userId, negociacion.cliente_id, documentoNombre, extension)

    // 4. Subir a Storage (bucket unificado)
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

    // 5. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(CONFIG.bucketName)
      .getPublicUrl(storagePath)

    // 6. Guardar en documentos_cliente (tabla unificada)
    const nombreLimpio = documentoNombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')

    // Generar descripción legible con el nombre del paso
    const descripcion = pasoNombre
      ? `Subido desde proceso - Paso: ${pasoNombre}`
      : `Subido desde proceso - Paso ${pasoId}`

    const { error: dbError } = await supabase
      .from('documentos_cliente')
      .insert({
        cliente_id: negociacion.cliente_id,
        categoria_id: categoriaId || null,  // ✅ Asignar categoría automáticamente
        titulo: documentoNombre,
        descripcion,
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

    if (dbError) {
      console.error('❌ Error al guardar en documentos_cliente:', dbError)
      // Intentar eliminar archivo del storage si falla la DB
      await supabase.storage.from(CONFIG.bucketName).remove([storagePath])
      return { exito: false, error: 'Error al registrar el documento en la base de datos' }
    }

    return { exito: true, url: publicUrl }

  } catch (error: any) {
    console.error('❌ Error al subir documento:', error)
    return { exito: false, error: error.message || 'Error desconocido' }
  }
}

// ===================================
// ELIMINAR DOCUMENTO (Storage + DB)
// ===================================

/**
 * Elimina un documento del Storage de Supabase y de la tabla documentos_cliente.
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

    // 1. Eliminar registro de documentos_cliente
    const { error: dbError } = await supabase
      .from('documentos_cliente')
      .delete()
      .eq('url_storage', url)

    if (dbError) {
      console.error('❌ Error al eliminar de documentos_cliente:', dbError)
      // Continuar con Storage aunque falle DB
    } else {
      console.log('✅ Registro eliminado de documentos_cliente')
    }

    // 2. Eliminar del storage
    const { error: storageError } = await supabase.storage
      .from(CONFIG.bucketName)
      .remove([storagePath])

    if (storageError) {
      console.error('❌ Error al eliminar del storage:', storageError)
      return false
    }

    console.log('✅ Archivo eliminado del Storage')
    return true

  } catch (error: any) {
    console.error('❌ Error al procesar eliminación:', error)
    return false
  }
}
