/**
 * Service: Cuotas de Crédito
 *
 * Las cuotas son un CALENDARIO DE REFERENCIA (solo lectura desde el frontend).
 * No hay estado por cuota: el estado se calcula dinámicamente desde los abonos
 * reales via vista_estado_periodos_credito.
 */

import { supabase } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/database.types'

import type {
  CuotaCalculo,
  CuotaCalendario,
  PeriodoCredito,
  ResumenCuotas,
} from '../types'
import { fechaCuotaParaBD } from '../utils/calculos-credito'

// Alias deprecado para compatibilidad
export type { CuotaCalendario as CuotaCredito }

// ============================================================
// LEER PERÍODOS (vista calculada)
// ============================================================

/**
 * Lee el estado de cada período del crédito calculado desde los abonos reales.
 * Usa vista_estado_periodos_credito (calcula capital_aplicado, deficit, mora_sugerida).
 */
export async function getPeriodosCredito(
  fuentePagoId: string
): Promise<{ data: PeriodoCredito[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('vista_estado_periodos_credito')
    .select('*')
    .eq('fuente_pago_id', fuentePagoId)
    .order('numero_cuota', { ascending: true })

  return {
    data: data as PeriodoCredito[] | null,
    error: error ? new Error(error.message) : null,
  }
}

/**
 * @deprecated Usar getPeriodosCredito. Mantenido para compatibilidad temporal.
 */
export async function getCuotasVigentes(
  fuentePagoId: string
): Promise<{ data: PeriodoCredito[] | null; error: Error | null }> {
  return getPeriodosCredito(fuentePagoId)
}

// ============================================================
// RESUMEN
// ============================================================

export function calcularResumenCuotas(
  periodos: PeriodoCredito[]
): ResumenCuotas {
  return {
    total: periodos.length,
    cubiertos: periodos.filter(p => p.estado_periodo === 'Cubierto').length,
    atrasados: periodos.filter(p => p.estado_periodo === 'Atrasado').length,
    pendientes: periodos.filter(
      p => p.estado_periodo === 'En curso' || p.estado_periodo === 'Futuro'
    ).length,
    deficitTotal: periodos.reduce((s, p) => s + (p.deficit ?? 0), 0),
    moraTotal: periodos.reduce((s, p) => s + (p.mora_sugerida ?? 0), 0),
  }
}

// ============================================================
// CREAR CUOTAS (al configurar el crédito)
// ============================================================

export async function crearCuotasCredito(
  fuentePagoId: string,
  cuotas: CuotaCalculo[],
  versionPlan = 1
): Promise<{ error: Error | null }> {
  const rows = cuotas.map(c => ({
    fuente_pago_id: fuentePagoId,
    numero_cuota: c.numero,
    fecha_vencimiento: fechaCuotaParaBD(c.fechaVencimiento),
    valor_cuota: c.valorCuota,
    version_plan: versionPlan,
  }))

  const { error } = await supabase.from('cuotas_credito').insert(rows)
  return { error: error ? new Error(error.message) : null }
}

// ============================================================
// REESTRUCTURACIÓN
// ============================================================

// ============================================================
// REESTRUCTURACIÓN (RPC atómica)
// ============================================================

export interface PayloadReestructuracion {
  fuente_pago_id: string
  credito_id: string
  usuario_id: string | null
  capital_pendiente: number
  nueva_tasa_mensual: number
  nuevas_num_cuotas: number
  nuevo_monto_total: number
  nuevo_valor_cuota: number
  nuevo_interes_total: number
  nueva_version: number
  motivo: string
  notas: string | null
  cuotas: Array<{
    numero_cuota: number
    fecha_vencimiento: string
    valor_cuota: number
  }>
}

/**
 * Reestructuración atómica via RPC.
 *
 * La función SQL ejecuta en una única transacción:
 *   - Elimina cuotas del plan anterior
 *   - Actualiza creditos_constructora con nuevos términos
 *   - Actualiza fuentes_pago.monto_aprobado (sin tocar capital_para_cierre)
 *   - Inserta el nuevo calendario de cuotas
 *   - Registra audit_log con snapshot y motivo
 */
export async function reestructurarCredito(
  payload: PayloadReestructuracion
): Promise<{ error: Error | null }> {
  const { data, error } = await supabase.rpc('reestructurar_credito', {
    p_payload: payload as unknown as Json,
  })

  if (error) return { error: new Error(error.message) }

  const result = data as { success: boolean; error?: string } | null
  if (!result?.success) {
    return {
      error: new Error(
        result?.error ?? 'Error desconocido en reestructurar_credito'
      ),
    }
  }

  return { error: null }
}
