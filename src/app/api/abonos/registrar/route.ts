import { NextRequest, NextResponse } from 'next/server'

import { createRouteClient } from '@/lib/supabase/server-route'
import { formatDateForDB } from '@/lib/utils/date.utils'

/**
 * API Route: POST /api/abonos/registrar
 * Registra un nuevo abono para una fuente de pago específica
 */
export async function POST(request: NextRequest) {
  // Crear cliente con contexto de autenticación
  const supabase = await createRouteClient()

  try {
    const body = await request.json()
    const {
      negociacion_id,
      fuente_pago_id,
      monto,
      fecha_abono,
      metodo_pago,
      numero_referencia,
      notas,
    } = body

    // Validaciones
    if (!negociacion_id || !fuente_pago_id || !monto || !fecha_abono || !metodo_pago) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
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
    if (monto > saldoDisponible) {
      return NextResponse.json(
        { error: `El monto ($${monto}) excede el saldo disponible ($${saldoDisponible})` },
        { status: 400 }
      )
    }

    // 2. Generar consecutivo único para esta negociación
    // Formato: RYR-ABO-{año}-{mes}-{consecutivo}
    const fecha = new Date()
    const año = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')

    // Obtener el último consecutivo del mes actual para esta negociación
    const { data: ultimoAbono } = await supabase
      .from('abonos_historial' as any)
      .select('numero_referencia')
      .eq('negociacion_id', negociacion_id)
      .like('numero_referencia', `RYR-ABO-${año}-${mes}-%`)
      .order('fecha_creacion', { ascending: false })
      .limit(1)
      .single() as { data: { numero_referencia: string } | null }

    let numeroConsecutivo = 1
    if (ultimoAbono?.numero_referencia) {
      // Extraer el número del consecutivo anterior
      const match = ultimoAbono.numero_referencia.match(/RYR-ABO-\d{4}-\d{2}-(\d+)/)
      if (match) {
        numeroConsecutivo = parseInt(match[1]) + 1
      }
    }

    const consecutivo = `RYR-ABO-${año}-${mes}-${String(numeroConsecutivo).padStart(3, '0')}`

    // 3. Convertir fecha usando utilidad centralizada
    const fechaAbonoDB = formatDateForDB(fecha_abono)

    // 4. Registrar el abono con el consecutivo
    const { data: nuevoAbono, error: abonoError } = await supabase
      .from('abonos_historial' as any)
      .insert({
        negociacion_id,
        fuente_pago_id,
        monto,
        fecha_abono: fechaAbonoDB,
        metodo_pago,
        numero_referencia: consecutivo, // Consecutivo automático
        comprobante_url: null,
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

    console.log('✅ Abono registrado exitosamente:', {
      id: nuevoAbono.id,
      consecutivo,
      monto,
      fuente: fuente_pago_id,
    })

    return NextResponse.json({
      success: true,
      abono: nuevoAbono,
      consecutivo,
      message: 'Abono registrado exitosamente',
    })
  } catch (error: any) {
    console.error('❌ Error en POST /api/abonos/registrar:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
