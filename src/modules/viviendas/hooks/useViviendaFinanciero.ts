/**
 * useViviendaFinanciero — Sub-hook para cálculos financieros de una vivienda.
 *
 * Responsabilidades:
 * - Cargar gastos notariales y configuración de recargos desde el service
 * - Calcular el resumen financiero reactivo según valores del formulario
 */

import { useEffect, useMemo, useState } from 'react'

import { viviendasService } from '../services/viviendas.service'
import type { ConfiguracionRecargo, ResumenFinanciero } from '../types'
import { calcularValorTotal } from '../utils'

interface ViviendaFinancieroValues {
  valor_base: number
  es_esquinera: boolean
  recargo_esquinera: number
}

export function useViviendaFinanciero(formValues: ViviendaFinancieroValues) {
  const [gastosNotariales, setGastosNotariales] = useState(5_000_000)
  const [configuracionRecargos, setConfiguracionRecargos] = useState<
    ConfiguracionRecargo[]
  >([])

  useEffect(() => {
    async function cargar() {
      try {
        const [gastos, recargos] = await Promise.all([
          viviendasService.obtenerGastosNotariales(),
          viviendasService.obtenerConfiguracionRecargos(),
        ])
        setGastosNotariales(gastos)
        setConfiguracionRecargos(recargos)
      } catch {
        // Mantener defaults si falla la carga
      }
    }
    cargar()
  }, [])

  const resumenFinanciero = useMemo((): ResumenFinanciero => {
    const valorBase = Number(formValues.valor_base) || 0
    const recargoEsquinera = formValues.es_esquinera
      ? Number(formValues.recargo_esquinera) || 0
      : 0
    const valorTotal = calcularValorTotal(
      valorBase,
      gastosNotariales,
      recargoEsquinera
    )
    return {
      valor_base: valorBase,
      gastos_notariales: gastosNotariales,
      recargo_esquinera: recargoEsquinera,
      valor_total: valorTotal,
    }
  }, [
    formValues.valor_base,
    formValues.es_esquinera,
    formValues.recargo_esquinera,
    gastosNotariales,
  ])

  return { gastosNotariales, configuracionRecargos, resumenFinanciero }
}
