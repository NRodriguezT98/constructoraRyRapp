import { NextRequest, NextResponse } from 'next/server'

import { createRouteClient } from '@/lib/supabase/server-route'
import { formatDateForDB } from '@/lib/utils/date.utils'

/**
 * API Route: POST /api/abonos/registrar
 * Registra un nuevo abono para una fuente de pago específica
 */
export async function POST(request: NextRequest) {
  try {
    // Crear cliente con contexto de autenticación (dentro del try para capturar errores de sesión)
    const supabase = await createRouteClient()

    const body = await request.json()
    const {
      negociacion_id,
      fuente_pago_id,
      monto,
      fecha_abono,
      metodo_pago,
      numero_referencia,
      notas,
      comprobante_path,
      mora_incluida,
    } = body

    // mora_incluida: porción del monto que corresponde a mora (no se descuenta del saldo)
    const moraIncluida = typeof mora_incluida === 'number' && mora_incluida > 0 ? mora_incluida : 0

    // Validaciones
    if (!negociacion_id || !fuente_pago_id || !monto || !fecha_abono || !metodo_pago) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    if (!comprobante_path || typeof comprobante_path !== 'string') {
      return NextResponse.json(
        { error: 'El comprobante de pago es obligatorio' },
        { status: 400 }
      )
    }

    if (monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a cero' },
        { status: 400 }
      )
    }

    // 1. Verificar que la fuente de pago existe y tiene saldo disponible
    const { data: fuente, error: fuenteError } = await supabase
      .from('fuentes_pago')
      .select('id, monto_aprobado, monto_recibido, saldo_pendiente, negociacion_id')
      .eq('id', fuente_pago_id)
      .single()

    if (fuenteError || !fuente) {
      return NextResponse.json(
        { error: 'Fuente de pago no encontrada' },
        { status: 404 }
      )
    }

    if (fuente.negociacion_id !== negociacion_id) {
      return NextResponse.json(
        { error: 'La fuente de pago no pertenece a esta negociación' },
        { status: 400 }
      )
    }

    const saldoDisponible = fuente.saldo_pendiente || 0
    const montoSinMora = monto - moraIncluida
    if (montoSinMora > saldoDisponible) {
      return NextResponse.json(
        { error: `El monto principal ($${montoSinMora}) excede el saldo disponible ($${saldoDisponible})` },
        { status: 400 }
      )
    }

    // 1b. Validar que la fecha_abono no es anterior a fecha_negociacion en BD
    const { data: negociacion, error: negError } = await supabase
      .from('negociaciones')
      .select('fecha_negociacion')
      .eq('id', negociacion_id)
      .single()

    if (!negError && negociacion?.fecha_negociacion) {
      const fechaNeg = negociacion.fecha_negociacion.slice(0, 10)  // YYYY-MM-DD
      if (fecha_abono < fechaNeg) {
        return NextResponse.json(
          { error: `La fecha del abono no puede ser anterior al inicio de la negociación (${fechaNeg})` },
          { status: 400 }
        )
      }
    }

    // 2. Convertir fecha usando utilidad centralizada
    const fechaAbonoDB = formatDateForDB(fecha_abono)

    // 3. Registrar el abono (numero_recibo se asigna automáticamente por secuencia BD)
    const { data: nuevoAbono, error: abonoError } = await supabase
      .from('abonos_historial' as any)
      .insert({
        negociacion_id,
        fuente_pago_id,
        monto,
        mora_incluida: moraIncluida > 0 ? moraIncluida : undefined,
        fecha_abono: fechaAbonoDB,
        metodo_pago,
        numero_referencia: numero_referencia || null,
        comprobante_url: comprobante_path,
        notas: notas || null,
      })
      .select()
      .single() as { data: any; error: any }

    if (abonoError) {
      console.error('Error insertando abono:', abonoError)
      return NextResponse.json(
        { error: 'Error al registrar el abono: ' + abonoError.message },
        { status: 500 }
      )
    }

    // 4. Los triggers de la DB actualizarán automáticamente:
    // - fuentes_pago.monto_recibido
    // - fuentes_pago.saldo_pendiente
    // - negociaciones.total_abonado
    // - negociaciones.saldo_pendiente
    // - negociaciones.porcentaje_pagado

    return NextResponse.json({
      success: true,
      abono: nuevoAbono,
      message: 'Abono registrado exitosamente',
    })
  } catch (error: any) {
    console.error('❌ Error en POST /api/abonos/registrar:', error?.message ?? error)
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
