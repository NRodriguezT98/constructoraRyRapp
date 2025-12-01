// ============================================
// SERVICE: Documentos Vivienda - Eliminación y Papelera
// ============================================

import { supabase } from '@/lib/supabase/client'
import type { DocumentoVivienda } from '../../types/documento-vivienda.types'

const BUCKET_NAME = 'documentos-viviendas'

/**
 * Servicio de eliminación de documentos (soft/hard delete)
 * Responsabilidades: archivar, eliminar (soft), restaurar, eliminar definitivo (hard)
 */
export class DocumentosEliminacionService {
  /**
   * ARCHIVAR DOCUMENTO COMPLETO (todas las versiones)
   */
  static async archivarDocumento(documentoId: string): Promise<void> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_vivienda')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { error } = await supabase
      .from('documentos_vivienda')
      .update({ estado: 'archivado' })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    if (error) throw error
  }

  /**
   * RESTAURAR DOCUMENTO ARCHIVADO (todas las versiones)
   */
  static async restaurarDocumentoArchivado(documentoId: string): Promise<void> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_vivienda')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { error } = await supabase
      .from('documentos_vivienda')
      .update({ estado: 'activo' })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    if (error) throw error
  }

  /**
   * OBTENER DOCUMENTOS ARCHIVADOS
   */
  static async obtenerDocumentosArchivados(
    viviendaId: string
  ): Promise<DocumentoVivienda[]> {
    const { data, error } = await supabase
      .from('documentos_vivienda')
      .select(`
        *,
        usuario:usuarios!fk_documentos_vivienda_subido_por (
          nombres,
          apellidos,
          email
        )
      `)
      .eq('vivienda_id', viviendaId)
      .eq('estado', 'archivado')
      .eq('es_version_actual', true)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoVivienda[]
  }

  /**
   * ELIMINAR DOCUMENTO (soft delete)
   * Elimina el documento y TODAS sus versiones
   */
  static async eliminarDocumento(documentoId: string): Promise<void> {
    console.log('🗑️ Eliminando documento (soft delete):', documentoId)

    const { data: documento, error: getError } = await supabase
      .from('documentos_vivienda')
      .select('id, documento_padre_id, version, es_version_actual')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { data: versiones, error: versionesError } = await supabase
      .from('documentos_vivienda')
      .select('id, version, es_version_actual')
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .eq('estado', 'activo')
      .order('version', { ascending: false })

    if (versionesError) throw versionesError

    console.log(`📊 Eliminando ${versiones?.length || 0} versiones activas`)

    if (versiones && versiones.length > 0) {
      const versionMasAlta = versiones[0]
      const idsAEliminar = versiones.map((v) => v.id)

      const { error: updateError } = await supabase
        .from('documentos_vivienda')
        .update({ estado: 'eliminado' })
        .in('id', idsAEliminar)

      if (updateError) throw updateError

      // Asegurar que la versión más alta tenga es_version_actual=true
      const { error: flagError } = await supabase
        .from('documentos_vivienda')
        .update({ es_version_actual: true })
        .eq('id', versionMasAlta.id)

      if (flagError) throw flagError

      console.log(`✅ ${versiones.length} versiones eliminadas`)
    }
  }

  /**
   * OBTENER DOCUMENTOS ELIMINADOS (Papelera)
   * Con datos enriquecidos de vivienda y usuario
   * BEST PRACTICE: Manejo robusto de errores + nombres de columnas correctos
   */
  static async obtenerDocumentosEliminados(): Promise<DocumentoVivienda[]> {
    try {
      // 1. Obtener documentos eliminados
      const { data: documentos, error: errorDocs } = await supabase
        .from('documentos_vivienda')
        .select('*')
        .eq('estado', 'eliminado')
        .eq('es_version_actual', true)
        .order('fecha_actualizacion', { ascending: false })

      if (errorDocs) {
        console.error('❌ Error obteniendo documentos eliminados:', errorDocs)
        throw errorDocs
      }

      if (!documentos || documentos.length === 0) {
        return []
      }

      // 2. Obtener IDs únicos de viviendas y usuarios
      const viviendaIds = [...new Set(documentos.map(d => d.vivienda_id).filter(Boolean))]
      const usuarioIds = [...new Set(documentos.map(d => d.subido_por).filter(Boolean))]

      // 3. Fetch viviendas (SOLO columnas que existen: id, numero, manzana_id)
      const { data: viviendas, error: errorViviendas } = await supabase
        .from('viviendas')
        .select('id, numero, manzana_id')
        .in('id', viviendaIds)

      if (errorViviendas) {
        console.warn('⚠️ Error obteniendo viviendas:', errorViviendas)
        // Continuar sin datos de viviendas
      }

      // 4. Fetch manzanas en paralelo
      const manzanaIds = [...new Set(viviendas?.map(v => v.manzana_id).filter(Boolean) || [])]
      let manzanas: any[] = []

      if (manzanaIds.length > 0) {
        const { data: dataManzanas, error: errorManzanas } = await supabase
          .from('manzanas')
          .select('id, nombre')
          .in('id', manzanaIds)

        if (errorManzanas) {
          console.warn('⚠️ Error obteniendo manzanas:', errorManzanas)
        } else {
          manzanas = dataManzanas || []
        }
      }

      // 5. Fetch usuarios en paralelo
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombres, apellidos, email')
        .in('id', usuarioIds)

      if (errorUsuarios) {
        console.warn('⚠️ Error obteniendo usuarios:', errorUsuarios)
      }

      // 6. Crear mapas para lookup rápido
      const manzanaMap = new Map(manzanas.map(m => [m.id, m]))
      const usuarioMap = new Map(usuarios?.map(u => [u.id, u]) || [])

      // 7. Enriquecer viviendas con datos de manzana
      const viviendasEnriquecidas = viviendas?.map(v => ({
        ...v,
        numero_vivienda: v.numero, // Normalizar nombre para compatibilidad
        manzana: v.manzana_id ? manzanaMap.get(v.manzana_id) : undefined,
      })) || []

      const viviendaMap = new Map(viviendasEnriquecidas.map(v => [v.id, v]))

      // 8. Enriquecer documentos con datos relacionados
      const documentosEnriquecidos = documentos.map(doc => ({
        ...doc,
        vivienda: doc.vivienda_id ? viviendaMap.get(doc.vivienda_id) : undefined,
        usuario: doc.subido_por ? usuarioMap.get(doc.subido_por) : undefined,
      }))

      return documentosEnriquecidos as unknown as DocumentoVivienda[]
    } catch (error) {
      console.error('❌ Error crítico en obtenerDocumentosEliminados:', error)
      // Retornar array vacío en lugar de throw para evitar crashes
      return []
    }
  }

  /**
   * OBTENER DOCUMENTOS ELIMINADOS (Papelera) - FALLBACK LEGACY
   * @deprecated Usar obtenerDocumentosEliminados() que incluye datos enriquecidos
   */
  static async obtenerDocumentosEliminadosSimple(): Promise<DocumentoVivienda[]> {
    // Fallback: Sin JOINs (solo documentos básicos)
    console.warn('⚠️ JOINs fallaron, usando query simple:', errorJoins?.message)
    const { data, error } = await supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('estado', 'eliminado')
      .eq('es_version_actual', true)
      .order('fecha_actualizacion', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener documentos eliminados de viviendas:', error)
      throw error
    }

    return (data || []) as unknown as DocumentoVivienda[]
  }

  /**
   * OBTENER VERSIONES ELIMINADAS de un documento
   */
  static async obtenerVersionesEliminadas(
    documentoId: string
  ): Promise<DocumentoVivienda[]> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_vivienda')
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { data, error } = await supabase
      .from('documentos_vivienda')
      .select(`
        *,
        usuario:usuarios!fk_documentos_vivienda_subido_por (
          nombres,
          apellidos,
          email
        )
      `)
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
      .eq('estado', 'eliminado')
      .order('version', { ascending: true })

    if (error) throw error
    return (data || []) as unknown as DocumentoVivienda[]
  }

  /**
   * RESTAURAR VERSIONES SELECCIONADAS
   */
  static async restaurarVersionesSeleccionadas(versionIds: string[]): Promise<void> {
    if (versionIds.length === 0) {
      throw new Error('Debe seleccionar al menos una versión para restaurar')
    }

    const { error } = await supabase
      .from('documentos_vivienda')
      .update({ estado: 'activo' })
      .in('id', versionIds)

    if (error) throw error
  }

  /**
   * RESTAURAR DOCUMENTO ELIMINADO (con todas sus versiones)
   */
  static async restaurarDocumentoEliminado(documentoId: string): Promise<void> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_vivienda')
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    let documentosARestaurar: string[] = []

    if (documento.documento_padre_id) {
      // Es una versión → Restaurar toda la cadena
      const { data: padre } = await supabase
        .from('documentos_vivienda')
        .select('id')
        .eq('id', documento.documento_padre_id)
        .single()

      if (padre) {
        const { data: versiones } = await supabase
          .from('documentos_vivienda')
          .select('id')
          .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
          .eq('estado', 'eliminado')

        if (versiones) {
          documentosARestaurar = versiones.map((v) => v.id)
        }
      }
    } else {
      // Es documento independiente o versión 1
      const { data: versiones } = await supabase
        .from('documentos_vivienda')
        .select('id')
        .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        documentosARestaurar = versiones.map((v) => v.id)
      }
    }

    if (documentosARestaurar.length > 0) {
      const { error: updateError } = await supabase
        .from('documentos_vivienda')
        .update({ estado: 'activo' })
        .in('id', documentosARestaurar)

      if (updateError) throw updateError
    } else {
      // Fallback
      const { error } = await supabase
        .from('documentos_vivienda')
        .update({ estado: 'activo' })
        .eq('id', documentoId)

      if (error) throw error
    }
  }

  /**
   * ELIMINAR DEFINITIVAMENTE (hard delete - NO reversible)
   */
  static async eliminarDefinitivo(documentoId: string): Promise<void> {
    const { data: documento, error: getError } = await supabase
      .from('documentos_vivienda')
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    let documentosAEliminar: string[] = []

    if (documento.documento_padre_id) {
      const { data: padre } = await supabase
        .from('documentos_vivienda')
        .select('id')
        .eq('id', documento.documento_padre_id)
        .single()

      if (padre) {
        const { data: versiones } = await supabase
          .from('documentos_vivienda')
          .select('id, url_storage')
          .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
          .eq('estado', 'eliminado')

        if (versiones) {
          // Eliminar archivos de Storage
          for (const version of versiones) {
            try {
              await supabase.storage.from(BUCKET_NAME).remove([version.url_storage])
            } catch (err) {
              console.warn('⚠️ Error al eliminar archivo de Storage:', err)
            }
          }

          documentosAEliminar = versiones.map((v) => v.id)
        }
      }
    } else {
      const { data: versiones } = await supabase
        .from('documentos_vivienda')
        .select('id, url_storage')
        .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        // Eliminar archivos de Storage
        for (const version of versiones) {
          try {
            await supabase.storage.from(BUCKET_NAME).remove([version.url_storage])
          } catch (err) {
            console.warn('⚠️ Error al eliminar archivo de Storage:', err)
          }
        }

        documentosAEliminar = versiones.map((v) => v.id)
      }
    }

    // Eliminar registros de BD (DELETE físico)
    if (documentosAEliminar.length > 0) {
      const { error: deleteError } = await supabase
        .from('documentos_vivienda')
        .delete()
        .in('id', documentosAEliminar)

      if (deleteError) throw deleteError
    }
  }
}
