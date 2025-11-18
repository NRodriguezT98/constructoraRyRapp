/**
 * Hook para consultar datos de una vivienda específica con React Query
 * Separación de responsabilidades: Solo lógica de data fetching
 */

import { viviendasService } from '@/modules/viviendas/services/viviendas.service'
import type { Vivienda } from '@/modules/viviendas/types'
import { useQuery } from '@tanstack/react-query'

export function useViviendaQuery(viviendaId: string) {
  const {
    data: vivienda,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<Vivienda | null>({
    queryKey: ['vivienda', viviendaId],
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
