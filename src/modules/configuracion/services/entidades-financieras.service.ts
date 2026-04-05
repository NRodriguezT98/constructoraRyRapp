/**
 * Service: Entidades Financieras
 *
 * Capa de servicio para gestión de bancos y cajas de compensación.
 * Implementa Repository + Service Pattern con Result Pattern.
 */

import { supabase as supabaseSingleton } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type {
  ActualizarEntidadFinancieraDTO,
  CrearEntidadFinancieraDTO,
  EntidadesFinancierasFilters,
  EntidadesFinancierasOrderBy,
  EntidadesFinancierasStats,
  EntidadFinanciera,
  EntidadFinancieraResult,
  TipoEntidadFinanciera,
} from '../types/entidades-financieras.types'

export class EntidadesFinancierasService {
  private supabase = supabaseSingleton

  // =====================================================
  // READ OPERATIONS
  // =====================================================

  /**
   * Obtener todas las entidades con filtros opcionales
   */
  async getAll(
    filters?: EntidadesFinancierasFilters,
    orderBy?: EntidadesFinancierasOrderBy
  ): Promise<EntidadFinancieraResult<EntidadFinanciera[]>> {
    try {
      let query = this.supabase.from('entidades_financieras').select('*')

      // Aplicar filtros
      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters?.activo !== undefined) {
        query = query.eq('activo', filters.activo)
      }

      if (filters?.search) {
        query = query.or(
          `nombre.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%,nit.ilike.%${filters.search}%`
        )
      }

      // Ordenamiento
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending })
      } else {
        query = query.order('orden', { ascending: true })
      }

      const { data, error } = await query

      if (error) throw error

      return { success: true, data: data as EntidadFinanciera[] }
    } catch (error) {
      logger.error('Error al obtener entidades financieras:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  /**
   * Obtener entidad por ID
   */
  async getById(
    id: string
  ): Promise<EntidadFinancieraResult<EntidadFinanciera | null>> {
    try {
      const { data, error } = await this.supabase
        .from('entidades_financieras')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { success: true, data: data as EntidadFinanciera }
    } catch (error) {
      logger.error('Error al obtener entidad financiera:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  /**
   * Obtener entidad por código
   */
  async getByCodigo(
    codigo: string
  ): Promise<EntidadFinancieraResult<EntidadFinanciera | null>> {
    try {
      const { data, error } = await this.supabase
        .from('entidades_financieras')
        .select('*')
        .eq('codigo', codigo)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, data: null }
        }
        throw error
      }

      return { success: true, data: data as EntidadFinanciera }
    } catch (error) {
      logger.error('Error al obtener entidad por código:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  /**
   * Obtener solo entidades activas (para formularios)
   */
  async getActivas(
    tipo?: TipoEntidadFinanciera
  ): Promise<EntidadFinancieraResult<EntidadFinanciera[]>> {
    return this.getAll(
      { activo: true, tipo },
      { column: 'orden', ascending: true }
    )
  }

  /**
   * Obtener entidades activas filtradas por tipo de fuente de pago aplicable
   * Usa la función SQL get_entidades_por_tipo_fuente() con índice GIN optimizado
   * @param tipoFuenteId UUID del tipo de fuente de pago desde tipos_fuentes_pago
   */
  async getActivasPorTipoFuente(
    tipoFuenteId: string
  ): Promise<EntidadFinancieraResult<EntidadFinanciera[]>> {
    try {
      const { data, error } = await this.supabase.rpc(
        'get_entidades_por_tipo_fuente',
        {
          p_tipo_fuente_id: tipoFuenteId,
          p_solo_activas: true,
        }
      )

      if (error) throw error

      return { success: true, data: data as EntidadFinanciera[] }
    } catch (error) {
      logger.error('Error al obtener entidades por tipo de fuente:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  /**
   * Obtener estadísticas
   */
  async getStats(): Promise<
    EntidadFinancieraResult<EntidadesFinancierasStats>
  > {
    try {
      const { data, error } = await this.supabase
        .from('entidades_financieras')
        .select('tipo, activo')

      if (error) throw error

      const stats: EntidadesFinancierasStats = {
        total: data.length,
        activas: data.filter(e => e.activo).length,
        inactivas: data.filter(e => !e.activo).length,
        porTipo: {
          Banco: data.filter(e => e.tipo === 'Banco').length,
          'Caja de Compensación': data.filter(
            e => e.tipo === 'Caja de Compensación'
          ).length,
          Cooperativa: data.filter(e => e.tipo === 'Cooperativa').length,
          Otro: data.filter(e => e.tipo === 'Otro').length,
        },
      }

      return { success: true, data: stats }
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  // =====================================================
  // WRITE OPERATIONS
  // =====================================================

  /**
   * Crear nueva entidad
   */
  async create(
    dto: CrearEntidadFinancieraDTO
  ): Promise<EntidadFinancieraResult<EntidadFinanciera>> {
    try {
      // Validar nombre único
      const existeNombre = await this.existeNombre(dto.nombre)
      if (existeNombre) {
        return { success: false, error: 'Ya existe una entidad con ese nombre' }
      }

      // Validar código único
      const existeCodigo = await this.existeCodigo(dto.codigo)
      if (existeCodigo) {
        return { success: false, error: 'Ya existe una entidad con ese código' }
      }

      // Obtener user ID
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      const { data, error } = await this.supabase
        .from('entidades_financieras')
        .insert({
          nombre: dto.nombre.trim(),
          codigo: dto.codigo.trim().toLowerCase(),
          tipo: dto.tipo,
          tipos_fuentes_aplicables: dto.tipos_fuentes_aplicables || [],
          nit: dto.nit?.trim() || null,
          razon_social: dto.razon_social?.trim() || null,
          telefono: dto.telefono?.trim() || null,
          email_contacto: dto.email_contacto?.trim() || null,
          sitio_web: dto.sitio_web?.trim() || null,
          direccion: dto.direccion?.trim() || null,
          codigo_superintendencia: dto.codigo_superintendencia?.trim() || null,
          notas: dto.notas?.trim() || null,
          logo_url: dto.logo_url || null,
          color: dto.color || 'blue',
          orden: dto.orden || 1,
          activo: dto.activo !== undefined ? dto.activo : true,
          created_by: user?.id || null,
          updated_by: user?.id || null,
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data: data as EntidadFinanciera }
    } catch (error) {
      logger.error('Error al crear entidad financiera:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  /**
   * Actualizar entidad existente
   */
  async update(
    id: string,
    dto: ActualizarEntidadFinancieraDTO
  ): Promise<EntidadFinancieraResult<EntidadFinanciera>> {
    try {
      // Validar nombre único (si cambió)
      if (dto.nombre) {
        const existeNombre = await this.existeNombre(dto.nombre, id)
        if (existeNombre) {
          return {
            success: false,
            error: 'Ya existe una entidad con ese nombre',
          }
        }
      }

      // Validar código único (si cambió)
      if (dto.codigo) {
        const existeCodigo = await this.existeCodigo(dto.codigo, id)
        if (existeCodigo) {
          return {
            success: false,
            error: 'Ya existe una entidad con ese código',
          }
        }
      }

      // Obtener user ID
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      const updateData: Record<string, unknown> = {}

      if (dto.nombre !== undefined) updateData.nombre = dto.nombre.trim()
      if (dto.codigo !== undefined)
        updateData.codigo = dto.codigo.trim().toLowerCase()
      if (dto.tipo !== undefined) updateData.tipo = dto.tipo
      if (dto.tipos_fuentes_aplicables !== undefined)
        updateData.tipos_fuentes_aplicables = dto.tipos_fuentes_aplicables
      if (dto.nit !== undefined) updateData.nit = dto.nit?.trim() || null
      if (dto.razon_social !== undefined)
        updateData.razon_social = dto.razon_social?.trim() || null
      if (dto.telefono !== undefined)
        updateData.telefono = dto.telefono?.trim() || null
      if (dto.email_contacto !== undefined)
        updateData.email_contacto = dto.email_contacto?.trim() || null
      if (dto.sitio_web !== undefined)
        updateData.sitio_web = dto.sitio_web?.trim() || null
      if (dto.direccion !== undefined)
        updateData.direccion = dto.direccion?.trim() || null
      if (dto.codigo_superintendencia !== undefined)
        updateData.codigo_superintendencia =
          dto.codigo_superintendencia?.trim() || null
      if (dto.notas !== undefined) updateData.notas = dto.notas?.trim() || null
      if (dto.logo_url !== undefined) updateData.logo_url = dto.logo_url || null
      if (dto.color !== undefined) updateData.color = dto.color
      if (dto.orden !== undefined) updateData.orden = dto.orden
      if (dto.activo !== undefined) updateData.activo = dto.activo

      updateData.updated_by = user?.id || null

      const { data, error } = await this.supabase
        .from('entidades_financieras')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data: data as EntidadFinanciera }
    } catch (error) {
      logger.error('Error al actualizar entidad financiera:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  /**
   * Soft delete (desactivar)
   */
  async softDelete(
    id: string
  ): Promise<EntidadFinancieraResult<EntidadFinanciera>> {
    return this.update(id, { activo: false })
  }

  /**
   * Reactivar entidad
   */
  async reactivate(
    id: string
  ): Promise<EntidadFinancieraResult<EntidadFinanciera>> {
    return this.update(id, { activo: true })
  }

  /**
   * Reordenar entidades
   */
  async reordenar(
    updates: Array<{ id: string; orden: number }>
  ): Promise<EntidadFinancieraResult<boolean>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      const promises = updates.map(update =>
        this.supabase
          .from('entidades_financieras')
          .update({ orden: update.orden, updated_by: user?.id || null })
          .eq('id', update.id)
      )

      const results = await Promise.all(promises)

      const hasError = results.some(r => r.error)
      if (hasError) {
        throw new Error('Error al reordenar algunas entidades')
      }

      return { success: true, data: true }
    } catch (error) {
      logger.error('Error al reordenar entidades:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  // =====================================================
  // VALIDACIONES PRIVADAS
  // =====================================================

  private async existeNombre(
    nombre: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      let query = this.supabase
        .from('entidades_financieras')
        .select('id')
        .ilike('nombre', nombre)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query.maybeSingle()

      if (error) throw error

      return !!data
    } catch (error) {
      logger.error('Error al validar nombre:', error)
      return false
    }
  }

  private async existeCodigo(
    codigo: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      let query = this.supabase
        .from('entidades_financieras')
        .select('id')
        .eq('codigo', codigo.toLowerCase())

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query.maybeSingle()

      if (error) throw error

      return !!data
    } catch (error) {
      logger.error('Error al validar código:', error)
      return false
    }
  }
}

// Singleton instance
export const entidadesFinancierasService = new EntidadesFinancierasService()
