// ============================================
// HOOK: useActividadTab (stub)
// ============================================

interface UseActividadTabParams {
  clienteId: string
}

export function useActividadTab({
  clienteId: _clienteId,
}: UseActividadTabParams) {
  return {
    negociacionId: null as string | null,
    categoriaId: null as string | null,
    isLoading: false,
    error: null as string | null,
    hasNegociacionActiva: false,
  }
}
