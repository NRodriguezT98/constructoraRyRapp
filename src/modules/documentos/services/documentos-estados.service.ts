// ============================================
// SERVICE: Documentos - Estados de Versión
// ============================================

import { supabase } from '@/lib/supabase/client'
import { auditService } from '@/services/audit.service'

/**
 * Servicio de gestión de estados de versión
 * Responsabilidades: marcar errónea, marcar obsoleta, restaurar estado
 */
export class DocumentosEstadosService {
  /**
   * MARCAR VERSIÓN COMO ERRÓNEA
   */
  static async marcarVersionComoErronea(
    documentoId: string,
    motivo: string,
    versionCorrectaId?: string
  ): Promise<void> {
    console.log('🚨 Marcando versión como errónea:', {
      documentoId,
      motivo,
      versionCorrectaId
    })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_proyecto')
      .select('id, titulo, version, estado_version')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      console.error('❌ Error al buscar documento:', {
        documentoId,
        error: fetchError
      })
      throw new Error(`Documento no encontrado: ${fetchError?.message || 'ID inválido'}`)
    }

    // 2. Validar que la versión correcta existe (si se proporciona)
    if (versionCorrectaId) {
      const { data: versionCorrecta, error: correctaError } = await supabase
        .from('documentos_proyecto')
        .select('id, titulo, version')
        .eq('id', versionCorrectaId)
        .single()

      if (correctaError || !versionCorrecta) {
        throw new Error('La versión correcta especificada no existe')
      }

      console.log('✓ Versión correcta validada:', {
        id: versionCorrecta.id,
        titulo: versionCorrecta.titulo,
        version: versionCorrecta.version
      })
    }

    // 3. Actualizar estado de la versión
    const { error: updateError } = await supabase
      .from('documentos_proyecto')
      .update({
        estado_version: 'erronea',
        motivo_estado: motivo,
        version_corrige_a: versionCorrectaId || null,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', documentoId)

    if (updateError) {
      console.error('❌ Error al marcar versión como errónea:', updateError)
      throw new Error(`Error al actualizar estado: ${updateError.message}`)
    }

    // 4. Si hay versión correcta, vincularla
    if (versionCorrectaId) {
      const { error: linkError } = await supabase
        .from('documentos_proyecto')
        .update({
          metadata: {
            corrige_version_erronea: documentoId,
            fecha_correccion: new Date().toISOString()
          }
        })
        .eq('id', versionCorrectaId)

      if (linkError) {
        console.warn('⚠️ No se pudo vincular versión correcta:', linkError)
      }
    }

    console.log('✅ Versión marcada como errónea')

    // 5. Registrar en auditoría
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      const { data: docCompleto } = await supabase
        .from('documentos_proyecto')
        .select('*, categorias_documento(nombre)')
        .eq('id', documentoId)
        .single()

      await auditService.registrarAccion({
        tabla: 'documentos_proyecto',
        accion: 'UPDATE',
        registroId: documentoId,
        datosAnteriores: {
          estado_version: documento.estado_version || 'valida',
          motivo_estado: null,
          version_corrige_a: null
        },
        datosNuevos: {
          estado_version: 'erronea',
          motivo_estado: motivo,
          version_corrige_a: versionCorrectaId || null
        },
        metadata: {
          tipo_operacion: 'MARCAR_VERSION_ERRONEA',
          motivo_cambio: motivo,
          documento: {
            id: documentoId,
            titulo: docCompleto?.titulo,
            version: docCompleto?.version,
            categoria: docCompleto?.categorias_documento?.nombre || 'Sin categoría',
            estado_anterior: documento.estado_version || 'valida',
            estado_nuevo: 'erronea',
            es_version_actual: docCompleto?.es_version_actual
          },
          version_correcta: versionCorrectaId
            ? {
                id: versionCorrectaId,
                vinculacion: 'Esta versión errónea es corregida por la versión indicada'
              }
            : null,
          fecha_marcado: new Date().toISOString(),
          usuario: {
            usuario_id: user?.id || 'desconocido',
            email: user?.email || 'desconocido'
          },
          contexto: {
            proyecto_id: docCompleto?.proyecto_id,
            tipo_archivo: docCompleto?.tipo_mime,
            tamano_bytes: docCompleto?.tamano_bytes
          }
        },
        modulo: 'documentos'
      })

      console.log('✅ Auditoría registrada')
    } catch (auditError) {
      console.error('❌ Error al registrar auditoría:', auditError)
    }
  }

  /**
   * MARCAR VERSIÓN COMO OBSOLETA
   */
  static async marcarVersionComoObsoleta(
    documentoId: string,
    motivo: string
  ): Promise<void> {
    console.log('📦 Marcando versión como obsoleta:', { documentoId, motivo })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_proyecto')
      .select('id, titulo, version, estado_version')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      console.error('❌ Error al buscar documento:', {
        documentoId,
        error: fetchError
      })
      throw new Error(`Documento no encontrado: ${fetchError?.message || 'ID inválido'}`)
    }

    // 2. Actualizar estado
    const { error: updateError } = await supabase
      .from('documentos_proyecto')
      .update({
        estado_version: 'obsoleta',
        motivo_estado: motivo,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', documentoId)

    if (updateError) {
      console.error('❌ Error al marcar versión como obsoleta:', updateError)
      throw new Error(`Error al actualizar estado: ${updateError.message}`)
    }

    console.log('✅ Versión marcada como obsoleta')

    // 3. Registrar en auditoría
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      const { data: docCompleto } = await supabase
        .from('documentos_proyecto')
        .select('*, categorias_documento(nombre)')
        .eq('id', documentoId)
        .single()

      await auditService.registrarAccion({
        tabla: 'documentos_proyecto',
        accion: 'UPDATE',
        registroId: documentoId,
        datosAnteriores: {
          estado_version: documento.estado_version || 'valida',
          motivo_estado: null
        },
        datosNuevos: {
          estado_version: 'obsoleta',
          motivo_estado: motivo
        },
        metadata: {
          tipo_operacion: 'MARCAR_VERSION_OBSOLETA',
          motivo_cambio: motivo,
          documento: {
            id: documentoId,
            titulo: docCompleto?.titulo,
            version: docCompleto?.version,
            categoria: docCompleto?.categorias_documento?.nombre || 'Sin categoría',
            estado_anterior: documento.estado_version || 'valida',
            estado_nuevo: 'obsoleta',
            es_version_actual: docCompleto?.es_version_actual
          },
          razon_obsolescencia: motivo,
          fecha_marcado: new Date().toISOString(),
          usuario: {
            usuario_id: user?.id || 'desconocido',
            email: user?.email || 'desconocido'
          },
          contexto: {
            proyecto_id: docCompleto?.proyecto_id,
            tipo_archivo: docCompleto?.tipo_mime
          }
        },
        modulo: 'documentos'
      })

      console.log('✅ Auditoría registrada')
    } catch (auditError) {
      console.error('⚠️ Error al registrar auditoría:', auditError)
    }
  }

  /**
   * RESTAURAR ESTADO DE VERSIÓN A "VÁLIDA"
   */
  static async restaurarEstadoVersion(documentoId: string): Promise<void> {
    console.log('♻️ Restaurando estado de versión:', { documentoId })

    // 1. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_proyecto')
      .select('id, titulo, version, estado_version, motivo_estado')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      console.error('❌ Error al buscar documento:', {
        documentoId,
        error: fetchError
      })
      throw new Error(`Documento no encontrado: ${fetchError?.message || 'ID inválido'}`)
    }

    // 2. Restaurar a estado válido
    const { error: updateError } = await supabase
      .from('documentos_proyecto')
      .update({
        estado_version: 'valida',
        motivo_estado: null,
        version_corrige_a: null,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', documentoId)

    if (updateError) {
      console.error('❌ Error al restaurar estado:', updateError)
      throw new Error(`Error al restaurar estado: ${updateError.message}`)
    }

    console.log('✅ Estado restaurado a "valida"')

    // 3. Registrar en auditoría
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      const { data: docCompleto } = await supabase
        .from('documentos_proyecto')
        .select('*, categorias_documento(nombre)')
        .eq('id', documentoId)
        .single()

      await auditService.registrarAccion({
        tabla: 'documentos_proyecto',
        accion: 'UPDATE',
        registroId: documentoId,
        datosAnteriores: {
          estado_version: documento.estado_version,
          motivo_estado: documento.motivo_estado,
          version_corrige_a: null
        },
        datosNuevos: {
          estado_version: 'valida',
          motivo_estado: null,
          version_corrige_a: null
        },
        metadata: {
          tipo_operacion: 'RESTAURAR_ESTADO_VERSION',
          documento: {
            id: documentoId,
            titulo: docCompleto?.titulo,
            version: docCompleto?.version,
            categoria: docCompleto?.categorias_documento?.nombre || 'Sin categoría',
            estado_anterior: documento.estado_version,
            estado_nuevo: 'valida',
            motivo_anterior: documento.motivo_estado,
            es_version_actual: docCompleto?.es_version_actual
          },
          restauracion: {
            desde_estado: documento.estado_version,
            motivo_original: documento.motivo_estado,
            fecha_restauracion: new Date().toISOString(),
            razon: 'Restauración manual de estado a válido'
          },
          usuario: {
            usuario_id: user?.id || 'desconocido',
            email: user?.email || 'desconocido'
          },
          contexto: {
            proyecto_id: docCompleto?.proyecto_id,
            tipo_archivo: docCompleto?.tipo_mime
          }
        },
        modulo: 'documentos'
      })

      console.log('✅ Auditoría registrada')
    } catch (auditError) {
      console.error('⚠️ Error al registrar auditoría:', auditError)
    }
  }
}
