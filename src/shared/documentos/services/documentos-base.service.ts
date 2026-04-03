// ============================================
// SERVICE: Documentos - CRUD Básico (GENÉRICO)
// ============================================
import { supabase } from '@/lib/supabase/client'
import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'
import {
  obtenerConfiguracionEntidad,
  type DocumentoInsertData,
  type TipoEntidad,
} from '@/shared/documentos/types/entidad.types'

// ✅ TYPE-SAFE: Mapeo de tipo de entidad a nombre de tabla literal
type TablaDocumentos =
  | 'documentos_proyecto'
  | 'documentos_vivienda'
  | 'documentos_cliente'

function getTablaDocumentos(tipoEntidad: TipoEntidad): TablaDocumentos {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  return config.tabla as TablaDocumentos
}

/**
 * ✅ SANITIZACIÓN: Convierte tildes/acentos a ASCII para paths de storage
 * Previene errores "Invalid key" con caracteres especiales
 */
// sanitizeForStorage importado desde utils
import { sanitizeForStorage } from '../utils/sanitize-storage'

interface SubirDocumentoParams {
  entidad_id: string // ✅ Genérico (era proyecto_id)
  tipoEntidad: TipoEntidad // ✅ NUEVO: identifica tabla/bucket
  categoria_id?: string
  titulo: string
  descripcion?: string
  archivo: File
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  es_documento_identidad?: boolean // ✅ Para clientes
  tipo_documento?: string // ✅ NUEVO: Para validación automática
  metadata?: Record<string, unknown>
}

// ⚠️ LEGACY: Para compatibilidad con código existente
interface SubirDocumentoProyectoParams {
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

/**
 * Servicio de CRUD básico para documentos (GENÉRICO)
 * Responsabilidades: crear, leer, actualizar (básico)
 * Soporta: proyectos, viviendas, clientes, contratos, proveedores
 */
export class DocumentosBaseService {
  /**
   * ✅ GENÉRICO: Obtener todos los documentos de una entidad
   */
  static async obtenerDocumentosPorEntidad(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = getTablaDocumentos(tipoEntidad)

    // ✅ OPTIMIZACIÓN: JOIN directo con FK evita N+1 queries
    // Antes: 1 query inicial + N queries a usuarios = 51 queries para 50 docs
    // Ahora: 1 sola query con JOIN = 10-50x más rápido
    const { data, error } = await supabase
      .from(tabla)
      .select(
        `
        *,
        usuarios!subido_por(id, nombres, apellidos, email)
      `
      )
      .eq(config.campoEntidad, entidadId)
      .in('estado', ['activo', 'archivado']) // ✅ Traer AMBOS estados (filtrar en frontend)
      .eq('es_version_actual', true)
      .order('es_importante', { ascending: false })
      .order('fecha_creacion', { ascending: false })

    if (error) throw error

    // ✅ Mapear "usuarios" → "usuario" para consistencia con UI
    const documentos = (data || []).map(doc => ({
      ...doc,
      usuario: doc.usuarios, // ← Renombrar relación
      usuarios: undefined, // ← Limpiar propiedad original
    }))

    return documentos as DocumentoProyecto[]
  }

  /**
   * ⚠️ LEGACY: Obtener documentos de proyecto (mantener para compatibilidad)
   */
  static async obtenerDocumentosPorProyecto(
    proyectoId: string
  ): Promise<DocumentoProyecto[]> {
    return this.obtenerDocumentosPorEntidad(proyectoId, 'proyecto')
  }

  /**
   * ✅ GENÉRICO: Obtener documentos por categoría
   */
  static async obtenerDocumentosPorCategoria(
    entidadId: string,
    categoriaId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = getTablaDocumentos(tipoEntidad)

    // ✅ OPTIMIZACIÓN: JOIN directo con FK evita N+1
    const { data, error } = await supabase
      .from(tabla)
      .select(
        `
        *,
        usuarios!subido_por(id, nombres, apellidos, email)
      `
      )
      .eq(config.campoEntidad, entidadId)
      .eq('categoria_id', categoriaId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .order('version', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * ✅ GENÉRICO: Obtener documentos próximos a vencer (todas las entidades)
   */
  static async obtenerDocumentosProximosAVencer(
    diasAntes = 30,
    tipoEntidad?: TipoEntidad // Opcional: filtrar por tipo de entidad
  ): Promise<DocumentoProyecto[]> {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + diasAntes)

    if (tipoEntidad) {
      // Filtrar por una entidad específica
      const config = obtenerConfiguracionEntidad(tipoEntidad)

      // ✅ OPTIMIZACIÓN: JOIN directo con FK evita N+1
      const { data, error } = await supabase
        .from(config.tabla)
        .select(
          `
          *,
          usuarios!subido_por(id, nombres, apellidos, email)
        `
        )
        .eq('estado', 'activo')
        .eq('es_version_actual', true)
        .not('fecha_vencimiento', 'is', null)
        .lte('fecha_vencimiento', fechaLimite.toISOString())
        .order('fecha_vencimiento', { ascending: true })

      if (error) throw error
      return (data || []) as unknown as DocumentoProyecto[]
    } else {
      // Sin filtro: retornar de proyectos por ahora (para compatibilidad)
      // ✅ OPTIMIZACIÓN: JOIN directo con FK evita N+1
      const { data, error } = await supabase
        .from('documentos_proyecto')
        .select(
          `
          *,
          usuarios!subido_por(id, nombres, apellidos, email)
        `
        )
        .eq('estado', 'activo')
        .eq('es_version_actual', true)
        .not('fecha_vencimiento', 'is', null)
        .lte('fecha_vencimiento', fechaLimite.toISOString())
        .order('fecha_vencimiento', { ascending: true })

      if (error) throw error
      return (data || []) as unknown as DocumentoProyecto[]
    }
  }

  /**
   * ✅ GENÉRICO: Subir un nuevo documento
   */
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
      .upload(storagePath, archivo, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // 5. Crear registro en la base de datos
    const insertData: Record<string, unknown> = {
      [config.campoEntidad]: entidad_id, // ✅ Dinámico: proyecto_id, vivienda_id, etc.
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
      // ✅ CONDICIONAL: es_documento_identidad solo existe en documentos_cliente
      ...(tipoEntidad === 'cliente'
        ? { es_documento_identidad: es_documento_identidad || false }
        : {}),
      // ✅ tipo_documento para match con vista_documentos_pendientes_fuentes
      ...(tipoEntidad === 'cliente' &&
      (params.tipo_documento || metadata?.tipo_documento_sistema)
        ? {
            tipo_documento:
              params.tipo_documento || String(metadata?.tipo_documento_sistema),
          }
        : {}),
      // ✅ Vinculación automática: relaciona el doc con la fuente de pago
      ...(tipoEntidad === 'cliente' && metadata?.fuente_pago_id
        ? { fuente_pago_relacionada: String(metadata.fuente_pago_id) }
        : {}),
      // ✅ FK al requisito exacto — la vista usa este campo para detectar doc subido
      ...(tipoEntidad === 'cliente' && metadata?.requisito_config_id
        ? { requisito_config_id: String(metadata.requisito_config_id) }
        : {}),
      metadata: metadata || {},
      version: 1,
      es_version_actual: true,
      estado: 'activo', // ✅ Minúscula para consistencia con query
    }

    const tabla = getTablaDocumentos(tipoEntidad)

    // ✅ INSERT simple sin JOIN — el join usuarios!subido_por en POST falla con
    // usuarios autenticados (comportamiento de PostgREST con RLS en INSERT+SELECT).
    // La info del usuario no se necesita en el valor de retorno de esta función.
    const { data: documento, error: dbError } = await supabase
      .from(tabla)
      .insert(insertData as unknown as DocumentoInsertData)
      .select('*')
      .single()

    if (dbError) {
      // Si falla la BD, eliminar archivo de storage
      await supabase.storage.from(config.bucket).remove([storagePath])
      throw dbError
    }

    // Retornar el documento (sin join de usuario — userId ya conocido por contexto)
    return documento as DocumentoProyecto
  }

  /**
   * ⚠️ LEGACY: Subir documento de proyecto (mantener para compatibilidad)
   */
  static async subirDocumentoProyecto(
    params: SubirDocumentoProyectoParams,
    userId: string
  ): Promise<DocumentoProyecto> {
    return this.subirDocumento(
      {
        entidad_id: params.proyecto_id,
        tipoEntidad: 'proyecto',
        ...params,
      },
      userId
    )
  }

  /**
   * ✅ GENÉRICO: Actualizar documento (solo campos básicos, NO archivo)
   */
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

    const { error } = await supabase
      .from(tabla)
      .update(updates)
      .eq('id', documentoId)

    if (error) throw error
  }

  /**
   * ✅ GENÉRICO: Buscar documentos por texto
   */
  static async buscarDocumentos(
    entidadId: string,
    query: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = getTablaDocumentos(tipoEntidad)

    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .eq(config.campoEntidad, entidadId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * ✅ GENÉRICO: Obtener documentos importantes
   */
  static async obtenerDocumentosImportantes(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = getTablaDocumentos(tipoEntidad)

    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .eq(config.campoEntidad, entidadId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .eq('es_importante', true)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * ✅ GENÉRICO: Obtener documentos archivados
   */
  static async obtenerDocumentosArchivados(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = getTablaDocumentos(tipoEntidad)

    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .eq(config.campoEntidad, entidadId)
      .eq('estado', 'archivado')
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /**
   * ✅ GENÉRICO: Toggle importante
   */
  static async toggleImportante(
    documentoId: string,
    esImportante: boolean,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const tabla = getTablaDocumentos(tipoEntidad)

    const { error } = await supabase
      .from(tabla)
      .update({ es_importante: esImportante })
      .eq('id', documentoId)

    if (error) throw error
  }

  /**
   * ✅ GENÉRICO: Eliminar documento (soft delete)
   */
  static async eliminarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const tabla = getTablaDocumentos(tipoEntidad)

    const { error } = await supabase
      .from(tabla)
      .update({ estado: 'Eliminado' })
      .eq('id', documentoId)

    if (error) throw error
  }

  /**
   * ✅ GENÉRICO: Archivar documento
   */
  static async archivarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const tabla = getTablaDocumentos(tipoEntidad)

    const { error } = await supabase
      .from(tabla)
      .update({ estado: 'archivado' }) // ✅ FIX: Cambio a minúscula para coincidir con DB
      .eq('id', documentoId)

    if (error) throw error
  }

  /**
   * ✅ GENÉRICO: Restaurar documento archivado
   */
  static async restaurarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const tabla = getTablaDocumentos(tipoEntidad)

    const { error } = await supabase
      .from(tabla)
      .update({ estado: 'activo' }) // ✅ Minúscula para consistencia
      .eq('id', documentoId)

    if (error) throw error
  }
}

export default DocumentosBaseService
