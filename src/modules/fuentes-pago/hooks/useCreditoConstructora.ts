/**
 * Hook: useCreditoConstructora
 *
 * Carga el crédito y su calendario de períodos (vista calculada).
 * No hay estado mutable por cuota — el estado se deriva de los abonos.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

import {
  crearCredito,
  getCreditoByFuente,
} from '../services/creditos-constructora.service'
import {
  calcularResumenCuotas,
  crearCuotasCredito,
  getPeriodosCredito,
  reestructurarCredito,
} from '../services/cuotas-credito.service'
import type {
  CreditoConstructora,
  ParametrosCredito,
  ParametrosReestructuracion,
  PeriodoCredito,
  ResumenCuotas,
} from '../types'
import {
  calcularTablaAmortizacion,
  fechaCuotaParaBD,
} from '../utils/calculos-credito'

interface UseCreditoConstructoraProps {
  fuentePagoId: string
}

interface UseCreditoConstructoraReturn {
  credito: CreditoConstructora | null
  periodos: PeriodoCredito[]
  resumen: ResumenCuotas | null
  cargando: boolean
  procesando: boolean
  error: string | null
  recargar: () => Promise<void>
  reestructurar: (params: ParametrosReestructuracion) => Promise<boolean>
  crearPlan: (params: ParametrosCredito) => Promise<boolean>
  /**
   * Saldo pendiente real: monto_aprobado − monto_recibido de fuentes_pago.
   * Cuando hay abonos pagados, es el valor correcto para reestructurar
   * (interés simple), mejor que el capital amortizado proporcionalmente.
   */
  saldoPendienteReal: number | null
}

export function useCreditoConstructora({
  fuentePagoId,
}: UseCreditoConstructoraProps): UseCreditoConstructoraReturn {
  const [credito, setCredito] = useState<CreditoConstructora | null>(null)
  const [periodos, setPeriodos] = useState<PeriodoCredito[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saldoPendienteReal, setSaldoPendienteReal] = useState<number | null>(
    null
  )

  const resumen = useMemo(
    () => (periodos.length > 0 ? calcularResumenCuotas(periodos) : null),
    [periodos]
  )

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const [
        { data: creditoData, error: e1 },
        { data: periodosData, error: e2 },
        { data: fuenteData },
      ] = await Promise.all([
        getCreditoByFuente(fuentePagoId),
        getPeriodosCredito(fuentePagoId),
        supabase
          .from('fuentes_pago')
          .select('monto_recibido')
          .eq('id', fuentePagoId)
          .maybeSingle(),
      ])
      if (e1) throw e1
      if (e2) throw e2
      setCredito(creditoData)
      setPeriodos(periodosData ?? [])
      // Saldo real = monto_total (capital + intereses) − lo ya recibido.
      // Se usa monto_total del crédito (interés simple) y NO monto_aprobado de
      // fuentes_pago (que solo contiene el capital).
      if (
        creditoData &&
        fuenteData &&
        typeof fuenteData.monto_recibido === 'number'
      ) {
        setSaldoPendienteReal(
          Math.max(0, creditoData.monto_total - fuenteData.monto_recibido)
        )
      } else {
        setSaldoPendienteReal(null)
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error cargando datos del crédito'
      )
    } finally {
      setCargando(false)
    }
  }, [fuentePagoId])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const reestructurar = useCallback(
    async (params: ParametrosReestructuracion): Promise<boolean> => {
      try {
        setProcesando(true)
        setError(null)
        if (!credito) throw new Error('No hay datos del crédito cargados')

        // Si se especifica nuevoCapital, se usa como base del nuevo plan (ej: descuento aplicado)
        const capitalEfectivo = params.nuevoCapital ?? params.capitalPendiente

        const calculo = calcularTablaAmortizacion({
          capital: capitalEfectivo,
          tasaMensual: params.nuevaTasaMensual,
          numCuotas: params.nuevasNumCuotas,
          fechaInicio: params.nuevaFechaInicio,
        })

        const {
          data: { user },
        } = await supabase.auth.getUser()
        const nuevaVersion = credito.version_actual + 1

        const { error: e } = await reestructurarCredito({
          fuente_pago_id: params.fuentePagoId,
          credito_id: params.creditoId,
          usuario_id: user?.id ?? null,
          capital_pendiente: capitalEfectivo,
          nueva_tasa_mensual: params.nuevaTasaMensual,
          nuevas_num_cuotas: params.nuevasNumCuotas,
          nuevo_monto_total: calculo.montoTotal,
          nuevo_valor_cuota: calculo.valorCuotaMensual,
          nuevo_interes_total: calculo.interesTotal,
          nueva_version: nuevaVersion,
          motivo: params.motivo ?? 'Reestructuración de crédito',
          notas: params.notas ?? null,
          cuotas: calculo.cuotas.map(c => ({
            numero_cuota: c.numero,
            fecha_vencimiento: fechaCuotaParaBD(c.fechaVencimiento),
            valor_cuota: c.valorCuota,
          })),
        })
        if (e) throw e
        await cargarDatos()
        return true
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Error reestructurando crédito'
        )
        return false
      } finally {
        setProcesando(false)
      }
    },
    [credito, cargarDatos]
  )

  const crearPlan = useCallback(
    async (params: ParametrosCredito): Promise<boolean> => {
      try {
        setProcesando(true)
        setError(null)
        const fechaDate =
          params.fechaInicio instanceof Date
            ? params.fechaInicio
            : new Date(String(params.fechaInicio) + 'T12:00:00')
        const calculo = calcularTablaAmortizacion({
          ...params,
          fechaInicio: fechaDate,
        })
        const { error: eCredito } = await crearCredito({
          fuente_pago_id: fuentePagoId,
          capital: params.capital,
          tasa_mensual: params.tasaMensual,
          num_cuotas: params.numCuotas,
          fecha_inicio: fechaCuotaParaBD(fechaDate),
          valor_cuota: calculo.valorCuotaMensual,
          interes_total: calculo.interesTotal,
          monto_total: calculo.montoTotal,
          tasa_mora_diaria: params.tasaMoraDiaria ?? 0.001,
        })
        if (eCredito) throw eCredito
        const { error: eCuotas } = await crearCuotasCredito(
          fuentePagoId,
          calculo.cuotas,
          1
        )
        if (eCuotas) throw eCuotas
        await cargarDatos()
        return true
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Error creando plan de cuotas'
        )
        return false
      } finally {
        setProcesando(false)
      }
    },
    [fuentePagoId, cargarDatos]
  )

  return {
    credito,
    periodos,
    resumen,
    cargando,
    procesando,
    error,
    recargar: cargarDatos,
    reestructurar,
    crearPlan,
    saldoPendienteReal,
  }
}
