import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

/**
 * DELETE /api/abonos/anular
 * Body: { abonoId: string }
 *
 * Anula (elimina) un abono del historial.
 * Seguridad:
 *  1. Requiere sesión autenticada.
 *  2. Verifica que la negociación esté en estado 'Activa'.
 *  3. Los triggers de BD revierten automáticamente los montos en
 *     fuentes_pago y negociaciones (AFTER DELETE).
 *  4. Elimina el comprobante del bucket (best-effort).
 */
export async function DELETE(request: NextRequest) {
  // 1. Verificar sesión
  const supabase = await createRouteClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Leer body
  let abonoId: string
  try {
    const body = await request.json()
    abonoId = body.abonoId
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!abonoId || typeof abonoId !== 'string') {
    return NextResponse.json({ error: 'Falta abonoId' }, { status: 400 })
  }

  // 3. Obtener el abono (verificar existencia y obtener datos necesarios)
  const { data: abono, error: fetchError } = await supabase
    .from('abonos_historial')
    .select('id, comprobante_url, negociacion_id, monto')
    .eq('id', abonoId)
    .maybeSingle()

  if (fetchError || !abono) {
    return NextResponse.json({ error: 'Abono no encontrado' }, { status: 404 })
  }

  // 4. Verificar que la negociación esté activa
  const { data: negociacion, error: negError } = await supabase
    .from('negociaciones')
    .select('estado')
    .eq('id', abono.negociacion_id)
    .single()

  if (negError || !negociacion) {
    return NextResponse.json(
      { error: 'Negociación no encontrada' },
      { status: 404 }
    )
  }

  if (negociacion.estado !== 'Activa') {
    return NextResponse.json(
      {
        error: `No se puede anular un abono de una negociación en estado "${negociacion.estado}"`,
      },
      { status: 400 }
    )
  }

  // 5. Eliminar el abono (los triggers AFTER DELETE de BD revertirán los montos)
  const { error: deleteError } = await supabase
    .from('abonos_historial')
    .delete()
    .eq('id', abonoId)

  if (deleteError) {
    return NextResponse.json(
      { error: 'Error al anular el abono: ' + deleteError.message },
      { status: 500 }
    )
  }

  // 6. Eliminar comprobante del storage (best-effort, no bloquea respuesta)
  if (abono.comprobante_url) {
    supabaseAdmin.storage
      .from('comprobantes-abonos')
      .remove([abono.comprobante_url])
      .catch(() => {
        /* best-effort: ignorar si falla el borrado del storage */
      })
  }

  return NextResponse.json({
    success: true,
    message: 'Abono anulado correctamente',
  })
}
