/**
 * ============================================
 * HOOK: useInteresesQuery (React Query)
 * ============================================
 *
 * ✅ MIGRADO A REACT QUERY
 * Hook que maneja intereses del cliente con cache automático.
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 *
 * Campos usados de cliente_intereses:
 * - id, cliente_id, proyecto_id, vivienda_id
 * - estado (PascalCase: 'Activo', 'Descartado', etc.)
 * - origen ('WhatsApp', 'Email', etc.)
 * - notas, fecha_interes
 *
 * Campos de vista intereses_completos:
 * - proyecto_nombre, proyecto_estado
 * - vivienda_numero, vivienda_valor, vivienda_estado
 * - manzana_nombre
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { interesesService } from '@/modules/clientes/services/intereses.service'
import type { ClienteInteres } from '@/modules/clientes/types'

// =====================================================
// QUERY KEYS
// =====================================================

export const interesesKeys = {
  all: ['cliente-intereses'] as const,
  byCliente: (clienteId: string) => ['cliente-intereses', clienteId] as const,
  byProyecto: (proyectoId: string) => ['proyecto-intereses', proyectoId] as const,
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

interface UseInteresesQueryProps {
  clienteId: string
  soloActivos?: boolean
}

interface UseInteresesQueryReturn {
  // Data
  intereses: ClienteInteres[]
  loading: boolean
  error: Error | null

  // Filtros (client-side)
  filtrarPorEstado: (estado: string | null) => void
  estadoFiltro: string | null
  interesesFiltrados: ClienteInteres[]

  // Estadísticas (computed)
  stats: {
    total: number
    activos: number
    descartados: number
    convertidos: number
  }

  // Acciones
  descartarInteres: (interesId: string, motivo?: string) => Promise<void>
  descartando: boolean
  refetch: () => void
}

export function useInteresesQuery({
  clienteId,
  soloActivos = false,
}: UseInteresesQueryProps): UseInteresesQueryReturn {
  const queryClient = useQueryClient()
  const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null)

  // =====================================================
  // QUERY: Obtener intereses
  // =====================================================

  const {
    data: intereses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...interesesKeys.byCliente(clienteId), soloActivos],
    queryFn: () => interesesService.obtenerInteresesCliente(clienteId, soloActivos),
    enabled: !!clienteId,
    staleTime: 60 * 1000, // 60s - intereses cambian menos frecuentemente
    gcTime: 5 * 60 * 1000, // 5min - mantener en cache
  })

  // =====================================================
  // MUTATION: Descartar interés
  // =====================================================

  const descartarMutation = useMutation({
    mutationFn: ({ interesId, motivo }: { interesId: string; motivo?: string }) =>
      interesesService.descartarInteres(interesId, motivo),
    onSuccess: () => {
      // Invalidar cache para refetch automático
      queryClient.invalidateQueries({ queryKey: interesesKeys.byCliente(clienteId) })
    },
    onError: (error) => {
      console.error('❌ Error descartando interés:', error)
    },
  })

  // =====================================================
  // FILTROS (client-side)
  // =====================================================

  const interesesFiltrados = useMemo(() => {
    if (!estadoFiltro) return intereses

    return intereses.filter((interes) => interes.estado === estadoFiltro)
  }, [intereses, estadoFiltro])

  // =====================================================
  // ESTADÍSTICAS (computed)
  // =====================================================

  const stats = useMemo(
    () => ({
      total: intereses.length,
      activos: intereses.filter((i) => i.estado === 'Activo').length,
      descartados: intereses.filter((i) => i.estado === 'Descartado').length,
      convertidos: intereses.filter((i) => i.estado === 'Convertido').length,
    }),
    [intereses]
  )

  // =====================================================
  // ACCIONES
  // =====================================================

  const handleFiltrarPorEstado = (estado: string | null) => {
    setEstadoFiltro(estado)
  }

  const handleDescartarInteres = async (interesId: string, motivo?: string) => {
    await descartarMutation.mutateAsync({ interesId, motivo })
  }

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Data
    intereses,
    loading: isLoading,
    error: error as Error | null,

    // Filtros
    filtrarPorEstado: handleFiltrarPorEstado,
    estadoFiltro,
    interesesFiltrados,

    // Stats
    stats,

    // Acciones
    descartarInteres: handleDescartarInteres,
    descartando: descartarMutation.isPending,
    refetch,
  }
}
