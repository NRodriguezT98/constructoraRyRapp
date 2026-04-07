// ============================================
// SERVICE: Documentos - Gestión de Versiones (GENÉRICO)
// ============================================

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { auditService } from '@/services/audit.service'

import type {
  DocumentoProyecto,
  DocumentoRegistroComun,
} from '../types/documento.types'
import {
  type DocumentoInsertData,
  obtenerConfiguracionEntidad,
  type TipoEntidad,
} from '../types/entidad.types'
import { sanitizeForStorage } from '../utils/sanitize-storage'

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
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    // 1. Obtener documento original
    const { data: docOriginalResult, error: fetchError } = await supabase
      .from(config.tabla)
      .select('*')
      .eq('id', documentoIdOriginal)
      .single()
    const docOriginal = docOriginalResult as unknown as DocumentoRegistroComun

    if (fetchError) throw fetchError

    // Extraer título del nombre del archivo (sin extensión)
    const tituloDelArchivo = archivo.name.replace(/\.[^/.]+$/, '')
    const tituloFinal = tituloOverride || tituloDelArchivo

    // 2. Encontrar el documento padre (la versión 1)
    const documentoPadreId =
      docOriginal.documento_padre_id || documentoIdOriginal

    // 3. Obtener la versión más alta actual
    const { data: versiones } = await supabase
      .from(config.tabla)
      .select('version')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .order('version', { ascending: false })
      .limit(1)

    const nuevaVersion = (versiones?.[0]?.version || 0) + 1

    // 4. Marcar versiones anteriores como NO actuales
    await supabase
      .from(config.tabla)
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
    const entidadId = (docOriginal as Record<string, unknown>)[
      config.campoEntidad
    ] as string
    const storagePath = `${entidadId}/${categoriaNombre}/${nombreArchivo}`

    const { error: uploadError } = await supabase.storage
      .from(config.bucket)
      .upload(storagePath, archivo)

    if (uploadError) {
      // ↩️ Restaurar es_version_actual del documento original antes de lanzar error
      await supabase
        .from(config.tabla)
        .update({ es_version_actual: true })
        .eq('id', documentoIdOriginal)
      throw uploadError
    }

    // 7. Crear nuevo registro de documento
    const insertData: Record<string, unknown> = {
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
        ...(typeof docOriginal.metadata === 'object' &&
        docOriginal.metadata !== null
          ? docOriginal.metadata
          : {}),
        cambios,
        version_anterior_id: documentoIdOriginal,
      },
      subido_por: userId,
      fecha_documento: fechaDocumento || docOriginal.fecha_documento,
      fecha_vencimiento: fechaVencimiento || docOriginal.fecha_vencimiento,
      es_importante: docOriginal.es_importante,
      // ✅ FIX: Propagar campos críticos del documento original a la nueva versión
      ...(docOriginal.es_documento_identidad !== undefined && {
        es_documento_identidad: docOriginal.es_documento_identidad,
      }),
      ...(docOriginal.es_escritura_vivienda !== undefined && {
        es_escritura_vivienda: docOriginal.es_escritura_vivienda,
      }),
      ...(docOriginal.es_contrato_promesa !== undefined && {
        es_contrato_promesa: docOriginal.es_contrato_promesa,
      }),
      // ✅ FIX: Propagar campos de vinculación a requisitos de desembolso
      // Sin esto, la nueva versión no satisface el requisito y el pendiente reaparece
      ...(docOriginal.fuente_pago_relacionada && {
        fuente_pago_relacionada: docOriginal.fuente_pago_relacionada,
      }),
      ...(docOriginal.tipo_documento && {
        tipo_documento: docOriginal.tipo_documento,
      }),
    }

    const { data: nuevaVersionDoc, error: insertError } = await supabase
      .from(config.tabla)
      .insert(insertData as unknown as DocumentoInsertData)
      .select(
        `
        *,
        usuario:usuarios!${config.fkSubidoPor} (
          nombres,
          apellidos,
          email
        )
      `
      )
      .single()

    if (insertError) {
      // Limpiar archivo si falla la BD
      await supabase.storage.from(config.bucket).remove([storagePath])
      // ↩️ Restaurar es_version_actual del documento original
      await supabase
        .from(config.tabla)
        .update({ es_version_actual: true })
        .eq('id', documentoIdOriginal)
      throw insertError
    }

    // Auditar nueva versión en historial del cliente
    if (tipoEntidad === 'cliente') {
      try {
        const doc = nuevaVersionDoc as unknown as Record<string, unknown>
        await auditService.registrarAccion({
          tabla: 'documentos_cliente',
          accion: 'UPDATE',
          registroId: documentoPadreId,
          metadata: {
            cliente_id: doc.cliente_id as string,
            titulo: doc.titulo as string,
            tipo_operacion: 'NUEVA_VERSION_DOCUMENTO',
            version_nueva: nuevaVersion,
            version_anterior_id: documentoIdOriginal,
            nombre_archivo_anterior: docOriginal.nombre_original,
            url_storage_anterior: docOriginal.url_storage,
            nombre_archivo_nuevo: archivo.name,
            url_storage_nuevo: storagePath,
            tamano_bytes: archivo.size,
            tipo_mime: archivo.type,
            cambios: cambios || null,
          },
          modulo: 'clientes',
        })
      } catch (e) {
        logger.warn('Auditoría de nueva versión falló:', e)
      }
    }

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
    const { data: docResult } = await supabase
      .from(config.tabla)
      .select('documento_padre_id')
      .eq('id', documentoId)
      .single()
    const doc = docResult as unknown as DocumentoRegistroComun

    const padreId = doc?.documento_padre_id || documentoId

    // Obtener todas las versiones (padre + hijas) SOLO ACTIVAS
    const { data, error } = await supabase
      .from(config.tabla)
      .select(
        `
        *,
        usuario:usuarios!${config.fkSubidoPor} (
          nombres,
          apellidos,
          email
        )
      `
      )
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
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    // 1. Obtener la versión a restaurar
    const { data: versionAnteriorResult, error: fetchError } = await supabase
      .from(config.tabla)
      .select('*')
      .eq('id', versionId)
      .single()
    const versionAnterior =
      versionAnteriorResult as unknown as DocumentoRegistroComun

    if (fetchError) throw fetchError

    // 2. Descargar el archivo de esa versión
    const { data: archivoBlob, error: downloadError } = await supabase.storage
      .from(config.bucket)
      .download(versionAnterior.url_storage)

    if (downloadError) {
      logger.error('❌ Error al descargar archivo:', downloadError)
      throw new Error('No se pudo descargar el archivo de la versión anterior')
    }

    // 3. Convertir blob a File
    const archivo = new File([archivoBlob], versionAnterior.nombre_original, {
      type: versionAnterior.tipo_mime,
    })

    // 4. Crear nueva versión con el contenido restaurado
    const documentoPadreId = versionAnterior.documento_padre_id || versionId
    const tituloRestaurado = versionAnterior.nombre_original.replace(
      /\.[^/.]+$/,
      ''
    )

    const resultado = await this.crearNuevaVersion(
      documentoPadreId,
      archivo,
      userId,
      tipoEntidad,
      `[RESTAURACIÓN] ${motivo} - Restaurado desde versión ${versionAnterior.version}`,
      tituloRestaurado,
      versionAnterior.fecha_documento ?? undefined,
      versionAnterior.fecha_vencimiento ?? undefined
    )

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
    // Validar rol de Administrador
    if (userRole !== 'Administrador') {
      throw new Error('❌ Solo Administradores pueden eliminar versiones')
    }

    // Validar motivo
    if (!motivo || motivo.trim().length < 20) {
      throw new Error(
        '❌ Debe proporcionar un motivo detallado (mínimo 20 caracteres)'
      )
    }

    const config = obtenerConfiguracionEntidad(tipoEntidad)

    // Obtener la versión a eliminar
    const { data: versionResult, error: fetchError } = await supabase
      .from(config.tabla)
      .select('*')
      .eq('id', versionId)
      .single()
    const version = versionResult as unknown as DocumentoRegistroComun

    if (fetchError) throw fetchError
    if (!version) throw new Error('Versión no encontrada')

    // Verificar si es la versión actual
    if (version.es_version_actual) {
      // Contar versiones activas
      const padreId = version.documento_padre_id || versionId
      const { data: versionesActivas, error: countError } = await supabase
        .from(config.tabla)
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
      const { data: versionAnteriorInnerResult } = await supabase
        .from(config.tabla)
        .select('id')
        .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
        .eq('estado', 'activo')
        .neq('id', versionId)
        .order('version', { ascending: false })
        .limit(1)
        .single()
      const versionAnterior = versionAnteriorInnerResult as unknown as {
        id: string
      } | null

      if (versionAnterior) {
        await supabase
          .from(config.tabla)
          .update({ es_version_actual: true })
          .eq('id', versionAnterior.id)
      }
    }

    // Marcar como eliminado (soft delete)
    const { error: updateError } = await supabase
      .from(config.tabla)
      .update({
        estado: 'eliminado',
        metadata: {
          ...(typeof version.metadata === 'object' && version.metadata !== null
            ? version.metadata
            : {}),
          eliminado_por: userId,
          motivo_eliminacion: motivo,
          fecha_eliminacion: new Date().toISOString(),
        },
      })
      .eq('id', versionId)

    if (updateError) throw updateError
  }

  /**
   * ✅ GENÉRICO: CONTAR VERSIONES ACTIVAS de un documento
   */
  static async contarVersionesActivas(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<{
    total: number
    actual: number
    versiones: { id: string; version: number; titulo?: string }[]
  }> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    const { data: docVersionResult } = await supabase
      .from(config.tabla)
      .select('documento_padre_id, version')
      .eq('id', documentoId)
      .single()
    const doc = docVersionResult as unknown as DocumentoRegistroComun

    const padreId = doc?.documento_padre_id || documentoId

    const { data: versiones, error } = await supabase
      .from(config.tabla)
      .select('id, version, titulo')
      .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
      .eq('estado', 'activo')

    if (error) throw error

    return {
      total: versiones?.length || 0,
      actual: doc?.version || 1,
      versiones: (versiones || []) as unknown as {
        id: string
        version: number
        titulo?: string
      }[],
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

    const { data: docResult } = await supabase
      .from(config.tabla)
      .select('documento_padre_id')
      .eq('id', documentoId)
      .single()
    const doc = docResult as unknown as DocumentoRegistroComun

    const padreId = doc?.documento_padre_id || documentoId

    const { data, error } = await supabase
      .from(config.tabla)
      .select(
        `
        *,
        usuario:usuarios!${config.fkSubidoPor} (
          nombres,
          apellidos,
          email
        )
      `
      )
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
      .from(config.tabla)
      .update({ estado: 'activo' })
      .in('id', versionIds)

    if (error) throw error
  }
}
