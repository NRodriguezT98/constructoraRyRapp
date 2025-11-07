// @ts-nocheck
/**
 * @file carpetas-vivienda.service.ts
 * @description Service para gestión de carpetas jerárquicas de documentos de viviendas
 * @module viviendas/services
 * @note TypeScript checks disabled - tabla carpetas_documentos_viviendas no en types generados
 */

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ============================================
// TIPOS
// ============================================

export interface CarpetaVivienda {
  id: string
  nombre: string
  descripcion: string | null
  vivienda_id: string
  carpeta_padre_id: string | null
  color: string
  icono: string
  orden: number
  es_carpeta_sistema: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CarpetaConSubcarpetas extends CarpetaVivienda {
  subcarpetas: CarpetaConSubcarpetas[]
  documentos_count?: number
  nivel?: number
}

export interface CrearCarpetaParams {
  nombre: string
  viviendaId: string
  carpetaPadreId?: string | null
  descripcion?: string
  color?: string
  icono?: string
  orden?: number
}

export interface ActualizarCarpetaParams {
  id: string
  nombre?: string
  descripcion?: string | null
  color?: string
  icono?: string
  orden?: number
  carpetaPadreId?: string | null
}

// ============================================
// SERVICE
// ============================================

export class CarpetasViviendaService {
  /**
   * Obtener todas las carpetas de una vivienda (planas)
   */
  async obtenerCarpetas(viviendaId: string): Promise<CarpetaVivienda[]> {
    const { data, error } = await supabase
      .from('carpetas_documentos_viviendas' as any)
      .select('*')
      .eq('vivienda_id', viviendaId)
      .order('orden', { ascending: true })

    if (error) {
      console.error('Error obteniendo carpetas:', error)
      throw error
    }

    return (data || []) as CarpetaVivienda[]
  }

  /**
   * Obtener árbol de carpetas jerárquico
   */
  async obtenerArbolCarpetas(viviendaId: string): Promise<CarpetaConSubcarpetas[]> {
    const carpetas = await this.obtenerCarpetas(viviendaId)

    // Contar documentos por carpeta
    const { data: documentosCounts } = await supabase
      .from('documentos_vivienda')
      .select('carpeta_id')
      .eq('vivienda_id', viviendaId)

    const countsMap = new Map<string, number>()
    documentosCounts?.forEach(doc => {
      if (doc.carpeta_id) {
        countsMap.set(doc.carpeta_id, (countsMap.get(doc.carpeta_id) || 0) + 1)
      }
    })

    return this.construirArbol(carpetas, null, countsMap)
  }

  /**
   * Construir árbol de carpetas recursivamente
   */
  private construirArbol(
    carpetas: CarpetaVivienda[],
    padreId: string | null,
    countsMap: Map<string, number>,
    nivel: number = 0
  ): CarpetaConSubcarpetas[] {
    return carpetas
      .filter(c => c.carpeta_padre_id === padreId)
      .map(carpeta => ({
        ...carpeta,
        subcarpetas: this.construirArbol(carpetas, carpeta.id, countsMap, nivel + 1),
        documentos_count: countsMap.get(carpeta.id) || 0,
        nivel
      }))
      .sort((a, b) => a.orden - b.orden)
  }

  /**
   * Obtener una carpeta por ID
   */
  async obtenerCarpeta(id: string): Promise<CarpetaVivienda | null> {
    const { data, error } = await supabase
      .from('carpetas_documentos_viviendas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      console.error('Error obteniendo carpeta:', error)
      throw new Error(`Error al obtener carpeta: ${error.message}`)
    }

    return data
  }

  /**
   * Crear nueva carpeta
   */
  async crearCarpeta(params: CrearCarpetaParams): Promise<CarpetaVivienda> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('carpetas_documentos_viviendas')
      .insert({
        nombre: params.nombre,
        vivienda_id: params.viviendaId,
        carpeta_padre_id: params.carpetaPadreId || null,
        descripcion: params.descripcion || null,
        color: params.color || '#3B82F6',
        icono: params.icono || 'folder',
        orden: params.orden || 0,
        es_carpeta_sistema: false,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creando carpeta:', error)
      throw new Error(`Error al crear carpeta: ${error.message}`)
    }

    return data
  }

  /**
   * Actualizar carpeta existente
   */
  async actualizarCarpeta(params: ActualizarCarpetaParams): Promise<CarpetaVivienda> {
    const updateData: Partial<CarpetaVivienda> = {}

    if (params.nombre !== undefined) updateData.nombre = params.nombre
    if (params.descripcion !== undefined) updateData.descripcion = params.descripcion
    if (params.color !== undefined) updateData.color = params.color
    if (params.icono !== undefined) updateData.icono = params.icono
    if (params.orden !== undefined) updateData.orden = params.orden
    if (params.carpetaPadreId !== undefined) updateData.carpeta_padre_id = params.carpetaPadreId

    const { data, error } = await supabase
      .from('carpetas_documentos_viviendas')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error actualizando carpeta:', error)
      throw new Error(`Error al actualizar carpeta: ${error.message}`)
    }

    return data
  }

  /**
   * Eliminar carpeta (solo si no es de sistema y no tiene documentos)
   */
  async eliminarCarpeta(id: string): Promise<void> {
    // Verificar que no sea carpeta de sistema
    const carpeta = await this.obtenerCarpeta(id)
    if (!carpeta) {
      throw new Error('Carpeta no encontrada')
    }

    if (carpeta.es_carpeta_sistema) {
      throw new Error('No se puede eliminar una carpeta del sistema')
    }

    // Verificar que no tenga documentos
    const { count } = await supabase
      .from('documentos_vivienda')
      .select('id', { count: 'exact', head: true })
      .eq('carpeta_id', id)

    if (count && count > 0) {
      throw new Error(`No se puede eliminar la carpeta porque contiene ${count} documento(s)`)
    }

    // Verificar que no tenga subcarpetas
    const { count: subcarpetasCount } = await supabase
      .from('carpetas_documentos_viviendas')
      .select('id', { count: 'exact', head: true })
      .eq('carpeta_padre_id', id)

    if (subcarpetasCount && subcarpetasCount > 0) {
      throw new Error(`No se puede eliminar la carpeta porque contiene ${subcarpetasCount} subcarpeta(s)`)
    }

    const { error } = await supabase
      .from('carpetas_documentos_viviendas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error eliminando carpeta:', error)
      throw new Error(`Error al eliminar carpeta: ${error.message}`)
    }
  }

  /**
   * Mover documento a una carpeta
   */
  async moverDocumentoACarpeta(
    documentoId: string,
    carpetaId: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from('documentos_vivienda')
      .update({ carpeta_id: carpetaId })
      .eq('id', documentoId)

    if (error) {
      console.error('Error moviendo documento:', error)
      throw new Error(`Error al mover documento: ${error.message}`)
    }
  }

  /**
   * Reordenar carpetas (cambiar orden)
   */
  async reordenarCarpetas(
    carpetas: Array<{ id: string; orden: number }>
  ): Promise<void> {
    const updates = carpetas.map(({ id, orden }) =>
      supabase
        .from('carpetas_documentos_viviendas')
        .update({ orden })
        .eq('id', id)
    )

    const results = await Promise.all(updates)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) {
      console.error('Errores reordenando carpetas:', errors)
      throw new Error('Error al reordenar carpetas')
    }
  }

  /**
   * Crear carpetas predeterminadas para una vivienda
   */
  async crearCarpetasPredeterminadas(viviendaId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    // Usar la función SQL que ya creamos
    const { error } = await supabase.rpc('crear_carpetas_predeterminadas_vivienda', {
      p_vivienda_id: viviendaId,
      p_usuario_id: user.id,
    })

    if (error) {
      console.error('Error creando carpetas predeterminadas:', error)
      throw new Error(`Error al crear carpetas predeterminadas: ${error.message}`)
    }
  }

  /**
   * Obtener ruta completa de una carpeta (breadcrumbs)
   */
  async obtenerRutaCarpeta(carpetaId: string): Promise<CarpetaVivienda[]> {
    const carpeta = await this.obtenerCarpeta(carpetaId)
    if (!carpeta) return []

    const ruta: CarpetaVivienda[] = [carpeta]
    let carpetaActual = carpeta

    // Subir recursivamente hasta la raíz
    while (carpetaActual.carpeta_padre_id) {
      const padre = await this.obtenerCarpeta(carpetaActual.carpeta_padre_id)
      if (!padre) break
      ruta.unshift(padre)
      carpetaActual = padre
    }

    return ruta
  }

  /**
   * Buscar carpetas por nombre
   */
  async buscarCarpetas(viviendaId: string, termino: string): Promise<CarpetaVivienda[]> {
    const { data, error } = await supabase
      .from('carpetas_documentos_viviendas')
      .select('*')
      .eq('vivienda_id', viviendaId)
      .ilike('nombre', `%${termino}%`)
      .order('nombre')

    if (error) {
      console.error('Error buscando carpetas:', error)
      throw new Error(`Error al buscar carpetas: ${error.message}`)
    }

    return data || []
  }
}

// ============================================
// SINGLETON
// ============================================

export const carpetasViviendaService = new CarpetasViviendaService()
