/**
 * ============================================
 * HOOK: useFuentesPagoSection
 * ============================================
 *
 * Lógica de cálculos y validación de fuentes de pago
 */

import { useMemo } from 'react'

interface FuentePago {
  tipo: 'Cuota Inicial' | 'Crédito Bancario' | 'Subsidio' | 'Otros'
  monto: number
  detalles?: string
  entidad?: string
  numero_referencia?: string
  monto_recibido?: number
}

interface UseFuentesPagoSectionProps {
  fuentesPago: FuentePago[]
  valorTotal: number
  negociacionEstado?: string
}

export function useFuentesPagoSection({
  fuentesPago,
  valorTotal,
  negociacionEstado = 'Activa',
}: UseFuentesPagoSectionProps) {
  // =====================================================
  // CÁLCULOS COMPUTADOS (con memoización)
  // =====================================================

  /**
   * Total de fuentes configuradas
   */
  const totalFuentes = useMemo(() => {
    return fuentesPago.reduce((sum, f) => sum + f.monto, 0)
  }, [fuentesPago])

  /**
   * Porcentaje del valor total cubierto por fuentes
   */
  const porcentajeCubierto = useMemo(() => {
    if (valorTotal <= 0) return 0
    return (totalFuentes / valorTotal) * 100
  }, [totalFuentes, valorTotal])

  /**
   * Fuentes con información computada (porcentaje individual, estado)
   */
  const fuentesConInfo = useMemo(() => {
    return fuentesPago.map(fuente => {
      const porcentaje = valorTotal > 0 ? (fuente.monto / valorTotal) * 100 : 0
      const estaCompletada = fuente.monto_recibido ? fuente.monto_recibido >= fuente.monto : false

      return {
        ...fuente,
        porcentaje: Math.min(porcentaje, 100),
        porcentajeTexto: porcentaje.toFixed(0),
        estaCompletada,
      }
    })
  }, [fuentesPago, valorTotal])

  /**
   * Determinar si se puede editar
   */
  const puedeEditar = useMemo(() => {
    return negociacionEstado === 'Activa'
  }, [negociacionEstado])

  /**
   * Tooltip para botón de editar
   */
  const tooltipEditar = useMemo(() => {
    return puedeEditar
      ? 'Editar fuentes de pago configuradas'
      : 'No se pueden editar fuentes de pago en negociaciones cerradas o suspendidas'
  }, [puedeEditar])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    totalFuentes,
    porcentajeCubierto: porcentajeCubierto.toFixed(0),
    fuentesConInfo,
    puedeEditar,
    tooltipEditar,
    tieneFuentes: fuentesPago.length > 0,
  }
}
