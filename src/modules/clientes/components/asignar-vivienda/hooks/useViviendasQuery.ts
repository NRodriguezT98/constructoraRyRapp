/**
 * Hook con React Query para cargar viviendas disponibles de un proyecto
 * ✅ Cache automático por proyecto
 * ✅ Invalidación cuando cambia proyecto
 * ✅ Búsqueda optimizada
 */

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'

import type { ViviendaDetalle } from '../types'

export function useViviendasQuery(proyectoId: string | undefined) {
  return useQuery({
    queryKey: ['viviendas', 'disponibles', proyectoId],
    queryFn: async () => {
      if (!proyectoId) return []

      const { data, error } = await supabase
        .from('viviendas')
        .select(`
          *,
          manzanas!inner (
            id,
            nombre,
            proyecto_id
          )
        `)
        .eq('manzanas.proyecto_id', proyectoId)
        .eq('estado', 'Disponible')
        .is('negociacion_id', null) // ⭐ CRÍTICO: Solo viviendas sin negociación activa
        .is('cliente_id', null)      // ⭐ Y sin cliente asignado

      if (error) throw error

      // Transformar para incluir manzana_nombre directamente
      const viviendasConManzana: ViviendaDetalle[] = (data || []).map((v: any) => ({
        ...v,
        manzana_nombre: v.manzanas?.nombre,
      }))

      // Ordenar primero por manzana (alfabéticamente) y luego por número (numéricamente)
      return viviendasConManzana.sort((a, b) => {
        // Primero comparar por nombre de manzana
        const manzanaA = (a.manzana_nombre || '').toLowerCase()
        const manzanaB = (b.manzana_nombre || '').toLowerCase()

        if (manzanaA < manzanaB) return -1
        if (manzanaA > manzanaB) return 1

        // Si las manzanas son iguales, ordenar por número (numéricamente)
        return a.numero - b.numero
      })
    },
    enabled: !!proyectoId, // Solo ejecutar si hay proyecto
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
