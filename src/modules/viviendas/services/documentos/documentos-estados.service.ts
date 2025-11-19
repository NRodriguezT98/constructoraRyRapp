// ============================================
// SERVICE: Documentos Vivienda - Estados de Versión
// ============================================

import { supabase } from '@/lib/supabase/client'
import { auditService } from '@/services/audit.service'

/**
 * Servicio de gestión de estados de versión para documentos de viviendas
 * Responsabilidades: aprobar versión, rechazar versión, marcar estado
 */
export class DocumentosEstadosService {
  /**
   * APROBAR VERSIÓN
   */
  static async aprobarVersion(documentoId: string, motivo: string): Promise<void> {
    console.log('✅ Aprobando versión:', { documentoId, motivo })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      throw new Error(`Documento no encontrado: ${fetchError?.message || 'ID inválido'}`)
    }

    // 2. Actualizar estado
    const { error: updateError } = await supabase
      .from('documentos_vivienda')
      .update({
        estado_version: 'aprobada',
        motivo_estado: motivo,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', documentoId)

    if (updateError) {
      throw new Error(`Error al aprobar: ${updateError.message}`)
    }

    // 3. Auditoría
    try {
      const { data: { user } } = await supabase.auth.getUser()

      await auditService.registrarAccion({
        tabla: 'documentos_vivienda',
        accion: 'UPDATE',
        registroId: documentoId,
        datosNuevos: {
          titulo: documento.titulo,
          version: documento.version,
        },
        metadata: {
          version_numero: documento.version,
          motivo: motivo,
        },
        modulo: 'documentos',
      })
    } catch (err) {
      console.warn('⚠️ Error al registrar auditoría:', err)
    }

    console.log('✅ Versión aprobada correctamente')
  }

  /**
   * RECHAZAR VERSIÓN
   */
  static async rechazarVersion(documentoId: string, motivo: string): Promise<void> {
    console.log('❌ Rechazando versión:', { documentoId, motivo })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      throw new Error(`Documento no encontrado: ${fetchError?.message || 'ID inválido'}`)
    }

    // 2. Actualizar estado
    const { error: updateError } = await supabase
      .from('documentos_vivienda')
      .update({
        estado_version: 'rechazada',
        motivo_estado: motivo,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', documentoId)

    if (updateError) {
      throw new Error(`Error al rechazar: ${updateError.message}`)
    }

    // 3. Auditoría
    try {
      const { data: { user } } = await supabase.auth.getUser()

      await auditService.registrarAccion({
        tabla: 'documentos_vivienda',
        accion: 'UPDATE',
        registroId: documentoId,
        datosNuevos: {
          titulo: documento.titulo,
          version: documento.version,
        },
        metadata: {
          version_numero: documento.version,
          motivo: motivo,
        },
        modulo: 'documentos',
      })
    } catch (err) {
      console.warn('⚠️ Error al registrar auditoría:', err)
    }

    console.log('✅ Versión rechazada correctamente')
  }

  /**
   * MARCAR ESTADO DE VERSIÓN
   */
  static async marcarEstadoVersion(
    documentoId: string,
    nuevoEstado: 'valida' | 'rechazada' | 'aprobada' | 'corregida',
    motivo: string
  ): Promise<void> {
    console.log('🔄 Marcando estado de versión:', { documentoId, nuevoEstado, motivo })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      throw new Error(`Documento no encontrado: ${fetchError?.message || 'ID inválido'}`)
    }

    // 2. Actualizar estado
    const { error: updateError } = await supabase
      .from('documentos_vivienda')
      .update({
        estado_version: nuevoEstado,
        motivo_estado: motivo,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', documentoId)

    if (updateError) {
      throw new Error(`Error al actualizar estado: ${updateError.message}`)
    }

    // 3. Auditoría
    try {
      const { data: { user } } = await supabase.auth.getUser()

      await auditService.registrarAccion({
        tabla: 'documentos_vivienda',
        accion: 'UPDATE',
        registroId: documentoId,
        datosNuevos: {
          titulo: documento.titulo,
          version: documento.version,
        },
        metadata: {
          version_numero: documento.version,
          motivo_nuevo: motivo,
        },
        modulo: 'documentos',
      })
    } catch (err) {
      console.warn('⚠️ Error al registrar auditoría:', err)
    }

    console.log('✅ Estado de versión actualizado correctamente')
  }
}
