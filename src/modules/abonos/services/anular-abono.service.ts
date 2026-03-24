// =====================================================
// SERVICIO: Anulación de Abonos
// Solo es llamable por el API Route (Admin Only)
// =====================================================

import type { AbonoHistorial, AnularAbonoPayload } from '../types';

/**
 * Anula un abono llamando al API Route PATCH /api/abonos/anular.
 * La validación de rol Admin se hace en el servidor.
 *
 * @returns El abono actualizado con estado = 'Anulado'
 */
export async function anularAbono(
  payload: AnularAbonoPayload,
): Promise<{ data: AbonoHistorial | null; error: string | null }> {
  try {
    const response = await fetch('/api/abonos/anular', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: body?.error ?? `Error del servidor (${response.status})`,
      };
    }

    return { data: body.abono as AbonoHistorial, error: null };
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error de red desconocido';
    return { data: null, error: mensaje };
  }
}
