/**
 * ============================================
 * HOOK: useUltimosAbonosSection
 * ============================================
 *
 * Lógica de filtrado y cálculos de abonos
 */

import { useMemo } from 'react'

interface Abono {
  id: string
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_recibo?: string
  observaciones?: string
}

interface UseUltimosAbonosSectionProps {
  abonos: Abono[]
  limite?: number
}

export function useUltimosAbonosSection({ abonos, limite = 5 }: UseUltimosAbonosSectionProps) {
  // =====================================================
  // CÁLCULOS COMPUTADOS (con memoización)
  // =====================================================

  /**
   * Abonos a mostrar (limitados)
   */
  const abonosMostrar = useMemo(() => {
    return abonos.slice(0, limite)
  }, [abonos, limite])

  /**
   * Total de abonos mostrados
   */
  const totalMostrados = useMemo(() => {
    return abonosMostrar.reduce((sum, a) => sum + a.monto, 0)
  }, [abonosMostrar])

  /**
   * Determinar si hay más abonos
   */
  const hayMasAbonos = useMemo(() => {
    return abonos.length > limite
  }, [abonos.length, limite])

  /**
   * Mensaje de subtítulo
   */
  const subtitulo = useMemo(() => {
    if (abonos.length === 0) {
      return 'No hay abonos registrados'
    }
    return `${abonosMostrar.length} de ${abonos.length} abonos`
  }, [abonos.length, abonosMostrar.length])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    abonosMostrar,
    totalMostrados,
    hayMasAbonos,
    subtitulo,
    tieneAbonos: abonosMostrar.length > 0,
  }
}
