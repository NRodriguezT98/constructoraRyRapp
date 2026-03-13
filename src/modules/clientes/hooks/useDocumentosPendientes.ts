/**
 * ============================================
 * HOOK: useDocumentosPendientes (React Query)
 * ============================================
 *
 * Hook optimizado con React Query para gestión de documentos pendientes
 * - Cache automático (5 min)
 * - Refetch inteligente
 * - Invalidación quirúrgica
 * - Manejo robusto de errores
 *
 * @version 2.0.0 - 2025-12-12
 */

import {
    completarDocumentoPendiente,
    eliminarDocumentoPendiente,
    fetchDocumentosPendientesPorCliente
} from '@/modules/clientes/services/documentos-pendientes.service'
import {
    documentosPendientesKeys
} from '@/modules/clientes/types/documentos-pendientes.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// ============================================
// QUERY HOOK
// ============================================

interface UseDocumentosPendientesOptions {
  enabled?: boolean
  refetchInterval?: number | false
}

/**
 * Hook para obtener documentos pendientes de un cliente
 * âœ… Con cache, refetch automático y manejo de errores
 */
export function useDocumentosPendientes(
  clienteId: string,
  options: UseDocumentosPendientesOptions = {}
) {
  const { enabled = true, refetchInterval = false } = options

  return useQuery({
    queryKey: documentosPendientesKeys.byCliente(clienteId),
    queryFn: () => fetchDocumentosPendientesPorCliente(clienteId),
    enabled: enabled && !!clienteId,
    staleTime: 1000 * 30,          // ✅ 30 s — la fuente es una VIEW real-time, no cache largo
    gcTime: 1000 * 60 * 30,        // ✅ Garbage collect después de 30 min
    refetchOnWindowFocus: true,     // ✅ Refetch al volver a la ventana
    refetchInterval,                // ✅ Polling opcional
    retry: 2,                       // ✅ Reintentar 2 veces en caso de error
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook para completar un documento pendiente
 * âœ… Con invalidación automática de cache
 */
export function useCompletarDocumentoPendiente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ documentoId, completadoPor }: { documentoId: string; completadoPor: string }) =>
      completarDocumentoPendiente(documentoId, completadoPor),

    onSuccess: (_, variables) => {
      // âœ… Invalidar cache del cliente asociado
      // (React Query refetcheará automáticamente)
      queryClient.invalidateQueries({
        queryKey: documentosPendientesKeys.all
      })

    },

    onError: (error) => {
      console.error('âŒ Error al completar documento:', error)
    }
  })
}

/**
 * Hook para eliminar un documento pendiente
 * âœ… Con invalidación automática de cache
 */
export function useEliminarDocumentoPendiente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentoId: string) => eliminarDocumentoPendiente(documentoId),

    onSuccess: () => {
      // âœ… Invalidar cache de todos los documentos pendientes
      queryClient.invalidateQueries({
        queryKey: documentosPendientesKeys.all
      })

    },

    onError: (error) => {
      console.error('âŒ Error al eliminar documento:', error)
    }
  })
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook para invalidar manualmente el cache de documentos pendientes
 */
export function useInvalidarDocumentosPendientes() {
  const queryClient = useQueryClient()

  return {
    invalidarPorCliente: (clienteId: string) => {
      queryClient.invalidateQueries({
        queryKey: documentosPendientesKeys.byCliente(clienteId)
      })
    },
    invalidarTodos: () => {
      queryClient.invalidateQueries({
        queryKey: documentosPendientesKeys.all
      })
    },
    refetchPorCliente: (clienteId: string) => {
      queryClient.refetchQueries({
        queryKey: documentosPendientesKeys.byCliente(clienteId)
      })
    }
  }
}
