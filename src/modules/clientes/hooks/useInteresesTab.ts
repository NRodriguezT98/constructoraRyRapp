/**
 * ============================================
 * HOOK: useInteresesTab
 * ============================================
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 * Hook que maneja TODA la lógica del tab de intereses.
 * El componente solo renderiza UI.
 *
 * Responsabilidades:
 * - Cargar intereses del cliente con useListaIntereses
 * - Descartar intereses
 * - Filtrar por estado
 * - Calcular estadísticas
 */

import { useCallback, useState } from 'react'

import { useListaIntereses } from './useListaIntereses'

interface UseInteresesTabProps {
  clienteId: string
}

export function useInteresesTab({ clienteId }: UseInteresesTabProps) {
  // =====================================================
  // ESTADO
  // =====================================================

  const [descartando, setDescartando] = useState<string | null>(null)

  // ✅ Hook existente que ya maneja la lógica de intereses
  const {
    intereses,
    loading,
    stats,
    descartarInteres,
    filtrarPorEstado,
    estadoFiltro,
    recargar,
  } = useListaIntereses(clienteId)

  // =====================================================
  // ACCIONES
  // =====================================================

  /**
   * Descartar interés con confirmación
   */
  const handleDescartar = useCallback(
    async (interesId: string) => {
      if (!confirm('¿Estás seguro de descartar este interés?')) return

      setDescartando(interesId)
      try {
        await descartarInteres(interesId, 'Cliente ya no está interesado')
        await recargar()
      } catch (error) {
        console.error('❌ [useInteresesTab] Error al descartar:', error)
        alert('Error al descartar el interés')
      } finally {
        setDescartando(null)
      }
    },
    [descartarInteres, recargar]
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
    descartando,

    // Acciones
    handleDescartar,
    filtrarPorEstado,
    recargar,
  }
}
