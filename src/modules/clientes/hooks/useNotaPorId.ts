/**
 * Hook para obtener una nota individual por ID
 * Usa React Query para cache profesional y optimización
 */

import { useQuery } from '@tanstack/react-query'
import { notasHistorialService } from '../services/notas-historial.service'

/**
 * Hook para cargar una nota individual con React Query
 *
 * @param notaId - ID de la nota a cargar
 * @returns Query con datos de la nota
 *
 * Configuración profesional:
 * - staleTime: 5 minutos (datos considerados frescos)
 * - gcTime: 10 minutos (tiempo en cache después de no usarse)
 * - enabled: solo si hay notaId válido
 */
export function useNotaPorId(notaId: string | null | undefined) {
  return useQuery({
    queryKey: ['nota-historial', notaId],
    queryFn: async () => {
      if (!notaId) throw new Error('notaId requerido')
      return notasHistorialService.obtenerNotaPorId(notaId)
    },
    enabled: !!notaId, // Solo ejecutar si hay ID
    staleTime: 5 * 60 * 1000, // 5 minutos - datos frescos
    gcTime: 10 * 60 * 1000, // 10 minutos - mantener en cache
    retry: 1, // Reintentar solo 1 vez si falla
  })
}
