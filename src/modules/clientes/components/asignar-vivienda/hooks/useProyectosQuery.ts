/**
 * Hook con React Query para cargar proyectos
 * ✅ Cache automático
 * ✅ Revalidación inteligente
 * ✅ Estados de loading/error
 */

import { useQuery } from '@tanstack/react-query'

import { proyectosService } from '@/modules/proyectos/services/proyectos.service'

export function useProyectosQuery() {
  return useQuery({
    queryKey: ['proyectos', 'activos'],
    queryFn: async () => {
      const proyectos = await proyectosService.obtenerProyectos()
      return proyectos || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    refetchOnWindowFocus: false,
  })
}
