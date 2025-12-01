// ============================================
// SERVICE: Documentos - Gestión de Versiones (GENÉRICO)
// ============================================

import { supabase } from '@/lib/supabase/client'
import type { DocumentoProyecto } from '../types/documento.types'
import { type TipoEntidad, obtenerConfiguracionEntidad } from '../types/entidad.types'

// ⚠️ DEPRECADO: usar obtenerConfiguracionEntidad(tipoEntidad).bucket
const BUCKET_NAME = 'documentos-proyectos'

/**
 * ✅ SANITIZACIÓN: Convierte tildes/acentos a ASCII para paths de storage
 */
function sanitizeForStorage(text: string): string {
  const accentMap: Record<string, string> = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
    'ñ': 'n', 'Ñ': 'N',
    'ü': 'u', 'Ü': 'U'
  }

  let sanitized = text
  for (const [accent, plain] of Object.entries(accentMap)) {
    sanitized = sanitized.replace(new RegExp(accent, 'g'), plain)
  }

  return sanitized
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
}

/**
 * Servicio de gestión de versiones de documentos
 * Responsabilidades: crear versión, obtener versiones, restaurar versión, eliminar versión
 */
export class DocumentosVersionesService {
  /**
   * ✅ GENÉRICO: CREAR NUEVA VERSIÓN de un documento existente
   */
  static async crearNuevaVersion(
    documentoIdOriginal: string,
    archivo: File,
    userId: string,
    tipoEntidad: TipoEntidad, // ✅ NUEVO parámetro
    cambios?: string,
    tituloOverride?: string,
    fechaDocumento?: string,
    fechaVencimiento?: string
  ): Promise<DocumentoProyecto> {
    console.log('📤 Creando nueva versión del documento:', documentoIdOriginal)

    const config = obtenerConfiguracionEntidad(tipoEntidad)

    // 1. Obtener documento original
    const { data: docOriginal, error: fetchError } = await supabase
      .from(config.tabla as any)
      .select('*')
      .eq('id', documentoIdOriginal)
      .single()

    if (fetchError) throw fetchError

    // Extraer título del nombre del archivo (sin extensión)
    const tituloDelArchivo = archivo.name.replace(/\.[^/.]+$/, '')
    const tituloFinal = tituloOverride || tituloDelArchivo

    console.log('📝 Título de nueva versión:', tituloFinal)

    // 2. Encontrar el documento padre (la versión 1)
    const documentoPadreId = docOriginal.documento_padre_id || documentoIdOriginal

    // 3. Obtener la versión más alta actual
    const { data: versiones } = await supabase
      .from(config.tabla as any)
      .select('version')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .order('version', { ascending: false })
      .limit(1)

    const nuevaVersion = (versiones?.[0]?.version || 0) + 1

    // 4. Marcar versiones anteriores como NO actuales
    await supabase
      .from(config.tabla as any)
      .update({ es_version_actual: false })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    // 5. Obtener nombre de categoría para organizar archivos
    let categoriaNombre = 'general'
    if (docOriginal.categoria_id) {
      const { data: categoria } = await supabase
        .from('categorias_documento')
        .select('nombre')
        .eq('id', docOriginal.categoria_id)
        .single()

      if (categoria?.nombre) {
        categoriaNombre = sanitizeForStorage(categoria.nombre)
      }
    }

    // 6. Subir nuevo archivo a Storage
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`
    const entidadId = (docOriginal as any)[config.campoEntidad]
    const storagePath = `${entidadId}/${categoriaNombre}/${nombreArchivo}`

    const { error: uploadError } = await supabase.storage
      .from(config.bucket)
      .upload(storagePath, archivo)

    if (uploadError) throw uploadError

    // 7. Crear nuevo registro de documento
    const insertData: any = {
      [config.campoEntidad]: entidadId,
      categoria_id: docOriginal.categoria_id,
      titulo: tituloFinal,
      descripcion: cambios || docOriginal.descripcion,
      nombre_archivo: nombreArchivo,
      nombre_original: archivo.name,
      tamano_bytes: archivo.size,
      tipo_mime: archivo.type,
      url_storage: storagePath,
      version: nuevaVersion,
      es_version_actual: true,
      documento_padre_id: documentoPadreId,
      estado: 'activo', // ✅ Minúscula para consistencia con documentos_proyecto/vivienda
      metadata: {
        ...(typeof docOriginal.metadata === 'object' && docOriginal.metadata !== null
          ? docOriginal.metadata
          : {}),
        cambios,
        version_anterior_id: documentoIdOriginal
      },
      subido_por: userId,
      fecha_documento: fechaDocumento || docOriginal.fecha_documento,
      fecha_vencimiento: fechaVencimiento || docOriginal.fecha_vencimiento,
      es_importante: docOriginal.es_importante,
      // ✅ FIX: Propagar campos críticos del documento original a la nueva versión
      ...(docOriginal.es_documento_identidad !== undefined && {
        es_documento_identidad: docOriginal.es_documento_identidad
      }),
      ...(docOriginal.es_escritura_vivienda !== undefined && {
        es_escritura_vivienda: docOriginal.es_escritura_vivienda
      }),
      ...(docOriginal.es_contrato_promesa !== undefined && {
        es_contrato_promesa: docOriginal.es_contrato_promesa
      })
    }

    const { data: nuevaVersionDoc, error: insertError } = await supabase
      .from(config.tabla as any)
      .insert(insertData)
      .select(`
        *,
        usuario:usuarios (
          nombres,
          apellidos,
          email
        )
      `)
      .single()

    if (insertError) {
      // Limpiar archivo si falla la BD
      await supabase.storage.from(config.bucket).remove([storagePath])
      throw insertError
    }

    console.log(`✅ Nueva versión ${nuevaVersion} creada`)
    return nuevaVersionDoc as unknown as DocumentoProyecto
  }

  /**
   * ✅ GENÉRICO: OBTENER VERSIONES de un documento
   */
  static async obtenerVersiones(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    // Obtener documento para saber si es padre o hijo
    const { data: doc } = await supabase
      .from(config.tabla as any)
      .select('documento_padre_id')
      .eq('id', documentoId)
      .single()

    const padreId = doc?.documento_padre_id || documentoId

    // Obtener todas las versiones (padre + hijas) SOLO ACTIVAS
    const { data, error } = await supabase
      .from(config.tabla as any)
      .select(`
        *,
        usuario:usuarios (
          nombres,
          apellidos,
          email
        )
      `)
      .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
      .eq('estado', 'activo')
      .order('version', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * ✅ GENÉRICO: RESTAURAR VERSIÓN anterior
   * Descarga el archivo de la versión antigua y crea una nueva versión con ese contenido
   */
  static async restaurarVersion(
    versionId: string,
    userId: string,
    tipoEntidad: TipoEntidad,
    motivo: string
  ): Promise<DocumentoProyecto> {
    console.log('🔄 Restaurando versión:', versionId)

    const config = obtenerConfiguracionEntidad(tipoEntidad)

    // 1. Obtener la versión a restaurar
    const { data: versionAnterior, error: fetchError } = await supabase
      .from(config.tabla as any)
      .select('*')
      .eq('id', versionId)
      .single()

    if (fetchError) throw fetchError

    console.log('📄 Versión a restaurar:', {
      id: versionAnterior.id,
      version: versionAnterior.version,
      url_storage: versionAnterior.url_storage
    })

    // 2. Descargar el archivo de esa versión
    const { data: archivoBlob, error: downloadError } = await supabase.storage
      .from(config.bucket)
      .download(versionAnterior.url_storage)

    if (downloadError) {
      console.error('❌ Error al descargar archivo:', downloadError)
      throw new Error('No se pudo descargar el archivo de la versión anterior')
    }

    // 3. Convertir blob a File
    const archivo = new File([archivoBlob], versionAnterior.nombre_original, {
      type: versionAnterior.tipo_mime
    })

    // 4. Crear nueva versión con el contenido restaurado
    const documentoPadreId = versionAnterior.documento_padre_id || versionId
    const tituloRestaurado = versionAnterior.nombre_original.replace(/\.[^/.]+$/, '')

    const resultado = await this.crearNuevaVersion(
      documentoPadreId,
      archivo,
      userId,
      tipoEntidad,
      `[RESTAURACIÓN] ${motivo} - Restaurado desde versión ${versionAnterior.version}`,
      tituloRestaurado,
      versionAnterior.fecha_documento,
      versionAnterior.fecha_vencimiento
    )

    console.log(`✅ Versión ${versionAnterior.version} restaurada`)
    return resultado
  }

  /**
   * ✅ GENÉRICO: ELIMINAR VERSIÓN (soft delete, solo Admin)
   */
  static async eliminarVersion(
    versionId: string,
    userId: string,
    userRole: string,
    tipoEntidad: TipoEntidad,
    motivo: string
  ): Promise<void> {
    console.log('🗑️ [ADMIN] Eliminando versión:', versionId)

    // Validar rol de Administrador
    if (userRole !== 'Administrador') {
      throw new Error('❌ Solo Administradores pueden eliminar versiones')
    }

    // Validar motivo
    if (!motivo || motivo.trim().length < 20) {
      throw new Error('❌ Debe proporcionar un motivo detallado (mínimo 20 caracteres)')
    }

    const config = obtenerConfiguracionEntidad(tipoEntidad)

    // Obtener la versión a eliminar
    const { data: version, error: fetchError } = await supabase
      .from(config.tabla as any)
      .select('*')
      .eq('id', versionId)
      .single()

    if (fetchError) throw fetchError
    if (!version) throw new Error('Versión no encontrada')

    // Verificar si es la versión actual
    if (version.es_version_actual) {
      // Contar versiones activas
      const padreId = version.documento_padre_id || versionId
      const { data: versionesActivas, error: countError } = await supabase
        .from(config.tabla as any)
        .select('id')
        .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
        .eq('estado', 'activo')

      if (countError) throw countError

      if ((versionesActivas?.length || 0) <= 1) {
        throw new Error(
          '❌ No se puede eliminar la última versión activa. ' +
            'Usa "Eliminar Documento" en su lugar.'
        )
      }

      // Promover versión anterior a actual
      const { data: versionAnterior } = await supabase
        .from(config.tabla as any)
        .select('id')
        .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
        .eq('estado', 'activo')
        .neq('id', versionId)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (versionAnterior) {
        await supabase
          .from(config.tabla as any)
          .update({ es_version_actual: true })
          .eq('id', versionAnterior.id)
      }
    }

    // Marcar como eliminado (soft delete)
    const { error: updateError } = await supabase
      .from(config.tabla as any)
      .update({
        estado: 'eliminado',
        metadata: {
          ...(typeof version.metadata === 'object' && version.metadata !== null
            ? version.metadata
            : {}),
          eliminado_por: userId,
          motivo_eliminacion: motivo,
          fecha_eliminacion: new Date().toISOString()
        }
      })
      .eq('id', versionId)

    if (updateError) throw updateError

    console.log('✅ Versión eliminada (soft delete)')
  }

  /**
   * ✅ GENÉRICO: CONTAR VERSIONES ACTIVAS de un documento
   */
  static async contarVersionesActivas(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<{ total: number; actual: number }> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    const { data: doc } = await supabase
      .from(config.tabla as any)
      .select('documento_padre_id, version')
      .eq('id', documentoId)
      .single()

    const padreId = doc?.documento_padre_id || documentoId

    const { data: versiones, error } = await supabase
      .from(config.tabla as any)
      .select('id, version')
      .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
      .eq('estado', 'activo')

    if (error) throw error

    return {
      total: versiones?.length || 0,
      actual: doc?.version || 1
    }
  }

  /**
   * ✅ GENÉRICO: OBTENER VERSIONES ELIMINADAS de un documento
   */
  static async obtenerVersionesEliminadas(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    const { data: doc } = await supabase
      .from(config.tabla as any)
      .select('documento_padre_id')
      .eq('id', documentoId)
      .single()

    const padreId = doc?.documento_padre_id || documentoId

    const { data, error } = await supabase
      .from(config.tabla as any)
      .select(`
        *,
        usuario:usuarios (
          nombres,
          apellidos,
          email
        )
      `)
      .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
      .eq('estado', 'eliminado')
      .order('version', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * ✅ GENÉRICO: RESTAURAR VERSIONES SELECCIONADAS (múltiples)
   */
  static async restaurarVersionesSeleccionadas(
    versionIds: string[],
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    const { error } = await supabase
      .from(config.tabla as any)
      .update({ estado: 'activo' })
      .in('id', versionIds)

    if (error) throw error
  }
}
