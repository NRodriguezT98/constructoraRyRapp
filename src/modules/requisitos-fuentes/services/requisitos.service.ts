/**
 * ============================================
 * SERVICE: Configuración de Requisitos de Fuentes
 * ============================================
 *
 * ARQUITECTURA (Separación de Responsabilidades):
 * - Service: Lógica de API/DB pura (este archivo)
 * - Hooks: React Query + estado (hooks/useRequisitos.ts)
 * - Componentes: UI presentacional (page.tsx)
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
    ActualizarRequisitoDTO,
    CrearRequisitoDTO,
    RequisitoFuenteConfig
} from '../types'

export class RequisitosService {

  /**
   * Obtener todos los requisitos activos
   */
  async obtenerRequisitos(supabase: SupabaseClient): Promise<RequisitoFuenteConfig[]> {
    const { data, error } = await supabase
      .from('requisitos_fuentes_pago_config')
      .select('id,tipo_fuente,paso_identificador,titulo,descripcion,instrucciones,nivel_validacion,tipo_documento_sugerido,categoria_documento,alcance,fuentes_aplicables,orden,activo,version,fecha_creacion,fecha_actualizacion,usuario_creacion,usuario_actualizacion')
      .eq('activo', true)
      .order('tipo_fuente', { ascending: true })
      .order('orden', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Obtener requisitos por tipo de fuente
   */
  async obtenerRequisitosPorTipo(
    supabase: SupabaseClient,
    tipoFuente: string
  ): Promise<RequisitoFuenteConfig[]> {
    const { data, error } = await supabase
      .from('requisitos_fuentes_pago_config')
      .select('id,tipo_fuente,paso_identificador,titulo,descripcion,instrucciones,nivel_validacion,tipo_documento_sugerido,categoria_documento,alcance,fuentes_aplicables,orden,activo,version,fecha_creacion,fecha_actualizacion,usuario_creacion,usuario_actualizacion')
      .eq('tipo_fuente', tipoFuente)
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Crear nuevo requisito
   */
  async crearRequisito(
    supabase: SupabaseClient,
    datos: CrearRequisitoDTO,
    userId: string
  ): Promise<RequisitoFuenteConfig> {
    const { data, error } = await supabase
      .from('requisitos_fuentes_pago_config')
      .insert({
        tipo_fuente: datos.tipo_fuente as string,
        paso_identificador: datos.paso_identificador,
        titulo: datos.titulo,
        descripcion: datos.descripcion || null,
        instrucciones: datos.instrucciones || null,
        nivel_validacion: datos.nivel_validacion,
        tipo_documento_sugerido: datos.tipo_documento_sugerido || null,
        categoria_documento: datos.categoria_documento || null,
        alcance: datos.alcance || 'ESPECIFICO_FUENTE',
        fuentes_aplicables: datos.fuentes_aplicables ?? null,
        orden: datos.orden ?? 1,
        activo: true,
        usuario_creacion: userId,
      })
      .select('id,tipo_fuente,paso_identificador,titulo,descripcion,instrucciones,nivel_validacion,tipo_documento_sugerido,categoria_documento,alcance,fuentes_aplicables,orden,activo,version,fecha_creacion,fecha_actualizacion,usuario_creacion,usuario_actualizacion')
      .single()

    if (error) throw error
    return data
  }

  /**
   * Actualizar requisito existente
   */
  async actualizarRequisito(
    supabase: SupabaseClient,
    id: string,
    datos: ActualizarRequisitoDTO,
    userId: string
  ): Promise<RequisitoFuenteConfig> {
    const { data, error } = await supabase
      .from('requisitos_fuentes_pago_config')
      .update({
        ...(datos.titulo !== undefined && { titulo: datos.titulo }),
        // Sanitizar strings vacíos a null para evitar violaciones de FK/constraints
        ...(datos.descripcion !== undefined && { descripcion: datos.descripcion || null }),
        ...(datos.instrucciones !== undefined && { instrucciones: datos.instrucciones || null }),
        ...(datos.nivel_validacion !== undefined && { nivel_validacion: datos.nivel_validacion }),
        ...(datos.tipo_documento_sugerido !== undefined && { tipo_documento_sugerido: datos.tipo_documento_sugerido || null }),
        // categoria_documento es FK → null obligatorio cuando está vacío
        ...(datos.categoria_documento !== undefined && { categoria_documento: datos.categoria_documento || null }),
        // fuentes_aplicables: undefined = no tocar, null = todas, array = selectivas
        ...(datos.fuentes_aplicables !== undefined && { fuentes_aplicables: datos.fuentes_aplicables }),
        ...(datos.orden !== undefined && { orden: datos.orden }),
        ...(datos.activo !== undefined && { activo: datos.activo }),
        usuario_actualizacion: userId,
      })
      .eq('id', id)
      .select('id,tipo_fuente,paso_identificador,titulo,descripcion,instrucciones,nivel_validacion,tipo_documento_sugerido,categoria_documento,alcance,fuentes_aplicables,orden,activo,version,fecha_creacion,fecha_actualizacion,usuario_creacion,usuario_actualizacion')
      .single()

    if (error) throw error
    return data
  }

  /**
   * Obtener requisitos COMPARTIDOS entre fuentes (alcance = COMPARTIDO_CLIENTE)
   */
  async obtenerRequisitosCompartidos(supabase: SupabaseClient): Promise<RequisitoFuenteConfig[]> {
    const { data, error } = await supabase
      .from('requisitos_fuentes_pago_config')
      .select('id,tipo_fuente,paso_identificador,titulo,descripcion,instrucciones,nivel_validacion,tipo_documento_sugerido,categoria_documento,alcance,fuentes_aplicables,orden,activo,version,fecha_creacion,fecha_actualizacion,usuario_creacion,usuario_actualizacion')
      .eq('activo', true)
      .eq('alcance', 'COMPARTIDO_CLIENTE')
      .order('orden', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Desactivar requisito (soft delete)
   */
  async desactivarRequisito(
    supabase: SupabaseClient,
    id: string
  ): Promise<void> {
    const { error } = await supabase
      .from('requisitos_fuentes_pago_config')
      .update({ activo: false })
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Reordenar requisitos
   */
  async reordenarRequisitos(
    supabase: SupabaseClient,
    tipoFuente: string,
    requisitosOrdenados: { id: string; orden: number }[]
  ): Promise<void> {
    const updates = requisitosOrdenados.map(({ id, orden }) =>
      supabase
        .from('requisitos_fuentes_pago_config')
        .update({ orden })
        .eq('id', id)
    )

    await Promise.all(updates)
  }

  /**
   * ✅ Obtener tipos de fuente desde CATÁLOGO MAESTRO (tipos_fuentes_pago)
   * NO usar fuentes_pago.tipo que puede tener inconsistencias
   */
  async obtenerTiposFuente(supabase: SupabaseClient): Promise<Array<{ value: string; label: string; cantidad: number }>> {
    // 1. Obtener tipos del catálogo maestro
    const { data: tiposCatalogo, error: errorCatalogo } = await supabase
      .from('tipos_fuentes_pago')
      .select('id, nombre, orden')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (errorCatalogo) {
      console.error('Error al obtener catálogo de tipos de fuentes:', errorCatalogo)
      throw errorCatalogo
    }

    if (!tiposCatalogo || tiposCatalogo.length === 0) {
      console.warn('No hay tipos de fuentes activos en el catálogo')
      return []
    }

    // 2. Contar requisitos configurados por tipo
    const { data: requisitos, error: errorRequisitos } = await supabase
      .from('requisitos_fuentes_pago_config')
      .select('tipo_fuente')
      .eq('activo', true)

    if (errorRequisitos) {
      console.error('Error al contar requisitos:', errorRequisitos)
    }

    // 3. Crear mapa de conteo
    const conteoPorTipo = new Map<string, number>()
    requisitos?.forEach(({ tipo_fuente }) => {
      conteoPorTipo.set(tipo_fuente, (conteoPorTipo.get(tipo_fuente) || 0) + 1)
    })

    // 4. Retornar tipos con conteo
    return tiposCatalogo.map(tipo => ({
      value: tipo.nombre,
      label: tipo.nombre,
      cantidad: conteoPorTipo.get(tipo.nombre) || 0,
    }))
  }
}

export const requisitosService = new RequisitosService()
