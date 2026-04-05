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

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { TiposFuentesPagoService } from '../services'
import type {
  OrderDirection,
  TipoFuentePago,
  TipoFuentePagoFilters,
  TipoFuentePagoOption,
  TipoFuentePagoOrderBy,
} from '../types'

// =====================================================
// QUERY KEYS (centralizadas para invalidación)
// =====================================================

export const tiposFuentesPagoKeys = {
  all: ['tipos-fuentes-pago'] as const,
  lists: () => [...tiposFuentesPagoKeys.all, 'list'] as const,
  list: (
    filters: TipoFuentePagoFilters,
    orderBy: TipoFuentePagoOrderBy,
    direction: OrderDirection
  ) =>
    [...tiposFuentesPagoKeys.lists(), { filters, orderBy, direction }] as const,
  options: () => [...tiposFuentesPagoKeys.all, 'options'] as const,
  details: () => [...tiposFuentesPagoKeys.all, 'detail'] as const,
  detail: (id: string) => [...tiposFuentesPagoKeys.details(), id] as const,
  detailByCodigo: (codigo: string) =>
    [...tiposFuentesPagoKeys.all, 'codigo', codigo] as const,
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
  options?: Omit<
    UseQueryOptions<TipoFuentePago[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  const service = new TiposFuentesPagoService()

  return useQuery({
    queryKey: tiposFuentesPagoKeys.list(filters, orderBy, direction),
    queryFn: async () => {
      const result = await service.getAll(filters, orderBy, direction)

      if (!result.success) {
        throw new Error(result.error.mensaje)
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
  options?: Omit<
    UseQueryOptions<TipoFuentePagoOption[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  const service = new TiposFuentesPagoService()

  return useQuery({
    queryKey: tiposFuentesPagoKeys.options(),
    queryFn: async () => {
      const result = await service.getOptionsActivas()

      if (!result.success) {
        throw new Error(result.error.mensaje)
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
  const tipoId = id ?? null

  return useQuery({
    queryKey: tiposFuentesPagoKeys.detail(tipoId ?? 'sin-id'),
    queryFn: async () => {
      if (!tipoId) {
        throw new Error('ID requerido')
      }

      const result = await service.getById(tipoId)

      if (!result.success) {
        throw new Error(result.error.mensaje)
      }

      return result.data
    },
    enabled: !!tipoId, // Solo ejecutar si hay ID
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
  const codigoSeguro = codigo ?? null

  return useQuery({
    queryKey: tiposFuentesPagoKeys.detailByCodigo(codigoSeguro ?? 'sin-codigo'),
    queryFn: async () => {
      if (!codigoSeguro) {
        throw new Error('Código requerido')
      }

      const result = await service.getByCodigo(codigoSeguro)

      if (!result.success) {
        throw new Error(result.error.mensaje)
      }

      return result.data
    },
    enabled: !!codigoSeguro,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// Mutations extra�das a useTiposFuentesPagoMutations.ts
export {
  useActualizarTipoFuentePago,
  useCrearTipoFuentePago,
  useEliminarTipoFuentePago,
  useReactivarTipoFuentePago,
  useReordenarTiposFuentesPago,
} from './useTiposFuentesPagoMutations'
