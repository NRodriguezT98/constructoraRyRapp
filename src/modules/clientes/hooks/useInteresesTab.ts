/**
 * ============================================
 * HOOK: useInteresesTab
 * ============================================
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES + REACT QUERY
 * Hook que maneja TODA la lógica del tab de intereses.
 * El componente solo renderiza UI.
 *
 * Responsabilidades:
 * - Cargar intereses del cliente con React Query (cache automático)
 * - Descartar intereses con optimistic updates
 * - Filtrar por estado (client-side)
 * - Calcular estadísticas (memoizadas)
 */

import { useCallback, useState } from 'react'

import { logger } from '@/lib/utils/logger'

import type { ClienteInteres } from '../types'

import { useInteresesQuery } from './useInteresesQuery'

interface UseInteresesTabProps {
  clienteId: string
}

export function useInteresesTab({ clienteId }: UseInteresesTabProps) {
  // =====================================================
  // ESTADO
  // =====================================================

  const [descartandoId, setDescartandoId] = useState<string | null>(null)
  const [interesADescartar, setInteresADescartar] =
    useState<ClienteInteres | null>(null)

  // ✅ Hook con React Query (cache, refetch automático, estados optimizados)
  const {
    interesesFiltrados: intereses,
    loading,
    stats,
    descartarInteres,
    filtrarPorEstado,
    estadoFiltro,
    refetch,
  } = useInteresesQuery({ clienteId })

  // =====================================================
  // ACCIONES
  // =====================================================

  /** Abre el modal de confirmación para descartar */
  const abrirModalDescartar = useCallback((interes: ClienteInteres) => {
    setInteresADescartar(interes)
  }, [])

  /** Cancela sin descartar */
  const cancelarDescartar = useCallback(() => {
    setInteresADescartar(null)
  }, [])

  /** Ejecuta el descarte con el motivo ingresado */
  const confirmarDescartar = useCallback(
    async (motivo: string) => {
      if (!interesADescartar) return

      setDescartandoId(interesADescartar.id)
      setInteresADescartar(null)
      try {
        await descartarInteres(
          interesADescartar.id,
          motivo || 'Cliente ya no está interesado'
        )
      } catch (error) {
        logger.error('❌ [useInteresesTab] Error al descartar:', error)
      } finally {
        setDescartandoId(null)
      }
    },
    [interesADescartar, descartarInteres]
  )

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    intereses,
    loading,
    stats,
    estadoFiltro,
    descartando: descartandoId,

    // Modal descartar
    interesADescartar,
    abrirModalDescartar,
    cancelarDescartar,
    confirmarDescartar,

    // Acciones
    filtrarPorEstado,
    recargar: refetch,
  }
}
