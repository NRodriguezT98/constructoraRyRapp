/**
 * ============================================
 * SERVICE: Validación de Desembolsos
 * ============================================
 *
 * Verifica si una fuente de pago puede registrar desembolso.
 * Valida documentos obligatorios completados.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface ResultadoValidacion {
  puede_desembolsar: boolean
  razon: string
  pasos_faltantes: Array<{
    paso: string
    titulo: string
    descripcion: string
  }>
}

export class ValidacionDesembolsoService {

  /**
   * Verificar si puede registrar desembolso
   */
  async puedeRegistrarDesembolso(
    supabase: SupabaseClient,
    fuentePagoId: string
  ): Promise<ResultadoValidacion> {
    const { data, error } = await supabase.rpc('puede_registrar_desembolso', {
      p_fuente_pago_id: fuentePagoId,
    })

    if (error) {
      console.error('Error al verificar desembolso:', error)
      throw error
    }

    // La función RPC devuelve un array, tomar el primer elemento
    const resultado = data?.[0] || {
      puede_desembolsar: false,
      razon: 'Error al verificar',
      pasos_faltantes: [],
    }

    return {
      puede_desembolsar: resultado.puede_desembolsar,
      razon: resultado.razon,
      pasos_faltantes: resultado.pasos_faltantes || [],
    }
  }

  /**
   * Obtener estado de validación completo
   */
  async obtenerEstadoValidacion(
    supabase: SupabaseClient,
    fuentePagoId: string
  ) {
    const { data, error } = await supabase
      .from('vista_estado_validacion_fuentes')
      .select('*')
      .eq('fuente_pago_id', fuentePagoId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Crear documento pendiente para un paso
   */
  async crearDocumentoPendiente(
    supabase: SupabaseClient,
    pasoId: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('crear_pendiente_documento_paso', {
      p_paso_id: pasoId,
    })

    if (error) throw error
    return data
  }
}

export const validacionDesembolsoService = new ValidacionDesembolsoService()
