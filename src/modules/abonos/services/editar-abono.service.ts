import type {
  EditarAbonoPayload,
  EditarAbonoResponse,
} from '../types/editar-abono.types'

/**
 * Llama al endpoint PATCH /api/abonos/editar para actualizar un abono existente.
 */
export async function editarAbonoService(
  payload: EditarAbonoPayload
): Promise<EditarAbonoResponse> {
  try {
    const response = await fetch('/api/abonos/editar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        ok: false,
        error: data.error ?? 'Error desconocido al editar el abono',
      }
    }

    return { ok: true, abono: data.abono }
  } catch {
    return { ok: false, error: 'Error de conexión. Intenta de nuevo.' }
  }
}
