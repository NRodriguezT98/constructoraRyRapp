/**
 * React Query Hooks: Entidades Financieras
 *
 * Custom hooks para gestión de estado de servidor con React Query v5.
 * Implementa cache strategies, optimistic updates y error handling.
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { showEntitySuccessToast } from '@/components/toasts/custom-toasts'
import { logger } from '@/lib/utils/logger'

import { entidadesFinancierasService } from '../services/entidades-financieras.service'
import type {
    ActualizarEntidadFinancieraDTO,
    CrearEntidadFinancieraDTO,
    EntidadesFinancierasFilters,
    EntidadesFinancierasOrderBy,
    EntidadFinanciera,
    EntidadFinancieraOption,
    TipoEntidadFinanciera,
} from '../types/entidades-financieras.types'

// =====================================================
// QUERY KEYS FACTORY
// =====================================================

export const entidadesFinancierasKeys = {
  all: ['entidades-financieras'] as const,
  lists: () => [...entidadesFinancierasKeys.all, 'list'] as const,
  list: (filters?: EntidadesFinancierasFilters, orderBy?: EntidadesFinancierasOrderBy) =>
    [...entidadesFinancierasKeys.lists(), { filters, orderBy }] as const,
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
        throw new Error((result as any).error)
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
        throw new Error((result as any).error)
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
        throw new Error((result as any).error)
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
        throw new Error((result as any).error)
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
        throw new Error((result as any).error)
      }

      const options: EntidadFinancieraOption[] = result.data.map((entidad) => ({
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

/**
 * Mutation: Crear entidad
 */
export function useCrearEntidadFinanciera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CrearEntidadFinancieraDTO) => {
      const result = await entidadesFinancierasService.create(dto)

      if (!result.success) {
        throw new Error((result as any).error)
      }

      return result.data
    },
    onSuccess: (data) => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: entidadesFinancierasKeys.all })

      showEntitySuccessToast({ entityName: data.nombre, action: 'created' })
    },
    onError: (error: Error) => {
      logger.error('Error al crear entidad financiera:', error)
      toast.error('Error al crear entidad', {
        description: error.message,
      })
    },
  })
}

/**
 * Mutation: Actualizar entidad
 */
export function useActualizarEntidadFinanciera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: ActualizarEntidadFinancieraDTO }) => {
      const result = await entidadesFinancierasService.update(id, dto)

      if (!result.success) {
        throw new Error((result as any).error)
      }

      return result.data
    },
    onMutate: async ({ id, dto }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: entidadesFinancierasKeys.detail(id) })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<EntidadFinanciera>(
        entidadesFinancierasKeys.detail(id)
      )

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<EntidadFinanciera>(entidadesFinancierasKeys.detail(id), {
          ...previousData,
          ...dto,
        })
      }

      return { previousData }
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          entidadesFinancierasKeys.detail(variables.id),
          context.previousData
        )
      }

      logger.error('Error al actualizar entidad financiera:', error)
      toast.error('Error al actualizar entidad', {
        description: error.message,
      })
    },
    onSuccess: (data) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: entidadesFinancierasKeys.all })

      showEntitySuccessToast({ entityName: data.nombre, action: 'updated' })
    },
  })
}

/**
 * Mutation: Desactivar entidad (soft delete)
 */
export function useEliminarEntidadFinanciera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await entidadesFinancierasService.softDelete(id)

      if (!result.success) {
        throw new Error((result as any).error)
      }

      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: entidadesFinancierasKeys.all })

      toast.success('✓ Entidad desactivada', {
        description: `${data.nombre} ya no aparecerá en las opciones de selección`,
      })
    },
    onError: (error: Error) => {
      logger.error('Error al desactivar entidad financiera:', error)
      toast.error('Error al desactivar entidad', {
        description: error.message,
      })
    },
  })
}

/**
 * Mutation: Reactivar entidad
 */
export function useReactivarEntidadFinanciera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await entidadesFinancierasService.reactivate(id)

      if (!result.success) {
        throw new Error((result as any).error)
      }

      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: entidadesFinancierasKeys.all })

      toast.success('✓ Entidad reactivada exitosamente', {
        description: `${data.nombre} vuelve a estar disponible para usar`,
      })
    },
    onError: (error: Error) => {
      logger.error('Error al reactivar entidad financiera:', error)
      toast.error('Error al reactivar entidad', {
        description: error.message,
      })
    },
  })
}

/**
 * Mutation: Reordenar entidades
 */
export function useReordenarEntidadesFinancieras() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; orden: number }>) => {
      const result = await entidadesFinancierasService.reordenar(updates)

      if (!result.success) {
        throw new Error((result as any).error)
      }

      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entidadesFinancierasKeys.all })

      toast.success('Orden actualizado', {
        description: 'El orden de las entidades se actualizó correctamente',
      })
    },
    onError: (error: Error) => {
      logger.error('Error al reordenar entidades:', error)
      toast.error('Error al reordenar', {
        description: error.message,
      })
    },
  })
}
