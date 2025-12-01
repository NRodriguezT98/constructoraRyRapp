/**
 * Servicio de Fuentes de Pago
 *
 * Gestiona las 4 fuentes de pago por negociación:
 * 1. Cuota Inicial (múltiples abonos)
 * 2. Crédito Hipotecario (desembolso único)
 * 3. Subsidio Mi Casa Ya (desembolso único)
 * 4. Subsidio Caja Compensación (desembolso único)
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 */

import { supabase } from '@/lib/supabase/client'
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'

// Tipos de fuente de pago
export type TipoFuentePago =
  | 'Cuota Inicial'
  | 'Crédito Hipotecario'
  | 'Subsidio Mi Casa Ya'
  | 'Subsidio Caja Compensación'

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
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
  estado?: 'Pendiente' | 'En Proceso' | 'Completada'
  fecha_completado?: string
}

export interface SubirCartaAprobacionDTO {
  fuentePagoId: string
  archivo: File
  tipoDocumento: 'aprobacion' | 'asignacion'
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
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
  estado: 'Pendiente' | 'En Proceso' | 'Completada'
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
      console.log('📝 Creando fuente de pago:', datos)

      // Determinar si permite múltiples abonos (solo Cuota Inicial)
      const permiteMultiplesAbonos = datos.tipo === 'Cuota Inicial'

      const { data, error } = await supabase
        .from('fuentes_pago')
        .insert({
          negociacion_id: datos.negociacion_id,
          tipo: datos.tipo,
          monto_aprobado: datos.monto_aprobado,
          monto_recibido: 0,
          entidad: datos.entidad,
          numero_referencia: datos.numero_referencia,
          permite_multiples_abonos: permiteMultiplesAbonos,
          estado: 'Pendiente',
        })
        .select()
        .single()

      if (error) throw error

      console.log('✅ Fuente de pago creada:', data.id)
      return data as FuentePago
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error creando fuente de pago:', mensaje, error)
      throw error
    }
  }

  /**
   * Obtener fuentes de pago de una negociación
   */
  async obtenerFuentesPagoNegociacion(negociacionId: string): Promise<FuentePago[]> {
    try {
      const { data, error } = await supabase
        .from('fuentes_pago')
        .select('*')
        .eq('negociacion_id', negociacionId)
        .order('fecha_creacion', { ascending: true })

      if (error) throw error
      return (data as FuentePago[]) || []
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error obteniendo fuentes de pago:', mensaje, error)
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
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as FuentePago
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error obteniendo fuente de pago:', mensaje, error)
      return null
    }
  }

  /**
   * Actualizar fuente de pago
   */
  async actualizarFuentePago(id: string, datos: ActualizarFuentePagoDTO): Promise<FuentePago> {
    try {
      console.log('📝 Actualizando fuente de pago:', id, datos)

      const { data, error } = await supabase
        .from('fuentes_pago')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Fuente de pago actualizada')
      return data as FuentePago
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error actualizando fuente de pago:', mensaje, error)
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

      // Si es desembolso único y ya tiene monto recibido, no permitir más
      if (!fuente.permite_multiples_abonos && fuente.monto_recibido > 0) {
        throw new Error('Esta fuente de pago no permite múltiples abonos')
      }

      // Actualizar estado si se completó
      const estaCompleta = nuevoMontoRecibido >= fuente.monto_aprobado
      const updates: ActualizarFuentePagoDTO = {
        monto_recibido: nuevoMontoRecibido,
      }

      if (estaCompleta) {
        updates.estado = 'Completada'
        updates.fecha_completado = formatDateForDB(getTodayDateString())
      } else {
        updates.estado = 'En Proceso'
      }

      return await this.actualizarFuentePago(id, updates)
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error registrando monto recibido:', mensaje, error)
      throw error
    }
  }

  /**
   * Eliminar fuente de pago
   */
  async eliminarFuentePago(id: string): Promise<void> {
    try {
      const fuente = await this.obtenerFuentePago(id)
      if (!fuente) throw new Error('Fuente de pago no encontrada')

      // Solo permitir eliminar si no ha recibido dinero
      if (fuente.monto_recibido > 0) {
        throw new Error('No se puede eliminar una fuente de pago que ya ha recibido dinero')
      }

      const { error } = await supabase.from('fuentes_pago').delete().eq('id', id)

      if (error) throw error
      console.log('✅ Fuente de pago eliminada')
    } catch (error) {
      console.error('❌ Error eliminando fuente de pago:', error)
      throw error
    }
  }

  /**
   * Calcular totales de fuentes de pago de una negociación
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
      console.error('❌ Error calculando totales:', error)
      return {
        total_aprobado: 0,
        total_recibido: 0,
        saldo_pendiente: 0,
        porcentaje_completado: 0,
      }
    }
  }

  /**
   * Verificar si el cierre financiero está completo
   * (todas las fuentes de pago suman el valor total de la negociación)
   */
  async verificarCierreFinancieroCompleto(
    negociacionId: string,
    valorTotalNegociacion: number
  ): Promise<boolean> {
    try {
      const { total_aprobado } = await this.calcularTotales(negociacionId)
      return total_aprobado >= valorTotalNegociacion
    } catch (error) {
      console.error('❌ Error verificando cierre financiero:', error)
      return false
    }
  }

  /**
   * Subir carta de aprobación/asignación para una fuente de pago
   */
  async subirCartaAprobacion(datos: SubirCartaAprobacionDTO): Promise<string> {
    try {
      console.log('📤 Subiendo carta de aprobación:', datos.tipoDocumento)

      const { fuentePagoId, archivo, tipoDocumento } = datos

      // Obtener la fuente de pago para validar
      const fuente = await this.obtenerFuentePago(fuentePagoId)
      if (!fuente) {
        throw new Error('Fuente de pago no encontrada')
      }

      // Generar nombre del archivo
      const timestamp = new Date().getTime()
      const extension = archivo.name.split('.').pop()
      const nombreArchivo = `fuentes-pago/${fuentePagoId}/${tipoDocumento}-${timestamp}.${extension}`

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documentos-clientes')
        .upload(nombreArchivo, archivo, {
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('documentos-clientes').getPublicUrl(nombreArchivo)

      // Actualizar la fuente de pago con la URL del documento
      const campoActualizar = tipoDocumento === 'aprobacion'
        ? 'carta_aprobacion_url'
        : 'carta_asignacion_url'

      await this.actualizarFuentePago(fuentePagoId, {
        [campoActualizar]: publicUrl,
      })

      console.log('✅ Carta de aprobación subida:', publicUrl)
      return publicUrl
    } catch (error) {
      console.error('❌ Error subiendo carta de aprobación:', error)
      throw error
    }
  }

  /**
   * Validar que las fuentes requeridas tengan sus documentos
   */
  async validarDocumentosRequeridos(negociacionId: string): Promise<{
    valido: boolean
    errores: string[]
  }> {
    try {
      const fuentes = await this.obtenerFuentesPagoNegociacion(negociacionId)
      const errores: string[] = []

      for (const fuente of fuentes) {
        // Crédito Hipotecario requiere carta de aprobación
        if (fuente.tipo === 'Crédito Hipotecario' && !fuente.carta_aprobacion_url) {
          errores.push('Crédito Hipotecario requiere carta de aprobación del banco')
        }

        // Subsidio Caja Compensación requiere carta de aprobación
        if (fuente.tipo === 'Subsidio Caja Compensación' && !fuente.carta_aprobacion_url) {
          errores.push('Subsidio Caja Compensación requiere carta de aprobación')
        }
      }

      return {
        valido: errores.length === 0,
        errores,
      }
    } catch (error) {
      console.error('❌ Error validando documentos:', error)
      return {
        valido: false,
        errores: ['Error al validar documentos requeridos'],
      }
    }
  }
}

export const fuentesPagoService = new FuentesPagoService()
