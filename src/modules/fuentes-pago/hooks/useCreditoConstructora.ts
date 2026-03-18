/**
 * Hook: useCreditoConstructora
 *
 * Gestiona el estado y las acciones del crédito con la constructora
 * dentro del detalle de una fuente de pago.
 *
 * Responsabilidades:
 * - Cargar cuotas vigentes y resumen
 * - Cargar datos del crédito (tasa_mora_diaria para calcular sugerencia)
 * - Aplicar mora a cuotas vencidas (admin only)
 * - Reestructurar el crédito (admin only)
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { crearCredito, getCreditoByFuente } from '../services/creditos-constructora.service'
import {
    aplicarMoraCuota,
    calcularResumenCuotas,
    crearCuotasCredito,
    getCuotasVigentes,
    reestructurarCredito
} from '../services/cuotas-credito.service'
import type { CreditoConstructora, CuotaVigente, ParametrosCredito, ParametrosReestructuracion, ResumenCuotas } from '../types'
import { calcularMoraSugerida, calcularTablaAmortizacion, fechaCuotaParaBD } from '../utils/calculos-credito'

interface UseCreditoConstructoraProps {
  fuentePagoId: string
}

interface UseCreditoConstructoraReturn {
  // Estado
  credito: CreditoConstructora | null
  cuotas: CuotaVigente[]
  resumen: ResumenCuotas | null
  cargando: boolean
  procesando: boolean
  error: string | null

  // Acciones
  recargar: () => Promise<void>
  aplicarMora: (cuotaId: string, mora: number, notas?: string) => Promise<boolean>
  reestructurar: (params: ParametrosReestructuracion) => Promise<boolean>
  /** Crea el plan inicial para fuentes sin creditos_constructora (clientes anteriores a la implementación) */
  crearPlan: (params: ParametrosCredito) => Promise<boolean>

  // Utilidad: calcula mora sugerida para una cuota (usa tasa_mora_diaria de BD)
  getMoraSugerida: (cuotaId: string) => number
}

export function useCreditoConstructora({
  fuentePagoId,
}: UseCreditoConstructoraProps): UseCreditoConstructoraReturn {
  const [credito, setCredito] = useState<CreditoConstructora | null>(null)
  const [cuotas, setCuotas] = useState<CuotaVigente[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resumen = useMemo(
    () => (cuotas.length > 0 ? calcularResumenCuotas(cuotas) : null),
    [cuotas]
  )

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)

      const [{ data: creditoData, error: e1 }, { data: cuotasData, error: e2 }] =
        await Promise.all([
          getCreditoByFuente(fuentePagoId),
          getCuotasVigentes(fuentePagoId),
        ])

      if (e1) throw e1
      if (e2) throw e2

      setCredito(creditoData)
      setCuotas(cuotasData ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error cargando datos del crédito')
    } finally {
      setCargando(false)
    }
  }, [fuentePagoId])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const aplicarMora = useCallback(
    async (cuotaId: string, mora: number, notas?: string): Promise<boolean> => {
      try {
        setProcesando(true)
        setError(null)
        const { error: e } = await aplicarMoraCuota(cuotaId, mora, notas)
        if (e) throw e
        await cargarDatos()
        return true
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error aplicando mora')
        return false
      } finally {
        setProcesando(false)
      }
    },
    [cargarDatos]
  )

  const reestructurar = useCallback(
    async (params: ParametrosReestructuracion): Promise<boolean> => {
      try {
        setProcesando(true)
        setError(null)

        if (!credito) throw new Error('No hay datos del crédito cargados')

        const parametros: ParametrosCredito = {
          capital: params.capitalPendiente,
          tasaMensual: params.nuevaTasaMensual,
          numCuotas: params.nuevasNumCuotas,
          fechaInicio: params.nuevaFechaInicio,
        }
        const calculo = calcularTablaAmortizacion(parametros)
        const nuevaVersion = credito.version_actual + 1

        const { error: e } = await reestructurarCredito(
          params.fuentePagoId,
          calculo.cuotas,
          calculo.montoTotal,
          params.capitalPendiente,
          nuevaVersion
        )
        if (e) throw e

        await cargarDatos()
        return true
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error reestructurando crédito')
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

        const fechaDate = params.fechaInicio instanceof Date
          ? params.fechaInicio
          : new Date(String(params.fechaInicio) + 'T12:00:00')

        const calculo = calcularTablaAmortizacion({ ...params, fechaInicio: fechaDate })

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

        const { error: eCuotas } = await crearCuotasCredito(fuentePagoId, calculo.cuotas, 1)
        if (eCuotas) throw eCuotas

        await cargarDatos()
        return true
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error creando plan de cuotas')
        return false
      } finally {
        setProcesando(false)
      }
    },
    [fuentePagoId, cargarDatos]
  )

  const getMoraSugerida = useCallback(
    (cuotaId: string): number => {
      if (!credito) return 0
      const cuota = cuotas.find(c => c.id === cuotaId)
      if (!cuota || !cuota.esta_vencida) return 0
      return calcularMoraSugerida(
        cuota.valor_cuota,
        new Date(cuota.fecha_vencimiento),
        credito.tasa_mora_diaria
      )
    },
    [credito, cuotas]
  )

  return {
    credito,
    cuotas,
    resumen,
    cargando,
    procesando,
    error,
    recargar: cargarDatos,
    aplicarMora,
    reestructurar,
    crearPlan,
    getMoraSugerida,
  }
}
