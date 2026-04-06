import type { SupabaseClient } from '@supabase/supabase-js'

import { supabase as supabaseSingleton } from '@/lib/supabase/client'
import { errorLog } from '@/lib/utils/logger'

import type {
  OrderDirection,
  TipoFuenteColor,
  TipoFuenteIcono,
  TipoFuentePago,
  TipoFuentePagoError,
  TipoFuentePagoFilters,
  TipoFuentePagoOption,
  TipoFuentePagoOrderBy,
} from '../types'

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: TipoFuentePagoError }

/**
 * Base class with read queries and validation helpers.
 * Extend this class to add mutation methods.
 */
export class TiposFuentesPagoBaseService {
  protected supabase: SupabaseClient

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || supabaseSingleton
  }

  async getAll(
    filters: TipoFuentePagoFilters = {},
    orderBy: TipoFuentePagoOrderBy = 'orden',
    direction: OrderDirection = 'asc'
  ): Promise<ServiceResult<TipoFuentePago[]>> {
    try {
      let query = this.supabase
        .from('tipos_fuentes_pago')
        .select(
          'id,nombre,codigo,descripcion,requiere_entidad,permite_multiples_abonos,es_subsidio,color,icono,orden,activo,created_at,updated_at,created_by,updated_by'
        )

      if (filters.activo !== undefined)
        query = query.eq('activo', filters.activo)
      if (filters.es_subsidio !== undefined)
        query = query.eq('es_subsidio', filters.es_subsidio)
      if (filters.requiere_entidad !== undefined)
        query = query.eq('requiere_entidad', filters.requiere_entidad)
      if (filters.search) {
        query = query.or(
          `nombre.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`
        )
      }

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

  async getOptionsActivas(): Promise<ServiceResult<TipoFuentePagoOption[]>> {
    try {
      const { data, error } = await this.supabase
        .from('tipos_fuentes_pago')
        .select(
          'id, nombre, codigo, requiere_entidad, permite_multiples_abonos, icono, color'
        )
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

      const options: TipoFuentePagoOption[] = data.map(item => ({
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

  async getById(id: string): Promise<ServiceResult<TipoFuentePago>> {
    try {
      const { data, error } = await this.supabase
        .from('tipos_fuentes_pago')
        .select(
          'id,nombre,codigo,descripcion,requiere_entidad,permite_multiples_abonos,es_subsidio,color,icono,orden,activo,created_at,updated_at,created_by,updated_by'
        )
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

  async getByCodigo(codigo: string): Promise<ServiceResult<TipoFuentePago>> {
    try {
      const { data, error } = await this.supabase
        .from('tipos_fuentes_pago')
        .select(
          'id,nombre,codigo,descripcion,requiere_entidad,permite_multiples_abonos,es_subsidio,color,icono,orden,activo,created_at,updated_at,created_by,updated_by'
        )
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

  protected async existeNombre(
    nombre: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      let query = this.supabase
        .from('tipos_fuentes_pago')
        .select('id', { count: 'exact', head: true })
        .eq('nombre', nombre.trim())

      if (excludeId) query = query.neq('id', excludeId)
      const { count } = await query
      return (count ?? 0) > 0
    } catch (error) {
      errorLog('tipos-fuentes-pago/existe-nombre', error)
      return false
    }
  }

  protected async existeCodigo(
    codigo: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      let query = this.supabase
        .from('tipos_fuentes_pago')
        .select('id', { count: 'exact', head: true })
        .eq('codigo', codigo.trim())

      if (excludeId) query = query.neq('id', excludeId)
      const { count } = await query
      return (count ?? 0) > 0
    } catch (error) {
      errorLog('tipos-fuentes-pago/existe-codigo', error)
      return false
    }
  }
}
