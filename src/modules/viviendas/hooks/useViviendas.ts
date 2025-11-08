import { useCallback, useMemo } from 'react'

import type { Tables } from '@/lib/supabase/database.types'

import type { FiltrosViviendas } from '../types'

import { useViviendasQuery, useCrearViviendaMutation, useActualizarViviendaMutation, useEliminarViviendaMutation } from './useViviendasQuery'

type Vivienda = Tables<'viviendas'>

interface UseViviendasReturn {
  viviendas: Vivienda[]
  cargando: boolean
  error: string | null
  refrescar: () => Promise<void>
  crearVivienda: (data: any) => Promise<void>
  actualizarVivienda: (id: string, data: any) => Promise<void>
  eliminarVivienda: (id: string) => Promise<void>
}

/**
 * Hook para gestión de viviendas
 * Refactorizado con React Query
 */
export function useViviendas(filtros?: FiltrosViviendas): UseViviendasReturn {
  const { data: viviendas = [], isLoading: cargando, error, refetch } = useViviendasQuery(filtros || {})
  const crearMutation = useCrearViviendaMutation()
  const actualizarMutation = useActualizarViviendaMutation()
  const eliminarMutation = useEliminarViviendaMutation()

  const refrescar = useCallback(async () => {
    await refetch()
  }, [refetch])

  const crearVivienda = useCallback(async (data: any) => {
    await crearMutation.mutateAsync(data)
  }, [crearMutation])

  const actualizarVivienda = useCallback(async (id: string, data: any) => {
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
