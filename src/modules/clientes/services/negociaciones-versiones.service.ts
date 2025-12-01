/**
 * Servicio para gestión de versiones de negociaciones
 * Maneja historial de cambios, descuentos y modificaciones
 */

import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type NegociacionVersion = Database['public']['Tables']['negociaciones_versiones']['Row']
type DescuentoNegociacion = Database['public']['Tables']['descuentos_negociacion']['Row']

export interface FuentePagoSnapshot {
  id?: string
  tipo: string
  monto_aprobado: number
  entidad?: string | null
  estado?: string
}

export interface CrearVersionParams {
  negociacionId: string
  valorVivienda: number
  descuentoAplicado: number
  valorTotal: number
  fuentesPago: FuentePagoSnapshot[]
  motivoCambio: string
  tipoCambio: 'creacion_inicial' | 'modificacion_fuentes' | 'aplicacion_descuento' | 'ajuste_avaluo' | 'cambio_entidad' | 'otro'
}

export interface VersionConDescuentos extends NegociacionVersion {
  descuentos?: DescuentoNegociacion[]
  usuario?: {
    nombres: string
    apellidos: string
    email: string
  }
}

export class NegociacionesVersionesService {
  /**
   * Obtener historial completo de versiones de una negociación
   */
  static async obtenerHistorial(negociacionId: string): Promise<VersionConDescuentos[]> {
    const { data, error } = await supabase
      .from('negociaciones_versiones')
      .select(`
        *,
        descuentos:descuentos_negociacion(*)
      `)
      .eq('negociacion_id', negociacionId)
      .order('version', { ascending: false })
      .limit(50) // ✅ Limitar a últimas 50 versiones (performance)

    if (error) throw error
    return data as VersionConDescuentos[]
  }

  /**
   * Obtener versión activa actual
   */
  static async obtenerVersionActual(negociacionId: string): Promise<VersionConDescuentos | null> {
    const { data, error } = await supabase
      .from('negociaciones_versiones')
      .select(`
        *,
        descuentos:descuentos_negociacion(*)
      `)
      .eq('negociacion_id', negociacionId)
      .eq('es_version_activa', true)
      .maybeSingle()

    if (error) throw error
    return data as VersionConDescuentos | null
  }

  /**
   * Crear nueva versión (Admin only)
   * Usa la función de PostgreSQL que valida permisos
   */
  static async crearNuevaVersion(params: CrearVersionParams): Promise<string> {
    const { data, error } = await supabase.rpc('crear_nueva_version_negociacion', {
      p_negociacion_id: params.negociacionId,
      p_valor_vivienda: params.valorVivienda,
      p_descuento_aplicado: params.descuentoAplicado,
      p_valor_total: params.valorTotal,
      p_fuentes_pago: params.fuentesPago as any,
      p_motivo_cambio: params.motivoCambio,
      p_tipo_cambio: params.tipoCambio,
    })

    if (error) {
      console.error('Error al crear versión:', error)
      throw new Error(error.message || 'Error al crear nueva versión')
    }

    return data // UUID de la nueva versión
  }

  /**
   * Comparar dos versiones
   */
  static async compararVersiones(
    negociacionId: string,
    versionA: number,
    versionB: number
  ): Promise<{
    versionA: VersionConDescuentos
    versionB: VersionConDescuentos
    diferencias: {
      valorVivienda?: { anterior: number; nuevo: number }
      descuentoAplicado?: { anterior: number; nuevo: number }
      valorTotal?: { anterior: number; nuevo: number }
      fuentesPago?: { cambios: string[] }
    }
  }> {
    // Obtener ambas versiones
    const { data: versiones, error } = await supabase
      .from('negociaciones_versiones')
      .select(`
        *,
        descuentos:descuentos_negociacion(*)
      `)
      .eq('negociacion_id', negociacionId)
      .in('version', [versionA, versionB])

    if (error) throw error
    if (!versiones || versiones.length !== 2) {
      throw new Error('No se encontraron las versiones especificadas')
    }

    const vA = versiones.find((v) => v.version === versionA) as VersionConDescuentos
    const vB = versiones.find((v) => v.version === versionB) as VersionConDescuentos

    // Calcular diferencias
    const diferencias: any = {}

    if (vA.valor_vivienda !== vB.valor_vivienda) {
      diferencias.valorVivienda = {
        anterior: vA.valor_vivienda,
        nuevo: vB.valor_vivienda,
      }
    }

    if (vA.descuento_aplicado !== vB.descuento_aplicado) {
      diferencias.descuentoAplicado = {
        anterior: vA.descuento_aplicado,
        nuevo: vB.descuento_aplicado,
      }
    }

    if (vA.valor_total !== vB.valor_total) {
      diferencias.valorTotal = {
        anterior: vA.valor_total,
        nuevo: vB.valor_total,
      }
    }

    // Comparar fuentes de pago (simplificado)
    const fuentesA = (vA.fuentes_pago as FuentePagoSnapshot[]) || []
    const fuentesB = (vB.fuentes_pago as FuentePagoSnapshot[]) || []

    if (JSON.stringify(fuentesA) !== JSON.stringify(fuentesB)) {
      diferencias.fuentesPago = {
        cambios: [
          `Versión ${versionA}: ${fuentesA.length} fuente(s)`,
          `Versión ${versionB}: ${fuentesB.length} fuente(s)`,
        ],
      }
    }

    return {
      versionA: vA,
      versionB: vB,
      diferencias,
    }
  }

  /**
   * Registrar descuento en una versión específica
   */
  static async registrarDescuento(params: {
    versionId: string
    monto: number
    tipoDescuento: 'inicial' | 'temporal' | 'pre-escritura' | 'referido' | 'otro'
    motivo: string
  }): Promise<DescuentoNegociacion> {
    const { data, error } = await supabase
      .from('descuentos_negociacion')
      .insert({
        negociacion_version_id: params.versionId,
        monto: params.monto,
        tipo_descuento: params.tipoDescuento,
        motivo: params.motivo,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
