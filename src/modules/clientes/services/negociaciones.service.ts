/**
 * Servicio para gestión de negociaciones (intereses de clientes en viviendas)
 */

import { supabase } from '@/lib/supabase'

export interface CrearNegociacionDTO {
  clienteId: string
  viviendaId: string
  valorNegociado: number
  descuentoAplicado?: number
  notas?: string
}

export interface Negociacion {
  id: string
  cliente_id: string
  vivienda_id: string
  estado: 'En Proceso' | 'Cierre Financiero' | 'Activa' | 'Completada' | 'Cancelada' | 'Renuncia'
  valor_negociado: number
  descuento_aplicado: number
  valor_total: number
  total_abonado: number
  saldo_pendiente: number
  porcentaje_pagado: number
  fecha_negociacion: string
  notas?: string
  fecha_creacion: string
  fecha_actualizacion: string
}

export class NegociacionesService {
  /**
   * Registra un nuevo interés (negociación en estado "En Proceso")
   */
  static async registrarInteres(data: CrearNegociacionDTO): Promise<Negociacion> {
    try {
      const { data: negociacion, error } = await supabase
        .from('negociaciones')
        .insert({
          cliente_id: data.clienteId,
          vivienda_id: data.viviendaId,
          valor_negociado: data.valorNegociado,
          descuento_aplicado: data.descuentoAplicado || 0,
          estado: 'En Proceso',
          notas: data.notas,
        })
        .select('*')
        .single()

      if (error) throw error

      return negociacion
    } catch (error) {
      console.error('Error al registrar interés:', error)
      throw error
    }
  }

  /**
   * Obtiene todas las negociaciones de un cliente
   */
  static async obtenerNegociacionesPorCliente(clienteId: string): Promise<Negociacion[]> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error al obtener negociaciones:', error)
      throw error
    }
  }

  /**
   * Actualiza el estado de una negociación
   */
  static async actualizarEstado(
    negociacionId: string,
    nuevoEstado: Negociacion['estado'],
    motivo?: string
  ): Promise<void> {
    try {
      const updates: any = {
        estado: nuevoEstado,
        fecha_actualizacion: new Date().toISOString(),
      }

      if (nuevoEstado === 'Cancelada' || nuevoEstado === 'Renuncia') {
        updates.motivo_cancelacion = motivo
        updates.fecha_cancelacion = new Date().toISOString()
      } else if (nuevoEstado === 'Cierre Financiero') {
        updates.fecha_cierre_financiero = new Date().toISOString()
      } else if (nuevoEstado === 'Activa') {
        updates.fecha_activacion = new Date().toISOString()
      } else if (nuevoEstado === 'Completada') {
        updates.fecha_completada = new Date().toISOString()
      }

      const { error } = await supabase
        .from('negociaciones')
        .update(updates)
        .eq('id', negociacionId)

      if (error) throw error
    } catch (error) {
      console.error('Error al actualizar estado de negociación:', error)
      throw error
    }
  }

  /**
   * Verifica si un cliente ya tiene una negociación con una vivienda
   */
  static async verificarNegociacionExistente(
    clienteId: string,
    viviendaId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select('id')
        .eq('cliente_id', clienteId)
        .eq('vivienda_id', viviendaId)
        .maybeSingle()

      if (error) throw error

      return !!data
    } catch (error) {
      console.error('Error al verificar negociación existente:', error)
      throw error
    }
  }
}
