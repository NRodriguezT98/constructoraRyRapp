/**
 * Hook para obtener intereses de un cliente específico
 *
 * ✅ Migrado a React Query (useQuery)
 * ✅ Cache automático, deduplicación y revalidación
 */

import { useQuery } from '@tanstack/react-query'

import {
  obtenerInteresesSimples,
  type InteresClienteSimple,
} from '../services/intereses.service'

export const clienteInteresesKeys = {
  all: ['cliente-intereses'] as const,
  byCliente: (clienteId: string) =>
    [...clienteInteresesKeys.all, clienteId] as const,
}

export type { InteresClienteSimple as InteresCliente }

export function useClienteIntereses(clienteId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: clienteInteresesKeys.byCliente(clienteId),
    queryFn: () => obtenerInteresesSimples(clienteId),
    enabled: Boolean(clienteId),
  })

  return {
    intereses: data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
  }
}
