/**
 * ============================================
 * REACT QUERY HOOKS: Viviendas
 * ============================================
 * Hooks para gestión de viviendas con React Query
 * SOLO datos del servidor - UI state en hooks separados
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { viviendasService } from '../services/viviendas.service'
import type { FiltrosViviendas, ViviendaFormData } from '../types'

// ============================================
// QUERY KEYS (Cache keys centralizadas)
// ============================================
export const viviendasKeys = {
  all: ['viviendas'] as const,
  lists: () => [...viviendasKeys.all, 'list'] as const,
  list: (filtros?: FiltrosViviendas) => [...viviendasKeys.lists(), filtros] as const,
  details: () => [...viviendasKeys.all, 'detail'] as const,
  detail: (id: string) => [...viviendasKeys.details(), id] as const,
  manzanaViviendas: (manzanaId: string) => [...viviendasKeys.all, 'manzana', manzanaId] as const,

  // Relacionados
  proyectos: ['viviendas', 'proyectos'] as const,
  manzanas: (proyectoId: string) => ['viviendas', 'manzanas', proyectoId] as const,
  siguienteNumero: (manzanaId: string) => ['viviendas', 'siguiente-numero', manzanaId] as const,
  numerosOcupados: (manzanaId: string) => ['viviendas', 'numeros-ocupados', manzanaId] as const,
  recargos: ['viviendas', 'recargos'] as const,
  gastosNotariales: ['viviendas', 'gastos-notariales'] as const,
}

// ============================================
// 1. QUERY: Lista de viviendas con filtros
// ============================================
export function useViviendasQuery(filtros?: FiltrosViviendas) {
  return useQuery({
    queryKey: viviendasKeys.list(filtros),
    queryFn: () => viviendasService.listar(filtros),
    staleTime: 0, // ✅ SIEMPRE re-fetch al montar para evitar "0 resultados" al navegar
    gcTime: 1000 * 60 * 5, // 5 minutos en cache después de desmontar
  })
}

// ============================================
// 2. QUERY: Vivienda individual (detalle)
// ============================================
export function useViviendaQuery(id: string) {
  return useQuery({
    queryKey: viviendasKeys.detail(id),
    queryFn: () => viviendasService.obtenerVivienda(id),
    enabled: !!id,
    staleTime: 0, // ✅ SIEMPRE re-fetch para tener datos actualizados
    gcTime: 1000 * 60 * 5, // 5 minutos en cache
  })
}

// ============================================
// 3. QUERY: Proyectos activos
// ============================================
export function useProyectosActivosQuery() {
  return useQuery({
    queryKey: viviendasKeys.proyectos,
    queryFn: () => viviendasService.obtenerProyectos(),
    staleTime: 1000 * 60 * 10, // 10 minutos (proyectos no cambian frecuentemente)
  })
}

// ============================================
// 4. QUERY: Manzanas disponibles de un proyecto
// ============================================
export function useManzanasDisponiblesQuery(proyectoId: string) {
  return useQuery({
    queryKey: viviendasKeys.manzanas(proyectoId),
    queryFn: () => viviendasService.obtenerManzanasDisponibles(proyectoId),
    enabled: !!proyectoId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// ============================================
// 5. QUERY: Siguiente número de vivienda
// ============================================
export function useSiguienteNumeroViviendaQuery(manzanaId: string) {
  return useQuery({
    queryKey: viviendasKeys.siguienteNumero(manzanaId),
    queryFn: () => viviendasService.obtenerSiguienteNumeroVivienda(manzanaId),
    enabled: !!manzanaId,
    staleTime: 1000 * 30, // 30 segundos (puede cambiar frecuentemente)
  })
}

// ============================================
// 6. QUERY: Números ocupados en manzana
// ============================================
export function useNumerosOcupadosQuery(manzanaId: string) {
  return useQuery({
    queryKey: viviendasKeys.numerosOcupados(manzanaId),
    queryFn: () => viviendasService.obtenerNumerosOcupados(manzanaId),
    enabled: !!manzanaId,
    staleTime: 1000 * 60, // 1 minuto
  })
}

// ============================================
// 7. QUERY: Configuración de recargos
// ============================================
export function useConfiguracionRecargosQuery() {
  return useQuery({
    queryKey: viviendasKeys.recargos,
    queryFn: () => viviendasService.obtenerConfiguracionRecargos(),
    staleTime: 1000 * 60 * 30, // 30 minutos (configuración no cambia frecuentemente)
  })
}

// ============================================
// 8. QUERY: Gastos notariales
// ============================================
export function useGastosNotarialesQuery() {
  return useQuery({
    queryKey: viviendasKeys.gastosNotariales,
    queryFn: () => viviendasService.obtenerGastosNotariales(),
    staleTime: 1000 * 60 * 30, // 30 minutos
  })
}

// ============================================
// 9. MUTATION: Crear vivienda
// ============================================
export function useCrearViviendaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: ViviendaFormData) => viviendasService.crear(formData),
    onSuccess: (nuevaVivienda) => {
      // Invalidar todas las listas de viviendas
      queryClient.invalidateQueries({ queryKey: viviendasKeys.lists() })

      // Invalidar manzanas (cambió disponibilidad)
      if (nuevaVivienda.manzana_id) {
        queryClient.invalidateQueries({
          queryKey: viviendasKeys.manzanaViviendas(nuevaVivienda.manzana_id)
        })
      }

      toast.success('Vivienda creada correctamente', {
        description: `Vivienda ${nuevaVivienda.numero} registrada exitosamente`,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear vivienda', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 10. MUTATION: Actualizar vivienda
// ============================================
export function useActualizarViviendaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ViviendaFormData> }) =>
      viviendasService.actualizar(id, data),
    onSuccess: (viviendaActualizada, variables) => {
      // Invalidar detalle específico
      queryClient.invalidateQueries({
        queryKey: viviendasKeys.detail(variables.id)
      })

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: viviendasKeys.lists() })

      toast.success('Vivienda actualizada correctamente', {
        description: `Los cambios se guardaron exitosamente`,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar vivienda', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 11. MUTATION: Eliminar vivienda
// ============================================
export function useEliminarViviendaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => viviendasService.eliminar(id),
    onSuccess: (_, viviendaId) => {
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: viviendasKeys.lists() })

      // Remover del cache el detalle eliminado
      queryClient.removeQueries({ queryKey: viviendasKeys.detail(viviendaId) })

      toast.success('Vivienda eliminada correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar vivienda', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 12. MUTATION: Actualizar certificado
// ============================================
export function useActualizarCertificadoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ viviendaId, file }: { viviendaId: string; file: File }) =>
      viviendasService.actualizarCertificado(viviendaId, file),
    onSuccess: (certificadoUrl, variables) => {
      // Invalidar detalle de la vivienda
      queryClient.invalidateQueries({
        queryKey: viviendasKeys.detail(variables.viviendaId)
      })

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: viviendasKeys.lists() })

      toast.success('Certificado actualizado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar certificado', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 13. HELPER: Verificar matrícula única
// ============================================
export async function verificarMatriculaUnica(
  matricula: string,
  viviendaId?: string
): Promise<boolean> {
  return viviendasService.verificarMatriculaUnica(matricula, viviendaId)
}
