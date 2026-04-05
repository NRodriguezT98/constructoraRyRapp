import type { SupabaseClient } from '@supabase/supabase-js'

import type {
  ActualizarTipoFuentePagoDTO,
  CrearTipoFuentePagoDTO,
  TipoFuentePago,
} from '../types'

import {
  TiposFuentesPagoBaseService,
  type ServiceResult,
} from './tipos-fuentes-pago-base.service'

// Re-export ServiceResult so existing consumers don't need to change imports
export { TiposFuentesPagoBaseService }
export type { ServiceResult }

/**
 * Full service with mutations � extends base queries service
 */
export class TiposFuentesPagoService extends TiposFuentesPagoBaseService {
  constructor(supabaseClient?: SupabaseClient) {
    super(supabaseClient)
  }

  async create(
    dto: CrearTipoFuentePagoDTO
  ): Promise<ServiceResult<TipoFuentePago>> {
    try {
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

      const existeCodigo = await this.existeCodigo(dto.codigo)
      if (existeCodigo) {
        return {
          success: false,
          error: {
            type: 'CODIGO_DUPLICADO',
            mensaje: `Ya existe un tipo de fuente con el c�digo "${dto.codigo}"`,
          },
        }
      }

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

  async update(
    id: string,
    dto: ActualizarTipoFuentePagoDTO
  ): Promise<ServiceResult<TipoFuentePago>> {
    try {
      const existeResult = await this.getById(id)
      if (!existeResult.success) return existeResult

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

      if (dto.codigo && dto.codigo !== existeResult.data.codigo) {
        const existeCodigo = await this.existeCodigo(dto.codigo, id)
        if (existeCodigo) {
          return {
            success: false,
            error: {
              type: 'CODIGO_DUPLICADO',
              mensaje: `Ya existe un tipo de fuente con el c�digo "${dto.codigo}"`,
            },
          }
        }
      }

      const updateData: Record<string, unknown> = {}
      if (dto.nombre !== undefined) updateData.nombre = dto.nombre.trim()
      if (dto.codigo !== undefined) updateData.codigo = dto.codigo.trim()
      if (dto.descripcion !== undefined)
        updateData.descripcion = dto.descripcion?.trim() || null
      if (dto.requiere_entidad !== undefined)
        updateData.requiere_entidad = dto.requiere_entidad
      if (dto.permite_multiples_abonos !== undefined)
        updateData.permite_multiples_abonos = dto.permite_multiples_abonos
      if (dto.es_subsidio !== undefined)
        updateData.es_subsidio = dto.es_subsidio
      if (dto.color !== undefined) updateData.color = dto.color
      if (dto.icono !== undefined) updateData.icono = dto.icono
      if (dto.orden !== undefined) updateData.orden = dto.orden
      if (dto.activo !== undefined) updateData.activo = dto.activo

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

  async softDelete(id: string): Promise<ServiceResult<TipoFuentePago>> {
    return this.update(id, { activo: false })
  }

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

  async reactivar(id: string): Promise<ServiceResult<TipoFuentePago>> {
    return this.update(id, { activo: true })
  }

  async reordenar(
    reordenamientos: Array<{ id: string; orden: number }>
  ): Promise<ServiceResult<void>> {
    try {
      const promesas = reordenamientos.map(({ id, orden }) =>
        this.supabase.from('tipos_fuentes_pago').update({ orden }).eq('id', id)
      )

      const resultados = await Promise.all(promesas)
      const errores = resultados.filter(r => r.error)

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
}

export const tiposFuentesPagoService = new TiposFuentesPagoService()
