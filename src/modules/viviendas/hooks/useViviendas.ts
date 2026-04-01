import { useCallback } from 'react'

import type { Tables } from '@/lib/supabase/database.types'

import type { FiltrosViviendas, ViviendaFormData } from '../types'

import { useActualizarViviendaMutation, useCrearViviendaMutation, useEliminarViviendaMutation, useViviendasQuery } from './useViviendasQuery'

type Vivienda = Tables<'viviendas'>

interface UseViviendasReturn {
  viviendas: Vivienda[]
  cargando: boolean
  error: string | null
  refrescar: () => Promise<void>
  crearVivienda: (data: ViviendaFormData) => Promise<void>
  actualizarVivienda: (id: string, data: Partial<ViviendaFormData>) => Promise<void>
  eliminarVivienda: (id: string) => Promise<void>
}

/**
 * Hook para gestión de viviendas
 * Refactorizado con React Query
 */
export function useViviendas(filtros?: FiltrosViviendas): UseViviendasReturn {
  const { data: viviendasRaw = [], isLoading: cargando, error, refetch } = useViviendasQuery(filtros || undefined)
  const viviendas = viviendasRaw as unknown as Vivienda[]
  const crearMutation = useCrearViviendaMutation()
  const actualizarMutation = useActualizarViviendaMutation()
  const eliminarMutation = useEliminarViviendaMutation()

  const refrescar = useCallback(async () => {
    await refetch()
  }, [refetch])

  const crearVivienda = useCallback(async (data: ViviendaFormData) => {
    await crearMutation.mutateAsync(data)
  }, [crearMutation])

  const actualizarVivienda = useCallback(async (id: string, data: Partial<ViviendaFormData>) => {
    await actualizarMutation.mutateAsync({ id, data })
  }, [actualizarMutation])

  const eliminarVivienda = useCallback(async (id: string) => {
    await eliminarMutation.mutateAsync(id)
  }, [eliminarMutation])

  return {
    viviendas,
    cargando,
    error: error?.message || null,
    refrescar,
    crearVivienda,
    actualizarVivienda,
    eliminarVivienda,
  }
}
