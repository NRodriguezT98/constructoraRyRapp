/**
 * Hook para consultar datos de una vivienda específica con React Query
 * Separación de responsabilidades: Solo lógica de data fetching
 */

import { useQuery } from '@tanstack/react-query'

import { viviendasService } from '@/modules/viviendas/services/viviendas.service'
import type { Vivienda } from '@/modules/viviendas/types'

export const viviendaKeys = {
  all: ['vivienda'] as const,
  details: () => [...viviendaKeys.all, 'detail'] as const,
  detail: (id: string) => [...viviendaKeys.details(), id] as const,
}

export function useViviendaQuery(viviendaId: string) {
  const {
    data: vivienda,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<Vivienda | null>({
    queryKey: viviendaKeys.detail(viviendaId),
    queryFn: async () => {
      if (!viviendaId) return null
      return await viviendasService.obtenerVivienda(viviendaId)
    },
    enabled: !!viviendaId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
  })

  return {
    vivienda: vivienda ?? null,
    loading,
    error,
    refetch,
  }
}
