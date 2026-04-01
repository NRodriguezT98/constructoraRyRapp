/**
 * Service Layer: Tipos de Fuentes de Pago
 *
 * Capa de servicio profesional con arquitectura limpia.
 * Encapsula toda la lógica de acceso a datos y operaciones de negocio.
 *
 * Responsabilidades:
 * - CRUD completo de tipos de fuentes de pago
 * - Validaciones de negocio
 * - Transformación de datos DB ↔ Domain
 * - Manejo centralizado de errores
 *
 * Patrón: Repository + Service Pattern
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { supabase as supabaseSingleton } from '@/lib/supabase/client';

import type {
    ActualizarTipoFuentePagoDTO,
    CrearTipoFuentePagoDTO,
    OrderDirection,
    TipoFuenteColor,
    TipoFuenteIcono,
    TipoFuentePago,
    TipoFuentePagoError,
    TipoFuentePagoFilters,
    TipoFuentePagoOption,
    TipoFuentePagoOrderBy,
} from '../types';

// =====================================================
// TYPES
// =====================================================

/**
 * Resultado de operación (Result Pattern)
 */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: TipoFuentePagoError }

// =====================================================
// SERVICE CLASS
// =====================================================

/**
 * Servicio para gestionar tipos de fuentes de pago
 *
 * @example
 * ```typescript
 * const service = new TiposFuentesPagoService()
 * const result = await service.getAll({ activo: true })
 * ```
 */
export class TiposFuentesPagoService {
  private supabase: SupabaseClient

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || supabaseSingleton
  }

  // =====================================================
  // QUERIES (READ)
  // =====================================================

  /**
   * Obtener todos los tipos de fuentes de pago con filtros opcionales
   */
  async getAll(
    filters: TipoFuentePagoFilters = {},
    orderBy: TipoFuentePagoOrderBy = 'orden',
    direction: OrderDirection = 'asc'
  ): Promise<ServiceResult<TipoFuentePago[]>> {
    try {
      let query = this.supabase
        .from('tipos_fuentes_pago')
        .select('id,nombre,codigo,descripcion,requiere_entidad,permite_multiples_abonos,es_subsidio,color,icono,orden,activo,created_at,updated_at,created_by,updated_by')

      // Aplicar filtros
      if (filters.activo !== undefined) {
        query = query.eq('activo', filters.activo)
      }

      if (filters.es_subsidio !== undefined) {
        query = query.eq('es_subsidio', filters.es_subsidio)
      }

      if (filters.requiere_entidad !== undefined) {
        query = query.eq('requiere_entidad', filters.requiere_entidad)
      }

      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`)
      }

      // Aplicar ordenamiento
      query = query.order(orderBy, { ascending: direction === 'asc' })

      const { data, error } = await query

      if (error) {
        return {
          success: false,
          error: {
            type: 'ERROR_DB',
            mensaje: 'Error al obtener tipos de fuentes de pago',
            error,
          },
        }
      }

      return { success: true, data: data as TipoFuentePago[] }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'ERROR_DB',
          mensaje: 'Error inesperado al obtener tipos de fuentes de pago',
          error,
        },
      }
    }
  }

  /**
   * Obtener tipos activos como opciones para selects
   */
  async getOptionsActivas(): Promise<ServiceResult<TipoFuentePagoOption[]>> {
    try {
      const { data, error } = await this.supabase
        .from('tipos_fuentes_pago')
        .select('id, nombre, codigo, requiere_entidad, permite_multiples_abonos, icono, color')
        .eq('activo', true)
        .order('orden', { ascending: true })

      if (error) {
        return {
          success: false,
          error: {
            type: 'ERROR_DB',
            mensaje: 'Error al obtener opciones de fuentes de pago',
            error,
          },
        }
      }

      const options: TipoFuentePagoOption[] = data.map((item) => ({
        value: item.id,
        label: item.nombre,
        codigo: item.codigo,
        requiere_entidad: item.requiere_entidad,
        permite_multiples_abonos: item.permite_multiples_abonos,
        icono: item.icono as TipoFuenteIcono,
        color: item.color as TipoFuenteColor,
      }))

      return { success: true, data: options }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'ERROR_DB',
          mensaje: 'Error inesperado al obtener opciones',
          error,
        },
      }
    }
  }

  /**
   * Obtener un tipo de fuente de pago por ID
   */
  async getById(id: string): Promise<ServiceResult<TipoFuentePago>> {
    try {
      const { data, error } = await this.supabase
        .from('tipos_fuentes_pago')
        .select('id,nombre,codigo,descripcion,requiere_entidad,permite_multiples_abonos,es_subsidio,color,icono,orden,activo,created_at,updated_at,created_by,updated_by')
        .eq('id', id)
        .single()

      if (error) {
        return {
          success: false,
          error: {
            type: 'NO_ENCONTRADO',
            mensaje: `Tipo de fuente de pago con ID ${id} no encontrado`,
          },
        }
      }

      return { success: true, data: data as TipoFuentePago }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'ERROR_DB',
          mensaje: 'Error al obtener tipo de fuente de pago',
          error,
        },
      }
    }
  }

  /**
   * Obtener un tipo de fuente de pago por código
   */
  async getByCodigo(codigo: string): Promise<ServiceResult<TipoFuentePago>> {
    try {
      const { data, error } = await this.supabase
        .from('tipos_fuentes_pago')
        .select('id,nombre,codigo,descripcion,requiere_entidad,permite_multiples_abonos,es_subsidio,color,icono,orden,activo,created_at,updated_at,created_by,updated_by')
        .eq('codigo', codigo)
        .single()

      if (error) {
        return {
          success: false,
          error: {
            type: 'NO_ENCONTRADO',
            mensaje: `Tipo de fuente de pago con código ${codigo} no encontrado`,
          },
        }
      }

      return { success: true, data: data as TipoFuentePago }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'ERROR_DB',
          mensaje: 'Error al obtener tipo de fuente de pago',
          error,
        },
      }
    }
  }

  // =====================================================
  // MUTATIONS (CREATE, UPDATE, DELETE)
  // =====================================================

  /**
   * Crear un nuevo tipo de fuente de pago
   */
  async create(dto: CrearTipoFuentePagoDTO): Promise<ServiceResult<TipoFuentePago>> {
    try {
      // Validar nombre único
      const existeNombre = await this.existeNombre(dto.nombre)
      if (existeNombre) {
        return {
          success: false,
          error: {
            type: 'NOMBRE_DUPLICADO',
            mensaje: `Ya existe un tipo de fuente con el nombre "${dto.nombre}"`,
          },
        }
      }

      // Validar código único
      const existeCodigo = await this.existeCodigo(dto.codigo)
      if (existeCodigo) {
        return {
          success: false,
          error: {
            type: 'CODIGO_DUPLICADO',
            mensaje: `Ya existe un tipo de fuente con el código "${dto.codigo}"`,
          },
        }
      }

      // Insertar
      const { data, error } = await this.supabase
        .from('tipos_fuentes_pago')
        .insert({
          nombre: dto.nombre.trim(),
          codigo: dto.codigo.trim(),
          descripcion: dto.descripcion?.trim() || null,
          requiere_entidad: dto.requiere_entidad,
          permite_multiples_abonos: dto.permite_multiples_abonos,
          es_subsidio: dto.es_subsidio,
          color: dto.color,
          icono: dto.icono,
          orden: dto.orden,
          activo: dto.activo ?? true,
        })
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: {
            type: 'ERROR_DB',
            mensaje: 'Error al crear tipo de fuente de pago',
            error,
          },
        }
      }

      return { success: true, data: data as TipoFuentePago }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'ERROR_DB',
          mensaje: 'Error inesperado al crear tipo de fuente de pago',
          error,
        },
      }
    }
  }

  /**
   * Actualizar un tipo de fuente de pago existente
   */
  async update(id: string, dto: ActualizarTipoFuentePagoDTO): Promise<ServiceResult<TipoFuentePago>> {
    try {
      // Validar que exista
      const existeResult = await this.getById(id)
      if (!existeResult.success) {
        return existeResult
      }

      // Validar nombre único (si se está cambiando)
      if (dto.nombre && dto.nombre !== existeResult.data.nombre) {
        const existeNombre = await this.existeNombre(dto.nombre, id)
        if (existeNombre) {
          return {
            success: false,
            error: {
              type: 'NOMBRE_DUPLICADO',
              mensaje: `Ya existe un tipo de fuente con el nombre "${dto.nombre}"`,
            },
          }
        }
      }

      // Validar código único (si se está cambiando)
      if (dto.codigo && dto.codigo !== existeResult.data.codigo) {
        const existeCodigo = await this.existeCodigo(dto.codigo, id)
        if (existeCodigo) {
          return {
            success: false,
            error: {
              type: 'CODIGO_DUPLICADO',
              mensaje: `Ya existe un tipo de fuente con el código "${dto.codigo}"`,
            },
          }
        }
      }

      // Construir objeto de actualización (solo campos definidos)
      const updateData: Record<string, unknown> = {}
      if (dto.nombre !== undefined) updateData.nombre = dto.nombre.trim()
      if (dto.codigo !== undefined) updateData.codigo = dto.codigo.trim()
      if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion?.trim() || null
      if (dto.requiere_entidad !== undefined) updateData.requiere_entidad = dto.requiere_entidad
      if (dto.permite_multiples_abonos !== undefined) updateData.permite_multiples_abonos = dto.permite_multiples_abonos
      if (dto.es_subsidio !== undefined) updateData.es_subsidio = dto.es_subsidio
      if (dto.color !== undefined) updateData.color = dto.color
      if (dto.icono !== undefined) updateData.icono = dto.icono
      if (dto.orden !== undefined) updateData.orden = dto.orden
      if (dto.activo !== undefined) updateData.activo = dto.activo

      // Actualizar
      const { data, error } = await this.supabase
        .from('tipos_fuentes_pago')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: {
            type: 'ERROR_DB',
            mensaje: 'Error al actualizar tipo de fuente de pago',
            error,
          },
        }
      }

      return { success: true, data: data as TipoFuentePago }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'ERROR_DB',
          mensaje: 'Error inesperado al actualizar tipo de fuente de pago',
          error,
        },
      }
    }
  }

  /**
   * Eliminar (soft delete: marcar como inactivo)
   */
  async softDelete(id: string): Promise<ServiceResult<TipoFuentePago>> {
    return this.update(id, { activo: false })
  }

  /**
   * Eliminar permanentemente (hard delete)
   * ⚠️ USAR CON PRECAUCIÓN
   */
  async hardDelete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('tipos_fuentes_pago')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          success: false,
          error: {
            type: 'ERROR_DB',
            mensaje: 'Error al eliminar tipo de fuente de pago',
            error,
          },
        }
      }

      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'ERROR_DB',
          mensaje: 'Error inesperado al eliminar tipo de fuente de pago',
          error,
        },
      }
    }
  }

  /**
   * Reactivar un tipo de fuente inactivo
   */
  async reactivar(id: string): Promise<ServiceResult<TipoFuentePago>> {
    return this.update(id, { activo: true })
  }

  /**
   * Reordenar tipos de fuentes de pago
   */
  async reordenar(reordenamientos: Array<{ id: string; orden: number }>): Promise<ServiceResult<void>> {
    try {
      // Ejecutar actualizaciones en paralelo
      const promesas = reordenamientos.map(({ id, orden }) =>
        this.supabase
          .from('tipos_fuentes_pago')
          .update({ orden })
          .eq('id', id)
      )

      const resultados = await Promise.all(promesas)

      // Verificar errores
      const errores = resultados.filter((r) => r.error)
      if (errores.length > 0) {
        return {
          success: false,
          error: {
            type: 'ERROR_DB',
            mensaje: 'Error al reordenar tipos de fuentes de pago',
            error: errores,
          },
        }
      }

      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'ERROR_DB',
          mensaje: 'Error inesperado al reordenar',
          error,
        },
      }
    }
  }

  // =====================================================
  // VALIDACIONES PRIVADAS
  // =====================================================

  /**
   * Verificar si existe un nombre (excluyendo ID opcional)
   */
  private async existeNombre(nombre: string, excludeId?: string): Promise<boolean> {
    try {
      let query = this.supabase
        .from('tipos_fuentes_pago')
        .select('id', { count: 'exact', head: true })
        .eq('nombre', nombre.trim())

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { count } = await query

      return (count ?? 0) > 0
    } catch {
      return false
    }
  }

  /**
   * Verificar si existe un código (excluyendo ID opcional)
   */
  private async existeCodigo(codigo: string, excludeId?: string): Promise<boolean> {
    try {
      let query = this.supabase
        .from('tipos_fuentes_pago')
        .select('id', { count: 'exact', head: true })
        .eq('codigo', codigo.trim())

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { count } = await query

      return (count ?? 0) > 0
    } catch {
      return false
    }
  }
}

// =====================================================
// SINGLETON INSTANCE (opcional)
// =====================================================

/**
 * Instancia singleton del servicio
 * Útil para uso directo sin React Query
 */
export const tiposFuentesPagoService = new TiposFuentesPagoService()
