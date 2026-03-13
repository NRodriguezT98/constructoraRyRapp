/**
 * ============================================
 * HOOK: Estado de Documentación de Fuente de Pago
 * ============================================
 *
 * Hook personalizado con React Query para obtener el estado
 * de documentación de una fuente de pago.
 *
 * âœ… SEPARACIÃ“N DE RESPONSABILIDADES
 * - Solo lógica de negocio
 * - Cache con React Query
 * - Revalidación automática
 *
 * @version 1.0.0 - 2025-12-12
 */

'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { supabase } from '@/lib/supabase/client'
import {
    EstadoDocumentacionFuente,
    FuentesPagoRequisitosService,
} from '@/modules/fuentes-pago/services/requisitos.service'

// ============================================
// QUERY KEYS
// ============================================

export const QUERY_KEYS = {
  estadoDocumentacion: (fuenteId: string) => ['estado-documentacion-fuente', fuenteId],
  validacionRequisitos: (fuenteId: string) => ['validacion-requisitos', fuenteId],
  requisitosConfig: (tipoFuente: string) => ['requisitos-config', tipoFuente],
}

// ============================================
// HOOK: useEstadoDocumentacionFuente
// ============================================

interface UseEstadoDocumentacionFuenteOptions {
  enabled?: boolean
  refetchInterval?: number | false
  onSuccess?: (data: EstadoDocumentacionFuente) => void
  onError?: (error: Error) => void
}

export function useEstadoDocumentacionFuente(
  fuentePagoId: string | undefined,
  options: UseEstadoDocumentacionFuenteOptions = {}
) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: QUERY_KEYS.estadoDocumentacion(fuentePagoId || ''),
    queryFn: async () => {
      if (!fuentePagoId) {
        throw new Error('ID de fuente de pago no proporcionado')
      }
      return FuentesPagoRequisitosService.obtenerEstadoDocumentacionFuente(fuentePagoId)
    },
    enabled: !!fuentePagoId && (options.enabled !== false),
    refetchInterval: options.refetchInterval ?? false,
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Callbacks
  useEffect(() => {
    if (query.isSuccess && query.data && options.onSuccess) {
      options.onSuccess(query.data)
    }
  }, [query.isSuccess, query.data, options])

  useEffect(() => {
    if (query.isError && query.error && options.onError) {
      options.onError(query.error as Error)
    }
  }, [query.isError, query.error, options])

  // Suscripción a cambios en tiempo real (Supabase Realtime)
  useEffect(() => {
    if (!fuentePagoId) return

    const channel = supabase
      .channel(`documentacion-fuente-${fuentePagoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documentos_cliente',
          filter: `metadata->>fuente_pago_id=eq.${fuentePagoId}`,
        },
        (payload) => {
          // Invalidar y refetch
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.estadoDocumentacion(fuentePagoId),
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fuentePagoId, queryClient])

  return {
    estado: query.data,
    loading: query.isLoading,
    error: query.error as Error | null,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

// ============================================
// HOOK: useValidacionRequisitos (solo validación)
// ============================================

interface UseValidacionRequisitosOptions {
  enabled?: boolean
  onSuccess?: (cumpleRequisitos: boolean) => void
}

export function useValidacionRequisitos(
  fuentePagoId: string | undefined,
  options: UseValidacionRequisitosOptions = {}
) {
  const query = useQuery({
    queryKey: QUERY_KEYS.validacionRequisitos(fuentePagoId || ''),
    queryFn: async () => {
      if (!fuentePagoId) {
        throw new Error('ID de fuente de pago no proporcionado')
      }
      return FuentesPagoRequisitosService.validarRequisitosDesembolso(fuentePagoId)
    },
    enabled: !!fuentePagoId && (options.enabled !== false),
    staleTime: 20000, // 20 segundos
    gcTime: 3 * 60 * 1000, // 3 minutos
    retry: 1,
  })

  // Callback onSuccess
  useEffect(() => {
    if (query.isSuccess && query.data && options.onSuccess) {
      options.onSuccess(query.data.cumple_requisitos)
    }
  }, [query.isSuccess, query.data, options])

  return {
    validacion: query.data,
    cumpleRequisitos: query.data?.cumple_requisitos ?? false,
    puedeDesembolsar: query.data?.puede_continuar ?? false,
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

// ============================================
// HOOK: useRequisitosConfig (configuración)
// ============================================

export function useRequisitosConfig(tipoFuente: string | undefined) {
  const query = useQuery({
    queryKey: QUERY_KEYS.requisitosConfig(tipoFuente || ''),
    queryFn: async () => {
      if (!tipoFuente) {
        throw new Error('Tipo de fuente no proporcionado')
      }
      return FuentesPagoRequisitosService.obtenerRequisitosConfig(tipoFuente)
    },
    enabled: !!tipoFuente,
    staleTime: 5 * 60 * 1000, // 5 minutos (configuración no cambia frecuentemente)
    gcTime: 30 * 60 * 1000, // 30 minutos
  })

  return {
    requisitos: query.data || [],
    loading: query.isLoading,
    error: query.error as Error | null,
  }
}

// ============================================
// HOOK: useMultiplesEstadosFuentes (optimizado)
// ============================================

export function useMultiplesEstadosFuentes(fuentesIds: string[]) {
  const query = useQuery({
    queryKey: ['multiples-estados-fuentes', ...fuentesIds.sort()],
    queryFn: async () => {
      return FuentesPagoRequisitosService.validarMultiplesFuentes(fuentesIds)
    },
    enabled: fuentesIds.length > 0,
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    estadosPorFuente: query.data || new Map(),
    loading: query.isLoading,
    error: query.error as Error | null,
  }
}
