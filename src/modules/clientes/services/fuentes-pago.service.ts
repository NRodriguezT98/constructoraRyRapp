import { supabase } from '@/lib/supabase/client'
import type { TipoFuentePago } from '@/modules/clientes/types'
export type { TipoFuentePago }

// ============================================================
// DTOs
// ============================================================

export interface CrearFuentePagoDTO {
  negociacion_id: string
  tipo: TipoFuentePago
  monto_aprobado: number
  /** Para créditos: capital sin intereses. Se guarda en capital_para_cierre */
  capital_para_cierre?: number
  entidad?: string             // nombre legible (nunca UUID)
  entidad_financiera_id?: string // opcional: ID resuelto por el caller
  numero_referencia?: string
  permite_multiples_abonos?: boolean
}

export interface ActualizarFuentePagoDTO {
  monto_aprobado?: number
  monto_recibido?: number
  entidad?: string
  entidad_financiera_id?: string
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
  /** Para créditos: el capital sin intereses. Para otras fuentes: igual a monto_aprobado */
  capital_para_cierre: number | null
  mora_total_recibida: number
  monto_recibido: number
  saldo_pendiente: number
  porcentaje_completado: number
  entidad?: string
  entidad_financiera_id?: string
  numero_referencia?: string
  permite_multiples_abonos: boolean
  carta_asignacion_url?: string
  estado: 'Activa' | 'Inactiva'
  estado_fuente?: string
  fecha_completado?: string
  fecha_creacion: string
  fecha_actualizacion: string
}

// ============================================================
// COLUMNS SELECCIONADAS (tabla base, sin vista)
// ============================================================

const BASE_COLUMNS = `
  id, negociacion_id, tipo, entidad, entidad_financiera_id,
  monto_aprobado, monto_recibido, saldo_pendiente, porcentaje_completado,
  numero_referencia, permite_multiples_abonos, carta_asignacion_url,
  estado, estado_fuente, fecha_completado, fecha_creacion, fecha_actualizacion
`.trim()

// ============================================================
// SERVICE
// ============================================================

class FuentesPagoService {

  /** Crear fuente de pago */
  async crearFuentePago(datos: CrearFuentePagoDTO): Promise<FuentePago> {
    // Resolver tipo_fuente_id (FK NOT NULL)
    const { data: tipoFuente, error: tipoError } = await supabase
      .from('tipos_fuentes_pago')
      .select('id, permite_multiples_abonos')
      .eq('nombre', datos.tipo)
      .single()

    if (tipoError || !tipoFuente) {
      throw new Error(`Tipo de fuente de pago no encontrado: ${datos.tipo}`)
    }

    // Resolver entidad_financiera_id si no viene del caller pero sí el nombre
    let entidadFinancieraId = datos.entidad_financiera_id ?? null
    if (!entidadFinancieraId && datos.entidad) {
      const { data: ef } = await supabase
        .from('entidades_financieras')
        .select('id')
        .eq('nombre', datos.entidad)
        .maybeSingle()
      entidadFinancieraId = ef?.id ?? null
    }

    const { data, error } = await supabase
      .from('fuentes_pago')
      .insert({
        negociacion_id: datos.negociacion_id,
        tipo: datos.tipo,
        tipo_fuente_id: tipoFuente.id,
        monto_aprobado: datos.monto_aprobado,
        monto_recibido: 0,
        entidad: datos.entidad ?? null,
        entidad_financiera_id: entidadFinancieraId,
        numero_referencia: datos.numero_referencia ?? null,
        permite_multiples_abonos: datos.permite_multiples_abonos ?? tipoFuente.permite_multiples_abonos ?? false,
        capital_para_cierre: datos.capital_para_cierre ?? null,
        estado: 'Activa',
        estado_fuente: 'activa',
      })
      .select(BASE_COLUMNS)
      .single()

    if (error) throw error
    return data as unknown as FuentePago
  }

  /**
   * Obtener fuentes activas de una negociación.
   * Usa la vista fuentes_pago_con_entidad para que entidad siempre sea
   * el nombre legible (via JOIN con entidades_financieras), nunca un UUID.
   */
  async obtenerFuentesPagoNegociacion(negociacionId: string): Promise<FuentePago[]> {
    const { data, error } = await supabase
      .from('fuentes_pago_con_entidad')
      .select(`
        id, negociacion_id, tipo, entidad_display, entidad_financiera_id,
        monto_aprobado, monto_recibido, saldo_pendiente, porcentaje_completado,
        numero_referencia, permite_multiples_abonos, carta_asignacion_url,
        estado, estado_fuente, fecha_completado, fecha_creacion, fecha_actualizacion
      `)
      .eq('negociacion_id', negociacionId)
      .eq('estado_fuente', 'activa')
      .order('fecha_creacion', { ascending: true })

    if (error) throw error

    return (data ?? []).map((row: any) => ({
      ...row,
      entidad: row.entidad_display ?? undefined,
    })) as FuentePago[]
  }

  /** Obtener fuente de pago por ID */
  async obtenerFuentePago(id: string): Promise<FuentePago | null> {
    const { data, error } = await supabase
      .from('fuentes_pago_con_entidad')
      .select(`
        id, negociacion_id, tipo, entidad_display, entidad_financiera_id,
        monto_aprobado, monto_recibido, saldo_pendiente, porcentaje_completado,
        numero_referencia, permite_multiples_abonos, carta_asignacion_url,
        estado, estado_fuente, fecha_completado, fecha_creacion, fecha_actualizacion
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return { ...(data as any), entidad: (data as any).entidad_display ?? undefined } as FuentePago
  }

  /** Actualizar fuente de pago */
  async actualizarFuentePago(id: string, datos: ActualizarFuentePagoDTO): Promise<FuentePago> {
    const { data, error } = await supabase
      .from('fuentes_pago')
      .update(datos)
      .eq('id', id)
      .select(BASE_COLUMNS)
      .single()

    if (error) throw error
    return data as unknown as FuentePago
  }

  /** Registrar monto recibido (abono) */
  async registrarMontoRecibido(id: string, monto: number): Promise<FuentePago> {
    const fuente = await this.obtenerFuentePago(id)
    if (!fuente) throw new Error('Fuente de pago no encontrada')

    const nuevoTotal = fuente.monto_recibido + monto

    if (nuevoTotal > fuente.monto_aprobado) {
      throw new Error('El monto recibido excede el monto aprobado')
    }

    if (!fuente.permite_multiples_abonos && fuente.monto_recibido > 0) {
      throw new Error('Esta fuente de pago no permite múltiples abonos')
    }

    return this.actualizarFuentePago(id, { monto_recibido: nuevoTotal })
  }

  /**
   * Inactivar fuente de pago (soft delete).
   * No se puede inactivar si ya recibió dinero.
   */
  async inactivarFuentePago(id: string, razon: string, reemplazadaPor?: string): Promise<void> {
    const fuente = await this.obtenerFuentePago(id)
    if (!fuente) throw new Error('Fuente de pago no encontrada')

    if (fuente.monto_recibido > 0) {
      throw new Error(
        `No se puede eliminar una fuente que ya recibió $${fuente.monto_recibido.toLocaleString('es-CO')}. ` +
        `Debe permanecer activa para conservar el historial de abonos.`
      )
    }

    const { error } = await supabase
      .from('fuentes_pago')
      .update({
        estado: 'Inactiva',
        estado_fuente: reemplazadaPor ? 'reemplazada' : 'inactiva',
        razon_inactivacion: razon,
        fecha_inactivacion: new Date().toISOString(),
        reemplazada_por: reemplazadaPor ?? null,
      })
      .eq('id', id)

    if (error) throw error
  }

  /** Eliminar permanentemente. Solo si no tiene dinero recibido. */
  async eliminarFuentePago(id: string): Promise<void> {
    const fuente = await this.obtenerFuentePago(id)
    if (!fuente) throw new Error('Fuente de pago no encontrada')

    if (fuente.monto_recibido > 0) {
      throw new Error(
        `PROHIBIDO: No se puede eliminar una fuente con $${fuente.monto_recibido.toLocaleString('es-CO')} recibidos.`
      )
    }

    const { error } = await supabase.from('fuentes_pago').delete().eq('id', id)

    if (error) {
      throw new Error(
        error.message.includes('PROHIBIDO')
          ? 'No se puede eliminar esta fuente porque ya ha recibido dinero'
          : error.message
      )
    }
  }

  /** Calcular totales de todas las fuentes activas de una negociación */
  async calcularTotales(negociacionId: string): Promise<{
    total_aprobado: number
    total_recibido: number
    saldo_pendiente: number
    porcentaje_completado: number
  }> {
    const fuentes = await this.obtenerFuentesPagoNegociacion(negociacionId)

    const total_aprobado = fuentes.reduce((s, f) => s + f.monto_aprobado, 0)
    const total_recibido = fuentes.reduce((s, f) => s + f.monto_recibido, 0)

    return {
      total_aprobado,
      total_recibido,
      saldo_pendiente: total_aprobado - total_recibido,
      porcentaje_completado: total_aprobado > 0 ? (total_recibido / total_aprobado) * 100 : 0,
    }
  }

  /**
   * Verificar si el cierre financiero está completo.
   *
   * Usa COALESCE(capital_para_cierre, monto_aprobado) para que los créditos
   * contribuyan con su capital (no con capital+intereses) al total de financiación.
   * Evita que los intereses inflen el total por encima del valor de la vivienda.
   */
  async verificarCierreFinancieroCompleto(negociacionId: string, valorTotal: number): Promise<boolean> {
    const fuentes = await this.obtenerFuentesPagoNegociacion(negociacionId)
    const total_para_cierre = fuentes.reduce(
      (sum, f) => sum + (f.capital_para_cierre ?? f.monto_aprobado),
      0
    )
    return total_para_cierre >= valorTotal
  }
}

export const fuentesPagoService = new FuentesPagoService()
