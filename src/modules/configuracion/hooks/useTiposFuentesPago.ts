/**
 * React Query Hooks: Tipos de Fuentes de Pago
 *
 * Hooks profesionales con @tanstack/react-query para gestión de estado del servidor.
 *
 * Ventajas de React Query:
 * - Cache automático inteligente
 * - Sincronización en tiempo real
 * - Optimistic updates
 * - Invalidación automática
 * - Manejo de loading/error states
 * - Deduplicación de requests
 *
 * Patrón: Custom Hooks + React Query
 */

'use client'

import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    TiposFuentesPagoService
} from '../services'
import type {
    ActualizarTipoFuentePagoDTO,
    CrearTipoFuentePagoDTO,
    OrderDirection,
    TipoFuentePago,
    TipoFuentePagoFilters,
    TipoFuentePagoOption,
    TipoFuentePagoOrderBy
} from '../types'

// =====================================================
// QUERY KEYS (centralizadas para invalidación)
// =====================================================

export const tiposFuentesPagoKeys = {
  all: ['tipos-fuentes-pago'] as const,
  lists: () => [...tiposFuentesPagoKeys.all, 'list'] as const,
  list: (filters: TipoFuentePagoFilters, orderBy: TipoFuentePagoOrderBy, direction: OrderDirection) =>
    [...tiposFuentesPagoKeys.lists(), { filters, orderBy, direction }] as const,
  options: () => [...tiposFuentesPagoKeys.all, 'options'] as const,
  details: () => [...tiposFuentesPagoKeys.all, 'detail'] as const,
  detail: (id: string) => [...tiposFuentesPagoKeys.details(), id] as const,
  detailByCodigo: (codigo: string) => [...tiposFuentesPagoKeys.all, 'codigo', codigo] as const,
}

// =====================================================
// QUERIES (READ)
// =====================================================

/**
 * Hook: Obtener todos los tipos de fuentes de pago
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useTiposFuentesPago({
 *   filters: { activo: true },
 *   orderBy: 'orden'
 * })
 * ```
 */
export function useTiposFuentesPago(
  filters: TipoFuentePagoFilters = {},
  orderBy: TipoFuentePagoOrderBy = 'orden',
  direction: OrderDirection = 'asc',
  options?: Omit<UseQueryOptions<TipoFuentePago[], Error>, 'queryKey' | 'queryFn'>
) {
  const service = new TiposFuentesPagoService()

  return useQuery({
    queryKey: tiposFuentesPagoKeys.list(filters, orderBy, direction),
    queryFn: async () => {
      const result = await service.getAll(filters, orderBy, direction)

      if (!result.success) {
        throw new Error((result as any).error?.mensaje ?? String((result as any).error))
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (datos relativamente estáticos)
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
    ...options,
  })
}

/**
 * Hook: Obtener tipos activos como opciones para selects
 *
 * @example
 * ```typescript
 * const { data: opciones = [] } = useTiposFuentesPagoOptions()
 *
 * <select>
 *   {opciones.map(opt => (
 *     <option key={opt.value} value={opt.value}>{opt.label}</option>
 *   ))}
 * </select>
 * ```
 */
export function useTiposFuentesPagoOptions(
  options?: Omit<UseQueryOptions<TipoFuentePagoOption[], Error>, 'queryKey' | 'queryFn'>
) {
  const service = new TiposFuentesPagoService()

  return useQuery({
    queryKey: tiposFuentesPagoKeys.options(),
    queryFn: async () => {
      const result = await service.getOptionsActivas()

      if (!result.success) {
        throw new Error((result as any).error?.mensaje ?? String((result as any).error))
      }

      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (muy estable)
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
    ...options,
  })
}

/**
 * Hook: Obtener un tipo de fuente de pago por ID
 *
 * @example
 * ```typescript
 * const { data: tipo } = useTipoFuentePago('uuid-123')
 * ```
 */
export function useTipoFuentePago(
  id: string | null,
  options?: Omit<UseQueryOptions<TipoFuentePago, Error>, 'queryKey' | 'queryFn'>
) {
  const service = new TiposFuentesPagoService()

  return useQuery({
    queryKey: tiposFuentesPagoKeys.detail(id!),
    queryFn: async () => {
      const result = await service.getById(id!)

      if (!result.success) {
        throw new Error((result as any).error?.mensaje ?? String((result as any).error))
      }

      return result.data
    },
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * Hook: Obtener un tipo de fuente de pago por código
 *
 * @example
 * ```typescript
 * const { data: tipo } = useTipoFuentePagoByCodigo('cuota_inicial')
 * ```
 */
export function useTipoFuentePagoByCodigo(
  codigo: string | null,
  options?: Omit<UseQueryOptions<TipoFuentePago, Error>, 'queryKey' | 'queryFn'>
) {
  const service = new TiposFuentesPagoService()

  return useQuery({
    queryKey: tiposFuentesPagoKeys.detailByCodigo(codigo!),
    queryFn: async () => {
      const result = await service.getByCodigo(codigo!)

      if (!result.success) {
        throw new Error((result as any).error?.mensaje ?? String((result as any).error))
      }

      return result.data
    },
    enabled: !!codigo,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// =====================================================
// MUTATIONS (CREATE, UPDATE, DELETE)
// =====================================================

/**
 * Hook: Crear nuevo tipo de fuente de pago
 *
 * @example
 * ```typescript
 * const { mutate: crear, isPending } = useCrearTipoFuentePago()
 *
 * crear({
 *   nombre: 'Crédito Constructor',
 *   codigo: 'credito_constructor',
 *   requiere_entidad: true,
 *   // ...
 * })
 * ```
 */
export function useCrearTipoFuentePago(
  options?: Omit<UseMutationOptions<TipoFuentePago, Error, CrearTipoFuentePagoDTO>, 'mutationFn'>
) {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return useMutation({
    mutationFn: async (dto: CrearTipoFuentePagoDTO) => {
      const result = await service.create(dto)

      if (!result.success) {
        throw new Error((result as any).error?.mensaje ?? String((result as any).error))
      }

      return result.data
    },
    onSuccess: (data, variables) => {
      // Invalidar todas las listas
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.options() })

      // Toast de éxito
      toast.success('Tipo de fuente creado', {
        description: `"${data.nombre}" se ha creado correctamente`,
      })
    },
    onError: (error) => {
      toast.error('Error al crear tipo de fuente', {
        description: error.message,
      })
    },
    ...options,
  })
}

/**
 * Hook: Actualizar tipo de fuente de pago existente
 *
 * @example
 * ```typescript
 * const { mutate: actualizar } = useActualizarTipoFuentePago()
 *
 * actualizar({
 *   id: 'uuid-123',
 *   dto: { nombre: 'Nuevo nombre', activo: true }
 * })
 * ```
 */
export function useActualizarTipoFuentePago(
  options?: Omit<
    UseMutationOptions<TipoFuentePago, Error, { id: string; dto: ActualizarTipoFuentePagoDTO }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return useMutation({
    mutationFn: async ({ id, dto }) => {
      const result = await service.update(id, dto)

      if (!result.success) {
        throw new Error((result as any).error?.mensaje ?? String((result as any).error))
      }

      return result.data
    },
    onSuccess: (data, { id }) => {
      // Invalidar listas y detalle específico
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.options() })
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.detail(id) })

      // Optimistic update del cache
      queryClient.setQueryData(tiposFuentesPagoKeys.detail(id), data)

      toast.success('Tipo de fuente actualizado', {
        description: `"${data.nombre}" se ha actualizado correctamente`,
      })
    },
    onError: (error) => {
      toast.error('Error al actualizar tipo de fuente', {
        description: error.message,
      })
    },
    ...options,
  })
}

/**
 * Hook: Eliminar (soft delete) tipo de fuente de pago
 *
 * @example
 * ```typescript
 * const { mutate: eliminar } = useEliminarTipoFuentePago()
 *
 * eliminar('uuid-123')
 * ```
 */
export function useEliminarTipoFuentePago(
  options?: Omit<UseMutationOptions<TipoFuentePago, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await service.softDelete(id)

      if (!result.success) {
        throw new Error((result as any).error?.mensaje ?? String((result as any).error))
      }

      return result.data
    },
    onSuccess: (data, id) => {
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.options() })
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.detail(id) })

      toast.success('Tipo de fuente eliminado', {
        description: `"${data.nombre}" se ha desactivado correctamente`,
      })
    },
    onError: (error) => {
      toast.error('Error al eliminar tipo de fuente', {
        description: error.message,
      })
    },
    ...options,
  })
}

/**
 * Hook: Reactivar tipo de fuente de pago
 *
 * @example
 * ```typescript
 * const { mutate: reactivar } = useReactivarTipoFuentePago()
 *
 * reactivar('uuid-123')
 * ```
 */
export function useReactivarTipoFuentePago(
  options?: Omit<UseMutationOptions<TipoFuentePago, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await service.reactivar(id)

      if (!result.success) {
        throw new Error((result as any).error?.mensaje ?? String((result as any).error))
      }

      return result.data
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.options() })
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.detail(id) })

      toast.success('Tipo de fuente reactivado', {
        description: `"${data.nombre}" se ha activado correctamente`,
      })
    },
    onError: (error) => {
      toast.error('Error al reactivar tipo de fuente', {
        description: error.message,
      })
    },
    ...options,
  })
}

/**
 * Hook: Reordenar tipos de fuentes de pago (drag and drop)
 *
 * @example
 * ```typescript
 * const { mutate: reordenar } = useReordenarTiposFuentesPago()
 *
 * reordenar([
 *   { id: 'uuid-1', orden: 1 },
 *   { id: 'uuid-2', orden: 2 }
 * ])
 * ```
 */
export function useReordenarTiposFuentesPago(
  options?: Omit<
    UseMutationOptions<void, Error, Array<{ id: string; orden: number }>>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return useMutation({
    mutationFn: async (reordenamientos) => {
      const result = await service.reordenar(reordenamientos)

      if (!result.success) {
        throw new Error((result as any).error?.mensaje ?? String((result as any).error))
      }
    },
    onSuccess: () => {
      // Invalidar todas las listas (el orden cambió)
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.options() })

      toast.success('Orden actualizado', {
        description: 'El orden de las fuentes de pago se ha actualizado',
      })
    },
    onError: (error) => {
      toast.error('Error al reordenar', {
        description: error.message,
      })
    },
    ...options,
  })
}

// =====================================================
// UTILITY HOOKS
// =====================================================

/**
 * Hook: Invalidar manualmente cache de tipos de fuentes
 * Útil para sincronización manual o después de operaciones externas
 *
 * @example
 * ```typescript
 * const invalidar = useInvalidarTiposFuentesPago()
 *
 * // Después de alguna operación externa
 * invalidar()
 * ```
 */
export function useInvalidarTiposFuentesPago() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.all })
  }
}

/**
 * Hook: Prefetch de datos para optimizar carga
 * Útil para precarga cuando se anticipa navegación
 *
 * @example
 * ```typescript
 * const prefetch = usePrefetchTiposFuentesPago()
 *
 * <button onMouseEnter={() => prefetch()}>
 *   Ver Fuentes de Pago
 * </button>
 * ```
 */
export function usePrefetchTiposFuentesPago() {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return async () => {
    await queryClient.prefetchQuery({
      queryKey: tiposFuentesPagoKeys.list({ activo: true }, 'orden', 'asc'),
      queryFn: async () => {
        const result = await service.getAll({ activo: true }, 'orden', 'asc')
        if (!result.success) throw new Error((result as any).error?.mensaje ?? String((result as any).error))
        return result.data
      },
      staleTime: 5 * 60 * 1000,
    })
  }
}
