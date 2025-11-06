/**
 * ============================================
 * REACT QUERY CLIENT
 * ============================================
 *
 * Configuración global de React Query (TanStack Query)
 * Cache inteligente para queries de Supabase
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Crear Query Client con configuración optimizada
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // ⚡ CONFIGURACIÓN DE CACHE
        staleTime: 5 * 60 * 1000, // 5 minutos - datos considerados "frescos"
        gcTime: 10 * 60 * 1000, // 10 minutos - tiempo en cache (antes cacheTime)
        
        // ⚡ CONFIGURACIÓN DE REFETCH
        refetchOnWindowFocus: false, // No refetch al volver a la ventana
        refetchOnReconnect: true, // Sí refetch al reconectar internet
        refetchOnMount: false, // No refetch al montar si hay cache válido
        
        // ⚡ CONFIGURACIÓN DE RETRY
        retry: 1, // Solo 1 reintento en caso de error
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // ⚡ CONFIGURACIÓN DE MUTATIONS
        retry: 0, // No reintentar mutations (create, update, delete)
      },
    },
  })
}

/**
 * Cliente global (singleton para server components)
 * En client components, usa el provider
 */
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: siempre crear nuevo
    return makeQueryClient()
  } else {
    // Browser: reusar el mismo cliente
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}
