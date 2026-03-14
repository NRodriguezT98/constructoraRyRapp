/**
 * Servicio de Fuentes de Pago
 *
 * Gestiona las 4 fuentes de pago por negociaciÃ³n:
 * 1. Cuota Inicial (mÃºltiples abonos)
 * 2. CrÃ©dito Hipotecario (desembolso Ãºnico)
 * 3. Subsidio Mi Casa Ya (desembolso Ãºnico)
 * 4. Subsidio Caja CompensaciÃ³n (desembolso Ãºnico)
 *
 * Ã¢Å¡Â Ã¯Â¸Â NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 */

import { supabase } from '@/lib/supabase/client'
import type { TipoFuentePago } from '@/modules/clientes/types'
export type { TipoFuentePago }

// DTOs
export interface CrearFuentePagoDTO {
  negociacion_id: string
  tipo: TipoFuentePago
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
}

export interface ActualizarFuentePagoDTO {
  monto_aprobado?: number
  monto_recibido?: number
  entidad?: string
  numero_referencia?: string
  carta_asignacion_url?: string
  estado?: 'Activa' | 'Inactiva'
  fecha_completado?: string
}

export interface FuentePago {
  id: string
  negociacion_id: string
  tipo: TipoFuentePago
  monto_aprobado: number
  monto_recibido: number
  saldo_pendiente: number // Calculado
  porcentaje_completado: number // Calculado
  entidad?: string
  numero_referencia?: string
  permite_multiples_abonos: boolean
  carta_asignacion_url?: string
  estado: 'Activa' | 'Inactiva'
  estado_fuente?: string
  fecha_completado?: string
  fecha_creacion: string
  fecha_actualizacion: string
}

class FuentesPagoService {
  /**
   * Crear fuente de pago
   */
  async crearFuentePago(datos: CrearFuentePagoDTO): Promise<FuentePago> {
    try {

      // Determinar si permite mÃºltiples abonos (solo Cuota Inicial)
      const permiteMultiplesAbonos = datos.tipo === 'Cuota Inicial'

      // Resolver tipo_fuente_id (FK NOT NULL) desde tipos_fuentes_pago
      const { data: tipoFuente, error: tipoError } = await supabase
        .from('tipos_fuentes_pago')
        .select('id')
        .eq('nombre', datos.tipo)
        .single()

      if (tipoError || !tipoFuente) {
        throw new Error(`No se encontrÃ³ el tipo de fuente de pago: ${datos.tipo}`)
      }

      const { data, error } = await supabase
        .from('fuentes_pago')
        .insert({
          negociacion_id: datos.negociacion_id,
          tipo: datos.tipo,
          tipo_fuente_id: tipoFuente.id,
          monto_aprobado: datos.monto_aprobado,
          monto_recibido: 0,
          entidad: datos.entidad,
          numero_referencia: datos.numero_referencia,
          permite_multiples_abonos: permiteMultiplesAbonos,
          estado: 'Activa',
        } as any)
        .select()
        .single()

      if (error) throw error

      return data as unknown as FuentePago
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Ã¢ÂÅ’ [CLIENTES] Error creando fuente de pago:', mensaje, error)
      throw error
    }
  }

  /**
   * Obtener fuentes de pago de una negociaciÃ³n ordenadas segÃºn configuraciÃ³n FK robusta
   */
  async obtenerFuentesPagoNegociacion(negociacionId: string): Promise<FuentePago[]> {
    try {
      // Ã¢Å“â€¦ JOIN ROBUSTA con FK tipo_fuente_id -> tipos_fuentes_pago.id
      const { data, error } = await supabase
        .from('fuentes_pago')
        .select(`
          id, negociacion_id, tipo, entidad, monto_aprobado,
          numero_referencia, estado, estado_fuente, fecha_creacion, fecha_actualizacion,
          permite_multiples_abonos, carta_asignacion_url, monto_recibido, saldo_pendiente,
          tipos_fuentes_pago!fk_fuentes_pago_tipo_fuente(
            orden, nombre, activo
          )
        `)
        .eq('negociacion_id', negociacionId)
        .eq('estado_fuente', 'activa') // Ã¢Å“â€¦ Solo fuentes activas
        .eq('tipos_fuentes_pago.activo', true) // Ã¢Å“â€¦ Solo tipos activos
        .order('tipos_fuentes_pago(orden)', { ascending: true }) // Ã¢Å“â€¦ Orden por configuraciÃ³n

      if (error) throw error
      return (data as unknown as FuentePago[]) || []
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Ã¢ÂÅ’ [CLIENTES] Error obteniendo fuentes de pago:', mensaje, error)
      return []
    }
  }

  /**
   * Obtener fuente de pago por ID
   */
  async obtenerFuentePago(id: string): Promise<FuentePago | null> {
    try {
      const { data, error } = await supabase
        .from('fuentes_pago')
        .select(`
          id, negociacion_id, tipo_fuente, entidad_financiera, valor_aprobado,
          numero_aprobacion, estado_fuente, fecha_aprobacion, observaciones,
          fecha_creacion, usuario_creacion, url_documento_aprobacion
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as unknown as FuentePago
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Ã¢ÂÅ’ [CLIENTES] Error obteniendo fuente de pago:', mensaje, error)
      return null
    }
  }

  /**
   * Actualizar fuente de pago
   */
  async actualizarFuentePago(id: string, datos: ActualizarFuentePagoDTO): Promise<FuentePago> {
    try {

      const { data, error } = await supabase
        .from('fuentes_pago')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data as unknown as FuentePago
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Ã¢ÂÅ’ [CLIENTES] Error actualizando fuente de pago:', mensaje, error)
      throw error
    }
  }

  /**
   * Registrar monto recibido (abono o desembolso completo)
   */
  async registrarMontoRecibido(id: string, monto: number): Promise<FuentePago> {
    try {
      const fuente = await this.obtenerFuentePago(id)
      if (!fuente) throw new Error('Fuente de pago no encontrada')

      const nuevoMontoRecibido = fuente.monto_recibido + monto

      // Validar que no exceda el monto aprobado
      if (nuevoMontoRecibido > fuente.monto_aprobado) {
        throw new Error('El monto recibido excede el monto aprobado')
      }

      // Si es desembolso Ãºnico y ya tiene monto recibido, no permitir mÃ¡s
      if (!fuente.permite_multiples_abonos && fuente.monto_recibido > 0) {
        throw new Error('Esta fuente de pago no permite mÃºltiples abonos')
      }

      // Actualizar monto recibido
      const updates: ActualizarFuentePagoDTO = {
        monto_recibido: nuevoMontoRecibido,
      }

      return await this.actualizarFuentePago(id, updates)
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Ã¢ÂÅ’ [CLIENTES] Error registrando monto recibido:', mensaje, error)
      throw error
    }
  }

  /**
   * Inactivar fuente de pago (soft delete)
   * Marca como inactiva en lugar de eliminar permanentemente
   * Conserva historial y dispara trigger para marcar documentos como obsoletos
   */
  async inactivarFuentePago(
    id: string,
    razon: string,
    reemplazadaPor?: string
  ): Promise<void> {
    try {
      const fuente = await this.obtenerFuentePago(id)
      if (!fuente) throw new Error('Fuente de pago no encontrada')

      // Ã¢Å¡Â Ã¯Â¸Â PROHIBIDO: No permitir si ha recibido dinero
      if (fuente.monto_recibido > 0) {
        throw new Error(
          `No se puede eliminar una fuente de pago que ya ha recibido $${fuente.monto_recibido.toLocaleString('es-CO')}. ` +
          `Esta fuente debe permanecer activa para mantener el historial de abonos.`
        )
      }

      // Marcar como inactiva â€” sincronizar AMBAS columnas de estado
      const nuevoEstadoFuente = reemplazadaPor ? 'reemplazada' : 'inactiva'
      const { error } = await supabase
        .from('fuentes_pago')
        .update({
          estado: 'Inactiva',
          estado_fuente: nuevoEstadoFuente,
          razon_inactivacion: razon,
          fecha_inactivacion: new Date().toISOString(),
          reemplazada_por: reemplazadaPor || null,
        })
        .eq('id', id)

      if (error) throw error

    } catch (error) {
      console.error('Ã¢ÂÅ’ Error inactivando fuente de pago:', error)
      throw error
    }
  }

  /**
   * Eliminar PERMANENTEMENTE fuente de pago
   * Ã¢Å¡Â Ã¯Â¸Â SOLO usar si NO tiene dinero recibido (trigger en BD lo valida)
   * @deprecated Usar inactivarFuentePago() para mantener historial
   */
  async eliminarFuentePago(id: string): Promise<void> {
    try {
      const fuente = await this.obtenerFuentePago(id)
      if (!fuente) throw new Error('Fuente de pago no encontrada')

      // ValidaciÃ³n adicional (trigger en BD tambiÃ©n lo valida)
      if (fuente.monto_recibido > 0) {
        throw new Error(
          `PROHIBIDO: No se puede eliminar una fuente con $${fuente.monto_recibido.toLocaleString('es-CO')} recibidos. ` +
          `El trigger de base de datos bloquearÃ¡ esta operaciÃ³n.`
        )
      }

      // Intentar eliminar (trigger puede rechazar)
      const { error } = await supabase.from('fuentes_pago').delete().eq('id', id)

      if (error) {
        // Si el trigger rechaza, mostrar mensaje amigable
        if (error.message.includes('PROHIBIDO')) {
          throw new Error('No se puede eliminar esta fuente porque ya ha recibido dinero')
        }
        throw error
      }

    } catch (error) {
      console.error('Ã¢ÂÅ’ Error eliminando fuente de pago:', error)
      throw error
    }
  }

  /**
   * Calcular totales de fuentes de pago de una negociaciÃ³n
   */
  async calcularTotales(negociacionId: string): Promise<{
    total_aprobado: number
    total_recibido: number
    saldo_pendiente: number
    porcentaje_completado: number
  }> {
    try {
      const fuentes = await this.obtenerFuentesPagoNegociacion(negociacionId)

      const total_aprobado = fuentes.reduce((sum, f) => sum + f.monto_aprobado, 0)
      const total_recibido = fuentes.reduce((sum, f) => sum + f.monto_recibido, 0)
      const saldo_pendiente = total_aprobado - total_recibido
      const porcentaje_completado = total_aprobado > 0 ? (total_recibido / total_aprobado) * 100 : 0

      return {
        total_aprobado,
        total_recibido,
        saldo_pendiente,
        porcentaje_completado,
      }
    } catch (error) {
      console.error('Ã¢ÂÅ’ Error calculando totales:', error)
      return {
        total_aprobado: 0,
        total_recibido: 0,
        saldo_pendiente: 0,
        porcentaje_completado: 0,
      }
    }
  }

  /**
   * Verificar si el cierre financiero estÃ¡ completo
   * (todas las fuentes de pago suman el valor total de la negociaciÃ³n)
   */
  async verificarCierreFinancieroCompleto(
    negociacionId: string,
    valorTotalNegociacion: number
  ): Promise<boolean> {
    try {
      const { total_aprobado } = await this.calcularTotales(negociacionId)
      return total_aprobado >= valorTotalNegociacion
    } catch (error) {
      console.error('Ã¢ÂÅ’ Error verificando cierre financiero:', error)
      return false
    }
  }
}

export const fuentesPagoService = new FuentesPagoService()
