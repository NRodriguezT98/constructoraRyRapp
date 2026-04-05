/**
 * useEditarViviendaCalculos — Cálculos financieros derivados del formulario de edición
 * Sub-hook extraído de useEditarVivienda.ts
 */

import { useMemo } from 'react'

import type { ResumenFinanciero, Vivienda, ViviendaFormData } from '../types'
import { calcularValorTotal, detectarCambiosVivienda } from '../utils'

import type { NegociacionImpacto } from './useEditarVivienda'

export interface ImpactoFinanciero {
  negociacion: NegociacionImpacto
  valorBaseAnterior: number
  valorBaseNuevo: number
  diferencia: number
  bloqueado: boolean
  motivoBloqueo: string | null
}

interface UseEditarViviendaCalculosProps {
  vivienda: Vivienda | null
  formData: Partial<ViviendaFormData>
  esEsquinera: boolean
  valorBase: number
  recargoEsquinera: number
  gastosNotariales: number
  proyectos: Array<{ id: string; nombre: string }>
  manzanas: Array<{ id: string; nombre: string }>
  negociacionActiva: NegociacionImpacto | null
  esViviendaAsignada: boolean
}

export function useEditarViviendaCalculos({
  vivienda,
  formData,
  esEsquinera,
  valorBase,
  recargoEsquinera,
  gastosNotariales,
  proyectos,
  manzanas,
  negociacionActiva,
  esViviendaAsignada,
}: UseEditarViviendaCalculosProps) {
  const resumenFinanciero: ResumenFinanciero = useMemo(() => {
    const recargoFinal = esEsquinera ? recargoEsquinera || 0 : 0
    const valorTotal = calcularValorTotal(
      valorBase || 0,
      gastosNotariales,
      recargoFinal
    )
    return {
      valor_base: valorBase || 0,
      gastos_notariales: gastosNotariales,
      recargo_esquinera: recargoFinal,
      valor_total: valorTotal,
    }
  }, [valorBase, esEsquinera, recargoEsquinera, gastosNotariales])

  const previewData = useMemo(() => {
    const proyecto = proyectos.find(p => p.id === formData.proyecto_id)
    const manzana = manzanas.find(m => m.id === formData.manzana_id)
    return {
      ...formData,
      proyecto_nombre: proyecto?.nombre || '',
      manzana_nombre: manzana?.nombre || '',
      ...resumenFinanciero,
    }
  }, [formData, proyectos, manzanas, resumenFinanciero])

  const cambiosDetectados = useMemo(() => {
    if (!vivienda) return []
    return detectarCambiosVivienda({
      viviendaActual: vivienda,
      formData: formData as unknown as Vivienda,
    })
  }, [vivienda, formData])

  const impactoFinanciero = useMemo((): ImpactoFinanciero | null => {
    if (!vivienda || !negociacionActiva || !esViviendaAsignada) return null

    const valorBaseAnterior = vivienda.valor_base ?? 0
    const valorBaseNuevo = formData.valor_base ?? 0

    if (valorBaseAnterior === valorBaseNuevo) return null

    const diferencia = valorBaseNuevo - valorBaseAnterior
    const totalAbonado = negociacionActiva.total_abonado ?? 0
    const bloqueado = valorBaseNuevo < totalAbonado
    const motivoBloqueo = bloqueado
      ? `El nuevo valor ($${valorBaseNuevo.toLocaleString('es-CO')}) es menor al total ya abonado ($${totalAbonado.toLocaleString('es-CO')})`
      : null

    return {
      negociacion: negociacionActiva,
      valorBaseAnterior,
      valorBaseNuevo,
      diferencia,
      bloqueado,
      motivoBloqueo,
    }
  }, [vivienda, negociacionActiva, esViviendaAsignada, formData.valor_base])

  const manzanaSeleccionada = useMemo(() => {
    if (!formData.manzana_id) return null
    return manzanas.find(m => m.id === formData.manzana_id)
  }, [formData.manzana_id, manzanas])

  return {
    resumenFinanciero,
    previewData,
    cambiosDetectados,
    impactoFinanciero,
    manzanaSeleccionada,
  }
}
