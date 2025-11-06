/**
 * ============================================
 * CLIENTES - REACT QUERY HOOKS
 * ============================================
 *
 * Queries y Mutations para el módulo de Clientes.
 * Migrado desde Zustand store a React Query para mejor cache management.
 *
 * QUERIES:
 * - useClientesQuery(filtros) - Lista de clientes con filtros
 * - useClienteQuery(id) - Detalle de cliente individual
 * - useEstadisticasClientesQuery() - Estadísticas generales
 *
 * MUTATIONS:
 * - useCrearClienteMutation() - Crear nuevo cliente
 * - useActualizarClienteMutation() - Actualizar cliente existente
 * - useEliminarClienteMutation() - Eliminar cliente
 * - useCambiarEstadoClienteMutation() - Cambiar estado de cliente
 * - useSubirDocumentoIdentidadMutation() - Subir documento de identidad
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientesService } from '../services/clientes.service'
import type {
    ActualizarClienteDTO,
    CrearClienteDTO,
    FiltrosClientes
} from '../types'

// ============================================================================
// QUERY KEYS CENTRALIZADOS
// ============================================================================

export const clientesKeys = {
  all: ['clientes'] as const,
  lists: () => [...clientesKeys.all, 'list'] as const,
  list: (filtros?: FiltrosClientes) => [...clientesKeys.lists(), filtros] as const,
  details: () => [...clientesKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientesKeys.details(), id] as const,
  estadisticas: () => [...clientesKeys.all, 'estadisticas'] as const,
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Query: Lista de clientes con filtros
 */
export function useClientesQuery(filtros?: FiltrosClientes) {
  return useQuery({
    queryKey: clientesKeys.list(filtros),
    queryFn: () => clientesService.obtenerClientes(filtros),
    staleTime: 0, // Siempre refetch para datos actualizados
    gcTime: 1000 * 60 * 5, // Cache 5 minutos
  })
}

/**
 * Query: Detalle de cliente individual
 */
export function useClienteQuery(id: string | null) {
  return useQuery({
    queryKey: clientesKeys.detail(id || ''),
    queryFn: () => clientesService.obtenerCliente(id!),
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 10, // Cache 10 minutos
  })
}

/**
 * Query: Estadísticas generales de clientes
 */
export function useEstadisticasClientesQuery() {
  return useQuery({
    queryKey: clientesKeys.estadisticas(),
    queryFn: () => clientesService.obtenerEstadisticas(),
    staleTime: 1000 * 60, // 1 minuto
    gcTime: 1000 * 60 * 5, // Cache 5 minutos
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mutation: Crear cliente
 */
export function useCrearClienteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: CrearClienteDTO) => clientesService.crearCliente(datos),
    onSuccess: () => {
      // Invalidar todas las listas de clientes
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientesKeys.estadisticas() })
    },
  })
}

/**
 * Mutation: Actualizar cliente
 */
export function useActualizarClienteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: ActualizarClienteDTO }) =>
      clientesService.actualizarCliente(id, datos),
    onSuccess: (data, variables) => {
      // Invalidar detalle del cliente actualizado
      queryClient.invalidateQueries({ queryKey: clientesKeys.detail(variables.id) })
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientesKeys.estadisticas() })
    },
  })
}

/**
 * Mutation: Eliminar cliente
 */
export function useEliminarClienteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => clientesService.eliminarCliente(id),
    onSuccess: (_, id) => {
      // Remover de cache
      queryClient.removeQueries({ queryKey: clientesKeys.detail(id) })
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientesKeys.estadisticas() })
    },
  })
}

/**
 * Mutation: Cambiar estado de cliente
 */
export function useCambiarEstadoClienteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      estado,
    }: {
      id: string
      estado: 'Interesado' | 'Activo' | 'Inactivo'
    }) => clientesService.cambiarEstado(id, estado),
    onSuccess: (data, variables) => {
      // Invalidar detalle del cliente
      queryClient.invalidateQueries({ queryKey: clientesKeys.detail(variables.id) })
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientesKeys.estadisticas() })
    },
  })
}

/**
 * Mutation: Subir documento de identidad
 */
export function useSubirDocumentoIdentidadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clienteId, archivo }: { clienteId: string; archivo: File }) =>
      clientesService.subirDocumentoIdentidad(clienteId, archivo),
    onSuccess: (_, variables) => {
      // Invalidar detalle del cliente
      queryClient.invalidateQueries({ queryKey: clientesKeys.detail(variables.clienteId) })
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
    },
  })
}

// ============================================================================
// HELPER: Invalidar cache de clientes
// ============================================================================

export function invalidateClientesQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: clientesKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: clientesKeys.estadisticas() }),
  ])
}
