import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

const METODOS_VALIDOS = [
  'Transferencia',
  'Efectivo',
  'Cheque',
  'Consignación',
  'PSE',
  'Tarjeta de Crédito',
  'Tarjeta de Débito',
]

/**
 * PATCH /api/abonos/editar
 *
 * Edita campos de un abono existente.
 * Seguridad:
 *  1. Requiere sesión autenticada.
 *  2. Solo rol 'Administrador'.
 *  3. La negociación debe estar en estado 'Activa'.
 *  4. Valida que el nuevo monto no exceda el saldo disponible.
 *  5. Maneja reemplazo/eliminación de comprobante (best-effort).
 *  6. Los triggers de BD recalculan montos en fuentes_pago y negociaciones.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createRouteClient()

  // 1. Autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Verificar rol Administrador
  const { data: usuarioPerfil, error: perfilError } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfilError || usuarioPerfil?.rol !== 'Administrador') {
    return NextResponse.json(
      { error: 'Acceso denegado. Solo administradores pueden editar abonos.' },
      { status: 403 }
    )
  }

  // 3. Leer body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { abonoId, motivo } = body

  if (!abonoId || typeof abonoId !== 'string') {
    return NextResponse.json({ error: 'Falta abonoId' }, { status: 400 })
  }

  if (!motivo || typeof motivo !== 'string' || motivo.trim().length < 5) {
    return NextResponse.json(
      { error: 'Motivo de cambio requerido (mínimo 5 caracteres)' },
      { status: 400 }
    )
  }

  // 4. Obtener abono actual
  const { data: abono, error: fetchError } = await supabase
    .from('abonos_historial')
    .select(
      'id, negociacion_id, fuente_pago_id, monto, fecha_abono, metodo_pago, numero_referencia, notas, comprobante_url'
    )
    .eq('id', abonoId)
    .maybeSingle()

  if (fetchError || !abono) {
    return NextResponse.json({ error: 'Abono no encontrado' }, { status: 404 })
  }

  // 5. Verificar que la negociación esté activa
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
        error: `No se puede editar un abono de una negociación en estado "${negociacion.estado}"`,
      },
      { status: 400 }
    )
  }

  // 6. Validar monto (si cambia)
  if (body.monto !== undefined) {
    const nuevoMonto = Number(body.monto)
    if (isNaN(nuevoMonto) || nuevoMonto <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }

    const { data: fuente } = await supabase
      .from('fuentes_pago')
      .select('saldo_pendiente')
      .eq('id', abono.fuente_pago_id)
      .single()

    if (fuente) {
      // Saldo disponible = saldo actual + el monto del abono actual (que se liberará al actualizar)
      const saldoDisponible = (fuente.saldo_pendiente ?? 0) + (abono.monto ?? 0)
      if (nuevoMonto > saldoDisponible) {
        return NextResponse.json(
          {
            error: `El monto excede el saldo disponible de la fuente ($${saldoDisponible.toLocaleString('es-CO')})`,
          },
          { status: 400 }
        )
      }
    }
  }

  // 7. Validar metodo_pago (si cambia)
  if (body.metodo_pago !== undefined && body.metodo_pago !== null) {
    if (
      typeof body.metodo_pago !== 'string' ||
      !METODOS_VALIDOS.includes(body.metodo_pago)
    ) {
      return NextResponse.json(
        { error: 'Método de pago inválido' },
        { status: 400 }
      )
    }
  }

  // 8. Manejar comprobante en Storage
  let comprobanteActualizado: string | null | undefined = undefined // undefined = no se toca

  if (body.eliminar_comprobante === true) {
    if (abono.comprobante_url && supabaseAdmin) {
      await supabaseAdmin.storage
        .from('comprobantes-abonos')
        .remove([abono.comprobante_url as string])
        .catch(() => {}) // best-effort
    }
    comprobanteActualizado = null
  } else if (
    body.comprobante_url !== undefined &&
    body.comprobante_url !== abono.comprobante_url
  ) {
    // Nuevo comprobante: eliminar el anterior (best-effort)
    if (abono.comprobante_url && supabaseAdmin) {
      await supabaseAdmin.storage
        .from('comprobantes-abonos')
        .remove([abono.comprobante_url as string])
        .catch(() => {})
    }
    comprobanteActualizado =
      typeof body.comprobante_url === 'string' ? body.comprobante_url : null
  }

  // 9. Construir objeto de actualización (solo campos que cambian)
  const actualizacion: Record<string, unknown> = {}

  if (body.monto !== undefined) actualizacion.monto = Number(body.monto)
  if (body.fecha_abono !== undefined)
    actualizacion.fecha_abono = String(body.fecha_abono)
  if (body.metodo_pago !== undefined)
    actualizacion.metodo_pago = body.metodo_pago
  if (body.numero_referencia !== undefined)
    actualizacion.numero_referencia = body.numero_referencia || null
  if (body.notas !== undefined) actualizacion.notas = body.notas || null
  if (comprobanteActualizado !== undefined)
    actualizacion.comprobante_url = comprobanteActualizado

  if (Object.keys(actualizacion).length === 0) {
    return NextResponse.json(
      { error: 'No hay cambios para guardar' },
      { status: 400 }
    )
  }

  // 10. Ejecutar UPDATE
  const { data: abonoActualizado, error: updateError } = await supabase
    .from('abonos_historial')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(actualizacion as any)
    .eq('id', abonoId)
    .select(
      'id, negociacion_id, fuente_pago_id, monto, fecha_abono, metodo_pago, numero_referencia, notas, comprobante_url'
    )
    .single()

  if (updateError) {
    return NextResponse.json(
      { error: 'Error al actualizar el abono: ' + updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, abono: abonoActualizado })
}
