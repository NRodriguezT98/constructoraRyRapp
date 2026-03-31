/**
 * Service: Cuotas de Crédito
 *
 * Las cuotas son un CALENDARIO DE REFERENCIA (solo lectura desde el frontend).
 * No hay estado por cuota: el estado se calcula dinámicamente desde los abonos
 * reales via vista_estado_periodos_credito.
 */

import { supabase } from '@/lib/supabase/client'

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

/**
 * Reestructura el crédito:
 * 1. Elimina cuotas del plan anterior
 * 2. Inserta el nuevo calendario
 *
 * Sincroniza monto_aprobado = deuda total (capital + intereses) y
 * capital_para_cierre = solo capital. Así saldo_pendiente refleja la deuda
 * real y el trigger de negociación capea al capital para el balance.
 */
export async function reestructurarCredito(
  fuentePagoId: string,
  nuevasCuotas: CuotaCalculo[],
  nuevoMontoTotal: number,
  nuevoCapital: number,
  nuevaVersion: number
): Promise<{ error: Error | null }> {
  const { error: e1 } = await supabase
    .from('cuotas_credito')
    .delete()
    .eq('fuente_pago_id', fuentePagoId)
    .lt('version_plan', nuevaVersion)

  if (e1)
    return { error: new Error(`Error eliminando plan anterior: ${e1.message}`) }

  // Sincronizar fuentes_pago con los nuevos parámetros del crédito:
  // - monto_aprobado = deuda total (capital + intereses) → saldo_pendiente real
  // - capital_para_cierre = capital puro → para balance de la negociación
  const { error: e2 } = await supabase
    .from('fuentes_pago')
    .update({
      monto_aprobado: nuevoMontoTotal,
      capital_para_cierre: nuevoCapital,
    })
    .eq('id', fuentePagoId)

  if (e2)
    return {
      error: new Error(`Error actualizando monto del crédito: ${e2.message}`),
    }

  return crearCuotasCredito(fuentePagoId, nuevasCuotas, nuevaVersion)
}
