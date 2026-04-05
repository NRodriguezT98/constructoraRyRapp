/**
 * Hook: useEntidadesFinancierasParaFuentes
 *
 * Hooks para obtener bancos y cajas en formularios de fuentes de pago.
 * Retorna todas las entidades activas por tipo — sin filtros adicionales.
 */

'use client'

import { useMemo } from 'react'

import type { TipoEntidadFinanciera } from '../types/entidades-financieras.types'

import { useEntidadesFinancierasActivas } from './useEntidadesFinancieras'

interface EntidadOption {
  value: string
  label: string
  codigo: string
}

/**
 * Retorna todos los bancos activos para el selector de Crédito Hipotecario.
 */
export function useBancos() {
  const {
    data: entidades,
    isLoading,
    isError,
  } = useEntidadesFinancierasActivas('Banco')

  const bancos = useMemo<EntidadOption[]>(() => {
    if (!entidades) return []
    return entidades.map(e => ({
      value: e.id,
      label: e.nombre,
      codigo: e.codigo,
    }))
  }, [entidades])

  return { bancos, isLoading, isError }
}

/**
 * Retorna todas las cajas de compensación activas para el selector de Subsidio.
 */
export function useCajas() {
  const {
    data: entidades,
    isLoading,
    isError,
  } = useEntidadesFinancierasActivas('Caja de Compensación')

  const cajas = useMemo<EntidadOption[]>(() => {
    if (!entidades) return []
    return entidades.map(e => ({
      value: e.id,
      label: e.nombre,
      codigo: e.codigo,
    }))
  }, [entidades])

  return { cajas, isLoading, isError }
}

/**
 * Obtener bancos + cajas combinados (para formularios generales).
 */
export function useEntidadesFinancierasCombinadas() {
  const { bancos, isLoading: loadingBancos, isError: errorBancos } = useBancos()
  const { cajas, isLoading: loadingCajas, isError: errorCajas } = useCajas()

  const entidades = useMemo<EntidadOption[]>(
    () => [...bancos, ...cajas],
    [bancos, cajas]
  )

  return {
    bancos,
    cajas,
    entidades,
    isLoading: loadingBancos || loadingCajas,
    isError: errorBancos || errorCajas,
  }
}

/**
 * Obtener entidades por tipo dinámicamente.
 */
export function useEntidadesPorTipo(tipo: TipoEntidadFinanciera) {
  const {
    data: entidades,
    isLoading,
    isError,
  } = useEntidadesFinancierasActivas(tipo)

  const opciones = useMemo<EntidadOption[]>(() => {
    if (!entidades) return []
    return entidades.map(e => ({
      value: e.id,
      label: e.nombre,
      codigo: e.codigo,
    }))
  }, [entidades])

  return { opciones, isLoading, isError }
}

/**
 * Helper: Obtener nombre de entidad por ID.
 */
export function useEntidadNombre(entidadId: string | null | undefined) {
  const { entidades } = useEntidadesFinancierasCombinadas()

  return useMemo(() => {
    if (!entidadId || !entidades.length) return null
    return entidades.find(e => e.value === entidadId)?.label ?? null
  }, [entidadId, entidades])
}
