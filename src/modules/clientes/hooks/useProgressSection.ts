/**
 * ============================================
 * HOOK: useProgressSection
 * ============================================
 *
 * Lógica de cálculos de progreso de pago
 */

import { useMemo } from 'react'

interface UseProgressSectionProps {
  valorNegociado: number
  descuento: number
  totalAbonado: number
  totalFuentesPago: number
}

export function useProgressSection({
  valorNegociado,
  descuento,
  totalAbonado,
  totalFuentesPago,
}: UseProgressSectionProps) {
  // =====================================================
  // CÁLCULOS COMPUTADOS (con memoización)
  // =====================================================

  /**
   * Valor final después de descuento
   */
  const valorFinal = useMemo(() => {
    return valorNegociado - descuento
  }, [valorNegociado, descuento])

  /**
   * Porcentaje pagado (abonos / valor final)
   */
  const porcentajePagado = useMemo(() => {
    if (valorFinal <= 0) return 0
    return (totalAbonado / valorFinal) * 100
  }, [totalAbonado, valorFinal])

  /**
   * Porcentaje de fuentes configuradas
   */
  const porcentajeFuentes = useMemo(() => {
    if (valorFinal <= 0) return 0
    return (totalFuentesPago / valorFinal) * 100
  }, [totalFuentesPago, valorFinal])

  /**
   * Saldo pendiente de pago
   */
  const saldoPendiente = useMemo(() => {
    return valorFinal - totalAbonado
  }, [valorFinal, totalAbonado])

  /**
   * Valores para display (formateados)
   */
  const valoresDisplay = useMemo(() => {
    return {
      valorNegociado,
      descuento,
      valorFinal,
      totalAbonado,
      saldoPendiente,
      porcentajePagado: Math.min(porcentajePagado, 100),
      porcentajeFuentes: Math.min(porcentajeFuentes, 100),
      porcentajePagadoTexto: porcentajePagado.toFixed(1),
      porcentajeFuentesTexto: porcentajeFuentes.toFixed(1),
    }
  }, [valorNegociado, descuento, valorFinal, totalAbonado, saldoPendiente, porcentajePagado, porcentajeFuentes])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    valoresDisplay,
    tieneDescuento: descuento > 0,
  }
}
