/**
 * Hook con React Query para cargar proyectos
 * ✅ Cache automático
 * ✅ Revalidación inteligente
 * ✅ Estados de loading/error
 * ✅ Filtra solo proyectos con viviendas disponibles
 */

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'
import { proyectosService } from '@/modules/proyectos/services/proyectos.service'

/**
 * Cargar solo proyectos que tengan al menos 1 vivienda disponible.
 * Consulta las viviendas con estado 'Disponible' y sin asignar,
 * luego filtra los proyectos por IDs encontrados.
 */
export function useProyectosQuery() {
  return useQuery({
    queryKey: ['proyectos', 'con-viviendas-disponibles'],
    queryFn: async () => {
      // 1. Obtener IDs de proyectos que tienen viviendas disponibles
      //    viviendas → manzanas.proyecto_id (viviendas no tiene proyecto_id directo)
      const { data: viviendasDisponibles } = await supabase
        .from('viviendas')
        .select('manzana_id, manzanas!inner(proyecto_id)')
        .eq('estado', 'Disponible')
        .is('negociacion_id', null)
        .is('cliente_id', null)

      const idsConDisponibles = [
        ...new Set(
          (viviendasDisponibles ?? []).map(
            (v: any) => v.manzanas?.proyecto_id
          ).filter(Boolean)
        ),
      ]

      if (idsConDisponibles.length === 0) return []

      // 2. Obtener todos los proyectos activos
      const proyectos = await proyectosService.obtenerProyectos()

      // 3. Filtrar solo los que tienen viviendas disponibles
      return (proyectos || []).filter(p => idsConDisponibles.includes(p.id))
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (más fresco para asignación)
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
