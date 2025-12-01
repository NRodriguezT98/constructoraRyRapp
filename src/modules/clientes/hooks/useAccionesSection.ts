/**
 * ============================================
 * HOOK: useAccionesSection
 * ============================================
 *
 * Lógica de habilitación de acciones según estado de negociación
 */

import { useMemo } from 'react'

interface UseAccionesSectionProps {
  estado: string
  disabled?: boolean
}

export function useAccionesSection({ estado, disabled = false }: UseAccionesSectionProps) {
  // =====================================================
  // CÁLCULOS COMPUTADOS (con memoización)
  // =====================================================

  const estadosComputados = useMemo(() => {
    const isActiva = estado === 'Activa'
    const isSuspendida = estado === 'Suspendida'
    const isCerrada = estado === 'Cerrada por Renuncia' || estado === 'Completada'

    return {
      isActiva,
      isSuspendida,
      isCerrada,
    }
  }, [estado])

  /**
   * Determinar si cada acción está habilitada
   */
  const accionesHabilitadas = useMemo(() => {
    const { isCerrada } = estadosComputados

    return {
      registrarAbono: !disabled && !isCerrada,
      renunciar: !disabled && !isCerrada,
      generarPDF: !disabled,
    }
  }, [disabled, estadosComputados])

  /**
   * Tooltips para cada acción
   */
  const tooltips = useMemo(() => {
    const { isCerrada } = estadosComputados

    return {
      registrarAbono: isCerrada
        ? 'No se pueden registrar abonos en negociaciones cerradas'
        : 'Registrar un nuevo pago para esta negociación',
      renunciar: isCerrada
        ? 'Esta negociación ya está cerrada'
        : 'Cerrar esta negociación por renuncia del cliente',
      generarPDF: 'Descargar resumen de la negociación en PDF',
    }
  }, [estadosComputados])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    estadosComputados,
    accionesHabilitadas,
    tooltips,
  }
}
