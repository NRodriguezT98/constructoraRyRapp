/**
 * Service: Cuotas de Crédito
 *
 * CRUD para cuotas_credito + consultas a vista_cuotas_vigentes.
 *
 * IMPORTANTE:
 * - Para LEER cuotas del plan vigente: usar vista_cuotas_vigentes (filtra versión automáticamente)
 * - Para LEER historial completo (todas las versiones): usar cuotas_credito directamente
 * - La mora sugerida se calcula en frontend con calcularMoraSugerida() usando tasa_mora_diaria de BD
 * - La reestructuración archiva cuotas pendientes y crea nuevas con version_plan + 1
 */

import { supabase } from '@/lib/supabase/client';

import type { CuotaCalculo, CuotaCredito, CuotaVigente, ResumenCuotas } from '../types';
import { fechaCuotaParaBD } from '../utils/calculos-credito';

// ============================================================
// OBTENER CUOTAS VIGENTES (para mostrar al usuario)
// ============================================================

/**
 * Obtiene las cuotas del plan vigente via vista_cuotas_vigentes.
 *
 * Incluye: estado_efectivo (con 'Vencida' automático), esta_vencida, dias_mora.
 * NO incluye cuotas de versiones anteriores reestructuradas.
 */
export async function getCuotasVigentes(
  fuentePagoId: string
): Promise<{ data: CuotaVigente[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('vista_cuotas_vigentes')
    .select('*')
    .eq('fuente_pago_id', fuentePagoId)
    .order('numero_cuota', { ascending: true })

  return {
    data: data as CuotaVigente[] | null,
    error: error ? new Error(error.message) : null,
  }
}

/**
 * Obtiene el historial completo de todas las versiones (para auditoría).
 */
export async function getCuotasHistorial(
  fuentePagoId: string
): Promise<{ data: CuotaCredito[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('cuotas_credito')
    .select('*')
    .eq('fuente_pago_id', fuentePagoId)
    .order('version_plan', { ascending: true })
    .order('numero_cuota', { ascending: true })

  return {
    data: data as CuotaCredito[] | null,
    error: error ? new Error(error.message) : null,
  }
}

/**
 * Calcula resumen de cuotas vigentes.
 */
export function calcularResumenCuotas(cuotas: CuotaVigente[]): ResumenCuotas {
  return {
    total: cuotas.length,
    pendientes: cuotas.filter(c => c.estado_efectivo === 'Pendiente').length,
    pagadas: cuotas.filter(c => c.estado === 'Pagada').length,
    vencidas: cuotas.filter(c => c.esta_vencida).length,
    reestructuradas: cuotas.filter(c => c.estado === 'Reestructurada').length,
    montoPendiente: cuotas
      .filter(c => c.estado_efectivo !== 'Pagada')
      .reduce((sum, c) => sum + c.valor_cuota, 0),
    moraAcumulada: cuotas.reduce((sum, c) => sum + c.mora_aplicada, 0),
  }
}

// ============================================================
// CREAR CUOTAS (al configurar el crédito)
// ============================================================

/**
 * Crea el lote inicial de cuotas de amortización.
 * Se llama una vez al guardar la fuente de tipo crédito.
 */
export async function crearCuotasCredito(
  fuentePagoId: string,
  cuotas: CuotaCalculo[],
  versionPlan: number = 1
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
// ACCIONES SOBRE CUOTAS INDIVIDUALES
// ============================================================

/**
 * Aplica mora a una cuota vencida (admin only).
 * El valor de mora es decidido por el admin — el frontend solo SUGIERE un cálculo.
 */
export async function aplicarMoraCuota(
  cuotaId: string,
  moraAplicada: number,
  notas?: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('cuotas_credito')
    .update({
      mora_aplicada: moraAplicada,
      ...(notas !== undefined ? { notas } : {}),
    })
    .eq('id', cuotaId)

  return { error: error ? new Error(error.message) : null }
}

/**
 * Marca una cuota como pagada.
 */
export async function marcarCuotaPagada(
  cuotaId: string,
  fechaPago: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('cuotas_credito')
    .update({ estado: 'Pagada', fecha_pago: fechaPago })
    .eq('id', cuotaId)

  return { error: error ? new Error(error.message) : null }
}

// ============================================================
// REESTRUCTURACIÓN (Fix 5: actualiza monto_aprobado atomicamente)
// ============================================================

/**
 * Reestructura el crédito:
 * 1. Marca cuotas Pendientes del plan vigente como 'Reestructurada'
 * 2. Actualiza monto_aprobado y capital_para_cierre en fuentes_pago
 * 3. Crea las nuevas cuotas con version_plan + 1
 *
 * El trigger sync_version_credito actualizará creditos_constructora.version_actual automáticamente.
 *
 * ATÓMICO: si algún paso falla, la función retorna error y los pasos previos
 * ya ejecutados quedan en un estado inconsistente (Supabase no tiene transacciones
 * en el cliente). Para producción real, esto debería ser una función RPC en PostgreSQL.
 */
export async function reestructurarCredito(
  fuentePagoId: string,
  nuevasCuotas: CuotaCalculo[],
  nuevoMontoTotal: number,
  nuevoCapital: number,
  nuevaVersion: number
): Promise<{ error: Error | null }> {
  // Paso 1: Archivar cuotas pendientes del plan actual
  const { error: e1 } = await supabase
    .from('cuotas_credito')
    .update({ estado: 'Reestructurada' })
    .eq('fuente_pago_id', fuentePagoId)
    .eq('estado', 'Pendiente')

  if (e1) return { error: new Error(`Error archivando cuotas: ${e1.message}`) }

  // Paso 2: Actualizar monto_aprobado y capital_para_cierre en fuentes_pago
  // 🔴 Fix 5: sin este paso, el porcentaje de avance y el cierre financiero serían incorrectos
  const { error: e2 } = await supabase
    .from('fuentes_pago')
    .update({
      monto_aprobado: nuevoMontoTotal,
      capital_para_cierre: nuevoCapital,
    })
    .eq('id', fuentePagoId)

  if (e2) return { error: new Error(`Error actualizando montos: ${e2.message}`) }

  // Paso 3: Crear nuevas cuotas
  return crearCuotasCredito(fuentePagoId, nuevasCuotas, nuevaVersion)
}
