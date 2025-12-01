// ============================================
// SERVICE: Clientes Documentos - Eliminación y Papelera
// ============================================
// Responsabilidad: Gestionar documentos eliminados (soft delete) de clientes
// - Obtener documentos eliminados (papelera)
// - Restaurar documentos
// - Eliminar definitivo (BD + Storage)
// ============================================

import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase/database.types'
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'

type DocumentoCliente = Database['public']['Tables']['documentos_cliente']['Row']

export class ClientesDocumentosEliminacionService {
  /**
   * OBTENER DOCUMENTOS ELIMINADOS (Papelera)
   * Incluye información del cliente y usuario que eliminó
   */
  static async obtenerDocumentosEliminados(): Promise<DocumentoCliente[]> {
    const { data, error } = await supabase
      .from('documentos_cliente')
      .select(`
        *,
        cliente:clientes!documentos_cliente_cliente_id_fkey(nombres, apellidos),
        usuario:usuarios!fk_documentos_cliente_subido_por(nombres, apellidos, email)
      `)
      .eq('estado', 'Eliminado')
      .eq('es_version_actual', true)
      .order('fecha_actualizacion', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener documentos eliminados de clientes:', error)
      throw error
    }

    return (data || []) as unknown as DocumentoCliente[]
  }

  /**
   * RESTAURAR DOCUMENTO ELIMINADO
   * Cambia estado de 'Eliminado' a 'Activo'
   */
  static async restaurarDocumentoEliminado(documentoId: string): Promise<void> {
    const { error } = await supabase
      .from('documentos_cliente')
      .update({
        estado: 'Activo',
        fecha_actualizacion: formatDateForDB(getTodayDateString())
      })
      .eq('id', documentoId)

    if (error) {
      console.error('❌ Error al restaurar documento de cliente:', error)
      throw error
    }
  }

  /**
   * ELIMINAR DEFINITIVO (HARD DELETE)
   * 1. Elimina archivo físico de Storage
   * 2. Elimina registro de base de datos
   * ⚠️ ACCIÓN IRREVERSIBLE
   */
  static async eliminarDefinitivo(documentoId: string): Promise<void> {
    // 1. Obtener información del documento
    const { data: documento, error: getError } = await supabase
      .from('documentos_cliente')
      .select('url_storage, nombre_archivo')
      .eq('id', documentoId)
      .single()

    if (getError) {
      console.error('❌ Error al obtener documento de cliente:', getError)
      throw getError
    }

    if (!documento) {
      throw new Error('Documento no encontrado')
    }

    // 2. Eliminar archivo de Supabase Storage
    if (documento.url_storage) {
      const { error: storageError } = await supabase.storage
        .from('documentos-clientes')
        .remove([documento.url_storage])

      if (storageError) {
        console.warn('⚠️ Error al eliminar archivo de storage (puede no existir):', storageError)
        // No lanzar error, continuar con eliminación de BD
      }
    }

    // 3. Eliminar registro de base de datos
    const { error: deleteError } = await supabase
      .from('documentos_cliente')
      .delete()
      .eq('id', documentoId)

    if (deleteError) {
      console.error('❌ Error al eliminar documento de BD:', deleteError)
      throw deleteError
    }
  }

  /**
   * OBTENER VERSIONES ELIMINADAS de un documento
   * Útil para restaurar versiones específicas
   */
  static async obtenerVersionesEliminadas(documentoId: string): Promise<DocumentoCliente[]> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_cliente')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { data, error } = await supabase
      .from('documentos_cliente')
      .select(`
        *,
        usuario:usuarios!fk_documentos_cliente_subido_por(nombres, apellidos, email)
      `)
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .eq('estado', 'Eliminado')
      .order('version', { ascending: true })

    if (error) throw error
    return (data || []) as unknown as DocumentoCliente[]
  }

  /**
   * RESTAURAR VERSIONES SELECCIONADAS
   * Restaura múltiples versiones de un documento
   */
  static async restaurarVersionesSeleccionadas(versionIds: string[]): Promise<void> {
    if (versionIds.length === 0) {
      throw new Error('Debe seleccionar al menos una versión para restaurar')
    }

    const { error } = await supabase
      .from('documentos_cliente')
      .update({
        estado: 'Activo',
        fecha_actualizacion: formatDateForDB(getTodayDateString())
      })
      .in('id', versionIds)

    if (error) throw error
  }
}
