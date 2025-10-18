/**
 * Servicio de Negociaciones
 *
 * Gestiona la vinculación Cliente + Vivienda + Cierre Financiero
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 *
 * Estados de negociación:
 * - 'En Proceso' → Negociando
 * - 'Cierre Financiero' → Configurando fuentes de pago
 * - 'Activa' → Recibiendo abonos
 * - 'Completada' → 100% pagado
 * - 'Cancelada' → No se concretó
 * - 'Renuncia' → Cliente renunció
 */

import { supabase } from '@/lib/supabase/client-browser'

// DTOs
export interface CrearNegociacionDTO {
  cliente_id: string
  vivienda_id: string
  valor_negociado: number
  descuento_aplicado?: number
  notas?: string
}

export interface ActualizarNegociacionDTO {
  estado?: string
  valor_negociado?: number
  descuento_aplicado?: number
  fecha_cierre_financiero?: string
  fecha_activacion?: string
  fecha_completada?: string
  fecha_cancelacion?: string
  motivo_cancelacion?: string
  notas?: string
}

export interface Negociacion {
  id: string
  cliente_id: string
  vivienda_id: string
  estado: string
  valor_negociado: number
  descuento_aplicado: number
  valor_total: number
  total_fuentes_pago: number
  total_abonado: number
  saldo_pendiente: number
  porcentaje_pagado: number
  fecha_negociacion: string
  fecha_cierre_financiero?: string
  fecha_activacion?: string
  fecha_completada?: string
  fecha_cancelacion?: string
  motivo_cancelacion?: string
  notas?: string
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_creacion?: string
}

class NegociacionesService {
  /**
   * Crear nueva negociación
   */
  async crearNegociacion(datos: CrearNegociacionDTO): Promise<Negociacion> {
    try {
      console.log('📝 Creando negociación:', datos)

      const { data, error } = await supabase
        .from('negociaciones')
        .insert({
          cliente_id: datos.cliente_id,
          vivienda_id: datos.vivienda_id,
          valor_negociado: datos.valor_negociado,
          descuento_aplicado: datos.descuento_aplicado || 0,
          notas: datos.notas,
          estado: 'En Proceso',
        })
        .select()
        .single()

      if (error) throw error

      console.log('✅ Negociación creada:', data.id)
      return data as Negociacion
    } catch (error) {
      console.error('❌ Error creando negociación:', error)
      throw error
    }
  }

  /**
   * Obtener negociación por ID
   */
  async obtenerNegociacion(id: string): Promise<Negociacion | null> {
    try {
      const { data, error} = await supabase
        .from('negociaciones')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Negociacion
    } catch (error) {
      console.error('❌ Error obteniendo negociación:', error)
      return null
    }
  }

  /**
   * Obtener negociaciones de un cliente
   */
  async obtenerNegociacionesCliente(clienteId: string): Promise<Negociacion[]> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error
      return (data as Negociacion[]) || []
    } catch (error) {
      console.error('❌ Error obteniendo negociaciones del cliente:', error)
      return []
    }
  }

  /**
   * Obtener negociación activa de una vivienda
   */
  async obtenerNegociacionVivienda(viviendaId: string): Promise<Negociacion | null> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select('*')
        .eq('vivienda_id', viviendaId)
        .in('estado', ['En Proceso', 'Cierre Financiero', 'Activa'])
        .order('fecha_creacion', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found"
      return data as Negociacion | null
    } catch (error) {
      console.error('❌ Error obteniendo negociación de vivienda:', error)
      return null
    }
  }

  /**
   * Actualizar negociación
   */
  async actualizarNegociacion(
    id: string,
    datos: ActualizarNegociacionDTO
  ): Promise<Negociacion> {
    try {
      console.log('📝 Actualizando negociación:', id, datos)

      const { data, error } = await supabase
        .from('negociaciones')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Negociación actualizada')
      return data as Negociacion
    } catch (error) {
      console.error('❌ Error actualizando negociación:', error)
      throw error
    }
  }

  /**
   * Pasar negociación a Cierre Financiero
   */
  async pasarACierreFinanciero(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Cierre Financiero',
      fecha_cierre_financiero: new Date().toISOString(),
    })
  }

  /**
   * Activar negociación (cuando cierre financiero está completo)
   */
  async activarNegociacion(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Activa',
      fecha_activacion: new Date().toISOString(),
    })
  }

  /**
   * Completar negociación (100% pagado)
   */
  async completarNegociacion(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Completada',
      fecha_completada: new Date().toISOString(),
    })
  }

  /**
   * Cancelar negociación
   */
  async cancelarNegociacion(id: string, motivo: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Cancelada',
      fecha_cancelacion: new Date().toISOString(),
      motivo_cancelacion: motivo,
    })
  }

  /**
   * Registrar renuncia
   */
  async registrarRenuncia(id: string, motivo: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Renuncia',
      fecha_cancelacion: new Date().toISOString(),
      motivo_cancelacion: motivo,
    })
  }

  /**
   * Verificar si un cliente ya tiene negociación activa con una vivienda
   */
  async existeNegociacionActiva(
    clienteId: string,
    viviendaId: string
  ): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('negociaciones')
        .select('id', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('vivienda_id', viviendaId)
        .in('estado', ['En Proceso', 'Cierre Financiero', 'Activa'])

      if (error) throw error
      return (count ?? 0) > 0
    } catch (error) {
      console.error('❌ Error verificando negociación activa:', error)
      return false
    }
  }

  /**
   * Eliminar negociación (solo si está en 'En Proceso')
   */
  async eliminarNegociacion(id: string): Promise<void> {
    try {
      // Verificar estado primero
      const negociacion = await this.obtenerNegociacion(id)
      if (!negociacion) throw new Error('Negociación no encontrada')

      if (negociacion.estado !== 'En Proceso') {
        throw new Error('Solo se pueden eliminar negociaciones en proceso')
      }

      const { error } = await supabase
        .from('negociaciones')
        .delete()
        .eq('id', id)

      if (error) throw error
      console.log('✅ Negociación eliminada')
    } catch (error) {
      console.error('❌ Error eliminando negociación:', error)
      throw error
    }
  }
}

export const negociacionesService = new NegociacionesService()
