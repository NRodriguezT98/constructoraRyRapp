'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { logger } from '@/lib/utils/logger'

import {
  obtenerAbonosNegociacion,
  obtenerNegociacionExpediente,
  obtenerRenunciaPorConsecutivo,
  obtenerViviendaExpediente,
} from '../services/renuncias.service'
import type {
  AbonoExpediente,
  ExpedienteData,
  FuenteExpediente,
  RenunciaConInfo,
  ResumenFinanciero,
  TimelineHito,
  ViviendaDetalle,
} from '../types'
import { transformarRenunciaRow } from '../utils/renuncias.utils'

type NegociacionExpediente = Awaited<
  ReturnType<typeof obtenerNegociacionExpediente>
>

interface UseExpedienteRenunciaReturn {
  datos: ExpedienteData | null
  cargando: boolean
  error: string | null
  recargar: () => void
}

export function useExpedienteRenuncia(
  consecutivo: string
): UseExpedienteRenunciaReturn {
  const [renuncia, setRenuncia] = useState<RenunciaConInfo | null>(null)
  const [abonos, setAbonos] = useState<AbonoExpediente[]>([])
  const [negociacion, setNegociacion] = useState<NegociacionExpediente>(null)
  const [viviendaDetalle, setViviendaDetalle] =
    useState<ViviendaDetalle | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError(null)

    try {
      // 1. Renuncia completa
      const row = await obtenerRenunciaPorConsecutivo(consecutivo)
      const renunciaInfo = transformarRenunciaRow(row)
      setRenuncia(renunciaInfo)

      // 2. Abonos + negociación + vivienda en paralelo
      const negId = row.negociacion_id
      const vivId = row.vivienda_id
      const promises: Promise<unknown>[] = [obtenerViviendaExpediente(vivId)]
      if (negId) {
        promises.push(
          obtenerAbonosNegociacion(negId),
          obtenerNegociacionExpediente(negId)
        )
      }
      const results = await Promise.all(promises)
      setViviendaDetalle((results[0] ?? null) as ViviendaDetalle | null)
      if (negId) {
        setAbonos((results[1] ?? []) as AbonoExpediente[])
        setNegociacion((results[2] ?? null) as NegociacionExpediente)
      }
    } catch (err: unknown) {
      logger.error('Error cargando expediente:', err)
      setError(
        err instanceof Error ? err.message : 'Error al cargar expediente'
      )
    } finally {
      setCargando(false)
    }
  }, [consecutivo])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // ==========================================
  // DATOS DERIVADOS
  // ==========================================

  const timeline = useMemo((): TimelineHito[] => {
    if (!renuncia) return []

    const hitos: TimelineHito[] = []

    // Inicio de negociación
    const fechaInicio = negociacion?.fecha_negociacion
    if (fechaInicio) {
      hitos.push({
        label: 'Inicio de negociación',
        fecha: fechaInicio,
        icono: 'Handshake',
        completado: true,
      })
    }

    // Primer abono
    const abonosActivos = abonos.filter(a => a.estado === 'Activo')
    if (abonosActivos.length > 0) {
      hitos.push({
        label: 'Primer abono',
        fecha: abonosActivos[0].fecha_abono,
        icono: 'DollarSign',
        completado: true,
      })
    }

    // Último abono (si hay más de 1)
    if (abonosActivos.length > 1) {
      hitos.push({
        label: 'Último abono',
        fecha: abonosActivos[abonosActivos.length - 1].fecha_abono,
        icono: 'TrendingUp',
        completado: true,
      })
    }

    // Solicitud de renuncia
    hitos.push({
      label: 'Solicitud de renuncia',
      fecha: renuncia.fecha_renuncia,
      icono: 'FileX',
      completado: true,
    })

    // Cierre
    if (renuncia.fecha_cierre) {
      hitos.push({
        label: 'Cierre de renuncia',
        fecha: renuncia.fecha_cierre,
        icono: 'CheckCircle',
        completado: true,
      })
    }

    // Devolución procesada
    if (renuncia.fecha_devolucion) {
      hitos.push({
        label: 'Devolución procesada',
        fecha: renuncia.fecha_devolucion,
        icono: 'Banknote',
        completado: true,
      })
    }

    return hitos.sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )
  }, [renuncia, abonos, negociacion])

  const fuentes = useMemo((): FuenteExpediente[] => {
    if (!renuncia?.abonos_snapshot) return []
    const snap = renuncia.abonos_snapshot
    if (Array.isArray(snap)) {
      const mapped = (snap as Partial<FuenteExpediente>[]).map(f => ({
        tipo: f.tipo ?? 'N/A',
        entidad: f.entidad ?? null,
        monto_aprobado: Number(f.monto_aprobado ?? 0),
        monto_recibido: Number(f.monto_recibido ?? 0),
        estado: f.estado ?? 'Inactiva',
        fecha_resolucion: f.fecha_resolucion ?? null,
        fecha_completado: f.fecha_completado ?? null,
      }))
      // Ordenar por prioridad estándar (tipos_fuentes_pago.orden)
      return mapped.sort(
        (a, b) => getFuenteOrden(a.tipo) - getFuenteOrden(b.tipo)
      )
    }
    return []
  }, [renuncia])

  const resumenFinanciero = useMemo((): ResumenFinanciero => {
    if (!renuncia) {
      return {
        valorNegociado: 0,
        totalAbonado: 0,
        saldoPendiente: 0,
        porcentajePagado: 0,
        descuento: null,
        retencion: null,
        montoADevolver: 0,
      }
    }

    const valorNegociado =
      renuncia.negociacion.valor_total_pagar ??
      renuncia.negociacion.valor_total ??
      0
    const totalAbonado = abonosActivos(abonos)
    const saldoPendiente = valorNegociado - totalAbonado
    const porcentajePagado =
      valorNegociado > 0 ? (totalAbonado / valorNegociado) * 100 : 0

    const descuento = negociacion?.descuento_aplicado
      ? {
          tipo: negociacion.tipo_descuento ?? 'N/A',
          porcentaje: negociacion.porcentaje_descuento ?? 0,
          monto: negociacion.descuento_aplicado,
          motivo: negociacion.motivo_descuento ?? '',
        }
      : null

    const retencion =
      renuncia.retencion_monto > 0
        ? {
            monto: renuncia.retencion_monto,
            motivo: renuncia.retencion_motivo ?? '',
          }
        : null

    return {
      valorNegociado,
      totalAbonado,
      saldoPendiente,
      porcentajePagado,
      descuento,
      retencion,
      montoADevolver: renuncia.monto_a_devolver,
    }
  }, [renuncia, abonos, negociacion])

  const duracionDias = useMemo(() => {
    if (!renuncia || !negociacion?.fecha_negociacion) return 0
    const inicio = new Date(negociacion.fecha_negociacion)
    const fin = new Date(renuncia.fecha_renuncia)
    return Math.max(
      0,
      Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
    )
  }, [renuncia, negociacion])

  const datos = useMemo((): ExpedienteData | null => {
    if (!renuncia) return null
    return {
      renuncia,
      abonos,
      negociacion: {
        fecha_negociacion: negociacion?.fecha_negociacion ?? null,
        valor_negociado: negociacion?.valor_negociado ?? null,
        descuento_aplicado: negociacion?.descuento_aplicado ?? null,
        tipo_descuento: negociacion?.tipo_descuento ?? null,
        porcentaje_descuento: negociacion?.porcentaje_descuento ?? null,
        motivo_descuento: negociacion?.motivo_descuento ?? null,
        promesa_compraventa_url: negociacion?.promesa_compraventa_url ?? null,
        promesa_firmada_url: negociacion?.promesa_firmada_url ?? null,
      },
      viviendaDetalle,
      timeline,
      resumenFinanciero,
      fuentes,
      duracionDias,
    }
  }, [
    renuncia,
    abonos,
    negociacion,
    viviendaDetalle,
    timeline,
    resumenFinanciero,
    fuentes,
    duracionDias,
  ])

  return { datos, cargando, error, recargar: cargarDatos }
}

// ==========================================
// HELPERS
// ==========================================

function abonosActivos(abonos: AbonoExpediente[]): number {
  return abonos
    .filter(a => a.estado === 'Activo')
    .reduce((sum, a) => sum + a.monto, 0)
}

/** Orden estándar de fuentes (coincide con tipos_fuentes_pago.orden) */
const FUENTE_ORDEN: Record<string, number> = {
  'Cuota Inicial': 1,
  'Crédito Hipotecario': 2,
  'Subsidio Mi Casa Ya': 3,
  'Subsidio Caja Compensación': 4,
  'Crédito con la Constructora': 5,
  // Alias comunes
  'Subsidio Comfandi': 4,
}

function getFuenteOrden(tipo: string): number {
  return FUENTE_ORDEN[tipo] ?? 99
}
