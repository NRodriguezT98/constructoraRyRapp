/**
 * SERVICE: Documentos — Mutaciones (escrituras)
 * Todos los métodos de escritura de documentos, separados de las queries.
 */
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { auditService } from '@/services/audit.service'
import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'
import {
  obtenerConfiguracionEntidad,
  type DocumentoInsertData,
  type TipoEntidad,
} from '@/shared/documentos/types/entidad.types'

import { sanitizeForStorage } from '../utils/sanitize-storage'

type TablaDocumentos =
  | 'documentos_proyecto'
  | 'documentos_vivienda'
  | 'documentos_cliente'

function getTablaDocumentos(tipoEntidad: TipoEntidad): TablaDocumentos {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  return config.tabla as TablaDocumentos
}

/**
 * Normaliza un valor para comparación en diff.
 * Extrae solo la parte de fecha (YYYY-MM-DD) de valores ISO datetime
 * para evitar falsos positivos cuando la BD devuelve "2025-01-15T12:00:00"
 * y el input envía "2025-01-15".
 */
function normalizeForComparison(val: unknown): string | null {
  if (val == null) return null
  const s = String(val).trim()
  // ISO datetime completo → extraer solo fecha
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10)
  return s || null
}

export interface SubirDocumentoParams {
  entidad_id: string
  tipoEntidad: TipoEntidad
  categoria_id?: string
  titulo: string
  descripcion?: string
  archivo: File
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  es_documento_identidad?: boolean
  tipo_documento?: string
  metadata?: Record<string, unknown>
}

/** @deprecated Usar SubirDocumentoParams con tipoEntidad='proyecto' */
export interface SubirDocumentoProyectoParams {
  proyecto_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  archivo: File
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  metadata?: Record<string, unknown>
}

export class DocumentosMutacionesService {
  /** Subir un nuevo documento a una entidad. */
  static async subirDocumento(
    params: SubirDocumentoParams,
    userId: string
  ): Promise<DocumentoProyecto> {
    const {
      archivo,
      entidad_id,
      tipoEntidad,
      categoria_id,
      titulo,
      descripcion,
      fecha_documento,
      fecha_vencimiento,
      es_importante,
      es_documento_identidad,
      metadata,
    } = params

    const config = obtenerConfiguracionEntidad(tipoEntidad)

    // 1. Obtener nombre de categoría para organizar archivos
    let categoriaNombre = 'general'
    if (categoria_id) {
      const { data: categoria } = await supabase
        .from('categorias_documento')
        .select('nombre')
        .eq('id', categoria_id)
        .single()

      if (categoria?.nombre) {
        categoriaNombre = sanitizeForStorage(categoria.nombre)
      }
    }

    // 2. Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`

    // 3. Construir path en storage
    const storagePath = `${entidad_id}/${categoriaNombre}/${nombreArchivo}`

    // 4. Subir archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(config.bucket)
      .upload(storagePath, archivo, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    // 5. Crear registro en la base de datos
    const insertData: Record<string, unknown> = {
      [config.campoEntidad]: entidad_id,
      categoria_id: categoria_id || null,
      titulo,
      descripcion: descripcion || null,
      nombre_archivo: nombreArchivo,
      nombre_original: archivo.name,
      tamano_bytes: archivo.size,
      tipo_mime: archivo.type,
      url_storage: storagePath,
      subido_por: userId,
      fecha_documento: fecha_documento || null,
      fecha_vencimiento: fecha_vencimiento || null,
      es_importante: es_importante || false,
      ...(tipoEntidad === 'cliente'
        ? { es_documento_identidad: es_documento_identidad || false }
        : {}),
      ...(tipoEntidad === 'cliente' &&
      (params.tipo_documento || metadata?.tipo_documento_sistema)
        ? {
            tipo_documento:
              params.tipo_documento || String(metadata?.tipo_documento_sistema),
          }
        : {}),
      ...(tipoEntidad === 'cliente' && metadata?.fuente_pago_id
        ? { fuente_pago_relacionada: String(metadata.fuente_pago_id) }
        : {}),
      ...(tipoEntidad === 'cliente' && metadata?.requisito_config_id
        ? { requisito_config_id: String(metadata.requisito_config_id) }
        : {}),
      metadata: metadata || {},
      version: 1,
      es_version_actual: true,
      estado: 'activo',
    }

    const tabla = getTablaDocumentos(tipoEntidad)

    const { data: documento, error: dbError } = await supabase
      .from(tabla)
      .insert(insertData as unknown as DocumentoInsertData)
      .select('*')
      .single()

    if (dbError) {
      await supabase.storage.from(config.bucket).remove([storagePath])
      throw dbError
    }

    // 6. Auditar subida de documento de cliente en historial
    if (tipoEntidad === 'cliente') {
      try {
        await auditService.registrarAccion({
          tabla: 'documentos_cliente',
          accion: 'CREATE',
          registroId: documento.id,
          datosNuevos: documento,
          metadata: {
            cliente_id: entidad_id,
            titulo: documento.titulo,
            categoria_id: documento.categoria_id,
            nombre_archivo: documento.nombre_archivo,
            url_storage: documento.url_storage,
            tipo_mime: documento.tipo_mime,
            tamano_bytes: documento.tamano_bytes,
            es_documento_identidad:
              (documento as Record<string, unknown>).es_documento_identidad ??
              false,
            ...(metadata ?? {}),
          },
          modulo: 'clientes',
        })
      } catch (err) {
        logger.warn('Auditoría de subida de documento falló:', err)
      }
    }

    return documento as DocumentoProyecto
  }

  /** @deprecated Usar subirDocumento con tipoEntidad='proyecto' */
  static subirDocumentoProyecto(
    params: SubirDocumentoProyectoParams,
    userId: string
  ): Promise<DocumentoProyecto> {
    return DocumentosMutacionesService.subirDocumento(
      { entidad_id: params.proyecto_id, tipoEntidad: 'proyecto', ...params },
      userId
    )
  }

  /** Actualizar campos básicos de un documento (NO el archivo). */
  static async actualizarDocumento(
    documentoId: string,
    updates: {
      titulo?: string
      descripcion?: string
      fecha_documento?: string
      fecha_vencimiento?: string
      categoria_id?: string
      es_importante?: boolean
      anclado_at?: string | null
    },
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const tabla = getTablaDocumentos(tipoEntidad)

    // Capturar estado anterior para auditoría
    const { data: docAntes } =
      tipoEntidad === 'cliente'
        ? await supabase
            .from(tabla as 'documentos_cliente')
            .select(
              'id, titulo, cliente_id, descripcion, fecha_documento, fecha_vencimiento, categoria_id'
            )
            .eq('id', documentoId)
            .single()
        : { data: null }

    const { error } = await supabase
      .from(tabla)
      .update(updates)
      .eq('id', documentoId)
    if (error) throw error

    // Auditar edición de documento de cliente
    if (tipoEntidad === 'cliente' && docAntes) {
      try {
        const docAntesMap = docAntes as unknown as Record<string, unknown>

        // Calcular solo los campos que realmente cambiaron
        type DiffEntry = { anterior: unknown; nuevo: unknown }
        const cambios: Record<string, DiffEntry> = {}
        for (const [campo, nuevoValor] of Object.entries(updates)) {
          const anteriorValor = docAntesMap[campo]
          if (
            normalizeForComparison(anteriorValor) !==
            normalizeForComparison(nuevoValor)
          ) {
            cambios[campo] = { anterior: anteriorValor, nuevo: nuevoValor }
          }
        }

        // Resolver categoria_id a nombre legible para el diff
        if (cambios.categoria_id) {
          const oldId = cambios.categoria_id.anterior as string | null
          const newId = cambios.categoria_id.nuevo as string | null
          const idsAResolver = [oldId, newId].filter(Boolean) as string[]
          if (idsAResolver.length > 0) {
            const { data: cats } = await supabase
              .from('categorias_documento')
              .select('id, nombre')
              .in('id', idsAResolver)
            if (cats) {
              const mapaNombres = Object.fromEntries(
                cats.map(c => [c.id, c.nombre])
              )
              cambios.categoria_id = {
                anterior: oldId ? (mapaNombres[oldId] ?? oldId) : null,
                nuevo: newId ? (mapaNombres[newId] ?? newId) : null,
              }
            }
          }
        }

        // Si nada cambió realmente, no auditar
        if (Object.keys(cambios).length === 0) return

        await auditService.registrarAccion({
          tabla: 'documentos_cliente',
          accion: 'UPDATE',
          registroId: documentoId,
          datosAnteriores: docAntesMap,
          datosNuevos: updates as unknown as Record<string, unknown>,
          metadata: {
            cliente_id: docAntesMap.cliente_id,
            titulo: docAntesMap.titulo,
            tipo_operacion: 'edicion_documento',
            campos_actualizados: Object.keys(cambios),
            cambios,
          },
          modulo: 'clientes',
        })
      } catch (err) {
        logger.warn('Auditoría de edición de documento falló:', err)
      }
    }
  }

  /** Toggle del flag es_importante. */
  static async toggleImportante(
    documentoId: string,
    esImportante: boolean,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const tabla = getTablaDocumentos(tipoEntidad)

    const { data: docInfo } =
      tipoEntidad === 'cliente'
        ? await supabase
            .from('documentos_cliente' as const)
            .select('cliente_id, titulo')
            .eq('id', documentoId)
            .single()
        : { data: null }

    const { error } = await supabase
      .from(tabla)
      .update({ es_importante: esImportante })
      .eq('id', documentoId)
    if (error) throw error

    if (docInfo) {
      const info = docInfo as unknown as { cliente_id: string; titulo: string }
      await DocumentosMutacionesService.auditarOperacion(
        documentoId,
        tipoEntidad,
        info,
        'edicion_documento',
        { es_importante: { anterior: !esImportante, nuevo: esImportante } }
      )
    }
  }

  /** Soft-delete de un documento. */
  static async eliminarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const tabla = getTablaDocumentos(tipoEntidad)

    const { data: docInfo } =
      tipoEntidad === 'cliente'
        ? await supabase
            .from('documentos_cliente' as const)
            .select('cliente_id, titulo, estado')
            .eq('id', documentoId)
            .single()
        : { data: null }

    const { error } = await supabase
      .from(tabla)
      .update({ estado: 'Eliminado' })
      .eq('id', documentoId)
    if (error) throw error

    if (docInfo) {
      const info = docInfo as unknown as {
        cliente_id: string
        titulo: string
        estado: string
      }
      await DocumentosMutacionesService.auditarOperacion(
        documentoId,
        tipoEntidad,
        info,
        'ELIMINAR_DOCUMENTO_SOFTDELETE',
        { estado: { anterior: info.estado, nuevo: 'Eliminado' } }
      )
    }
  }

  /** Audita un cambio de estado o flag en un documento de cliente. */
  private static async auditarOperacion(
    documentoId: string,
    tipoEntidad: TipoEntidad,
    docInfo: { cliente_id: string; titulo: string },
    tipoOperacion: string,
    cambios: Record<string, { anterior: unknown; nuevo: unknown }>
  ): Promise<void> {
    if (tipoEntidad !== 'cliente') return
    try {
      await auditService.registrarAccion({
        tabla: 'documentos_cliente',
        accion: 'UPDATE',
        registroId: documentoId,
        metadata: {
          cliente_id: docInfo.cliente_id,
          titulo: docInfo.titulo,
          tipo_operacion: tipoOperacion,
          campos_actualizados: Object.keys(cambios),
          cambios,
        },
        modulo: 'clientes',
      })
    } catch (e) {
      logger.warn('Auditoría de operación de documento falló:', e)
    }
  }
}
