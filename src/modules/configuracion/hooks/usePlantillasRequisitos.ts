/**
 * ============================================
 * HOOK: Gestión de Plantillas de Requisitos
 * ============================================
 *
 * Hook con React Query para gestionar plantillas de requisitos
 * y su asignación a tipos de fuente de pago.
 *
 * @version 1.0.0 - 2025-12-12
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { PlantillasRequisitosService } from '../services/plantillas-requisitos.service'

// ============================================
// QUERY KEYS
// ============================================

export const PLANTILLAS_QUERY_KEYS = {
  all: ['plantillas-requisitos'] as const,
  list: () => [...PLANTILLAS_QUERY_KEYS.all, 'list'] as const,
  byTipo: (tipoFuente: string) => [...PLANTILLAS_QUERY_KEYS.all, 'tipo', tipoFuente] as const,
  configuradas: (tipoFuente: string) => [...PLANTILLAS_QUERY_KEYS.all, 'configuradas', tipoFuente] as const,
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook para obtener todas las plantillas disponibles
 */
export function usePlantillasRequisitos() {
  return useQuery({
    queryKey: PLANTILLAS_QUERY_KEYS.list(),
    queryFn: () => PlantillasRequisitosService.obtenerPlantillas(),
    staleTime: 5 * 60 * 1000, // 5 minutos (plantillas no cambian frecuentemente)
    gcTime: 30 * 60 * 1000, // 30 minutos
  })
}

/**
 * Hook para obtener requisitos configurados de un tipo de fuente
 */
export function useRequisitosPorTipo(tipoFuente: string | undefined) {
  return useQuery({
    queryKey: PLANTILLAS_QUERY_KEYS.byTipo(tipoFuente || ''),
    queryFn: () => PlantillasRequisitosService.obtenerRequisitosPorTipo(tipoFuente!),
    enabled: !!tipoFuente,
    staleTime: 30000, // 30 segundos
  })
}

/**
 * Hook para obtener IDs de plantillas configuradas
 */
export function usePlantillasConfiguradas(tipoFuente: string | undefined) {
  return useQuery({
    queryKey: PLANTILLAS_QUERY_KEYS.configuradas(tipoFuente || ''),
    queryFn: () => PlantillasRequisitosService.obtenerPlantillasConfiguradas(tipoFuente!),
    enabled: !!tipoFuente,
    staleTime: 30000,
  })
}

/**
 * Hook para configurar requisitos de un tipo de fuente
 */
export function useConfigurarRequisitos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tipoFuente,
      plantillasSeleccionadas,
    }: {
      tipoFuente: string
      plantillasSeleccionadas: string[]
    }) => PlantillasRequisitosService.configurarRequisitos(tipoFuente, plantillasSeleccionadas),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: PLANTILLAS_QUERY_KEYS.byTipo(variables.tipoFuente),
      })
      queryClient.invalidateQueries({
        queryKey: PLANTILLAS_QUERY_KEYS.configuradas(variables.tipoFuente),
      })
    },
  })
}
