/**
 * React Query Hooks: Entidades Financieras
 *
 * Custom hooks para gestión de estado de servidor con React Query v5.
 * Implementa cache strategies, optimistic updates y error handling.
 */

'use client'

import { useQuery } from '@tanstack/react-query'

import { entidadesFinancierasService } from '../services/entidades-financieras.service'
import type {
  EntidadesFinancierasFilters,
  EntidadesFinancierasOrderBy,
  EntidadFinancieraOption,
  TipoEntidadFinanciera,
} from '../types/entidades-financieras.types'

// =====================================================
// QUERY KEYS FACTORY
// =====================================================

export const entidadesFinancierasKeys = {
  all: ['entidades-financieras'] as const,
  lists: () => [...entidadesFinancierasKeys.all, 'list'] as const,
  list: (
    filters?: EntidadesFinancierasFilters,
    orderBy?: EntidadesFinancierasOrderBy
  ) => [...entidadesFinancierasKeys.lists(), { filters, orderBy }] as const,
  details: () => [...entidadesFinancierasKeys.all, 'detail'] as const,
  detail: (id: string) => [...entidadesFinancierasKeys.details(), id] as const,
  stats: () => [...entidadesFinancierasKeys.all, 'stats'] as const,
  activas: (tipo?: TipoEntidadFinanciera) =>
    [...entidadesFinancierasKeys.all, 'activas', tipo] as const,
}

// =====================================================
// QUERY HOOKS
// =====================================================

/**
 * Hook principal: Obtener lista de entidades con filtros
 */
export function useEntidadesFinancieras(
  filters?: EntidadesFinancierasFilters,
  orderBy?: EntidadesFinancierasOrderBy
) {
  return useQuery({
    queryKey: entidadesFinancierasKeys.list(filters, orderBy),
    queryFn: async () => {
      const result = await entidadesFinancierasService.getAll(filters, orderBy)

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook: Obtener entidad por ID
 */
export function useEntidadFinanciera(id: string) {
  return useQuery({
    queryKey: entidadesFinancierasKeys.detail(id),
    queryFn: async () => {
      const result = await entidadesFinancierasService.getById(id)

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook: Obtener estadísticas
 */
export function useEntidadesFinancierasStats() {
  return useQuery({
    queryKey: entidadesFinancierasKeys.stats(),
    queryFn: async () => {
      const result = await entidadesFinancierasService.getStats()

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook optimizado: Obtener solo entidades activas para formularios
 */
export function useEntidadesFinancierasActivas(tipo?: TipoEntidadFinanciera) {
  return useQuery({
    queryKey: entidadesFinancierasKeys.activas(tipo),
    queryFn: async () => {
      const result = await entidadesFinancierasService.getActivas(tipo)

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (datos estables)
    gcTime: 15 * 60 * 1000,
  })
}

/**
 * Hook: Opciones para <select> / Combobox
 */
export function useEntidadesFinancierasOptions(tipo?: TipoEntidadFinanciera) {
  return useQuery({
    queryKey: [...entidadesFinancierasKeys.activas(tipo), 'options'],
    queryFn: async () => {
      const result = await entidadesFinancierasService.getActivas(tipo)

      if (!result.success) {
        throw new Error(result.error)
      }

      const options: EntidadFinancieraOption[] = result.data.map(entidad => ({
        value: entidad.id,
        label: entidad.nombre,
        tipo: entidad.tipo,
        codigo: entidad.codigo,
        activo: entidad.activo,
      }))

      return options
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

// =====================================================
// MUTATION HOOKS
// =====================================================

// Mutations extra�das a useEntidadesFinancierasMutations.ts
export {
  useActualizarEntidadFinanciera,
  useCrearEntidadFinanciera,
  useEliminarEntidadFinanciera,
  useReactivarEntidadFinanciera,
  useReordenarEntidadesFinancieras,
} from './useEntidadesFinancierasMutations'
