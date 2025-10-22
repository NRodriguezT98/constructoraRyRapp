/**
 * Hook: useNegociacionDetalle
 *
 * Hook mejorado para la vista de detalle de negociación
 * Incluye gestión de tabs, abonos y documentos
 *
 * ⚠️ NOMBRES VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
 */

'use client'

import { useNegociacion } from '@/modules/clientes/hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'

type TabType = 'informacion' | 'fuentes-pago' | 'abonos' | 'timeline'

interface UseNegociacionDetalleProps {
  negociacionId: string
}

export function useNegociacionDetalle({ negociacionId }: UseNegociacionDetalleProps) {
  // Hook base de negociación
  const hookBase = useNegociacion(negociacionId)

  // Estado adicional
  const [activeTab, setActiveTab] = useState<TabType>('informacion')
  const [abonos, setAbonos] = useState<any[]>([])
  const [cargandoAbonos, setCargandoAbonos] = useState(false)

  /**
   * Cargar abonos de la negociación
   */
  const cargarAbonos = useCallback(async () => {
    try {
      setCargandoAbonos(true)
      // TODO: Implementar servicio de abonos cuando esté disponible
      // const abonosData = await negociacionesService.obtenerAbonos(negociacionId)
      const abonosData: any[] = []
      setAbonos(abonosData)
    } catch (err) {
      console.error('Error cargando abonos:', err)
      setAbonos([])
    } finally {
      setCargandoAbonos(false)
    }
  }, [negociacionId])

  /**
   * Cargar abonos al montar o cambiar negociación
   */
  useEffect(() => {
    if (negociacionId && !hookBase.cargando) {
      cargarAbonos()
    }
  }, [negociacionId, hookBase.cargando, cargarAbonos])

  /**
   * Calcular totales de pagos
   */
  const totalesPago = useMemo(() => {
    const totalPagado = abonos.reduce((sum, abono) => sum + (abono.monto || 0), 0)
    const valorTotal = hookBase.negociacion?.valor_total || 0
    const saldoPendiente = valorTotal - totalPagado
    const porcentajePagado = valorTotal > 0 ? (totalPagado / valorTotal) * 100 : 0

    return {
      totalPagado,
      saldoPendiente,
      porcentajePagado,
      valorTotal,
    }
  }, [abonos, hookBase.negociacion])

  /**
   * Recargar todos los datos
   */
  const recargarTodo = useCallback(async () => {
    await hookBase.recargarNegociacion()
    await cargarAbonos()
  }, [hookBase, cargarAbonos])

  /**
   * Suspender negociación
   */
  const suspenderNegociacion = useCallback(async (motivo: string) => {
    if (!motivo?.trim()) {
      return false
    }

    const actualizado = await hookBase.actualizarNegociacion({
      estado: 'Suspendida',
      notas: `${hookBase.negociacion?.notas || ''}\n\n[SUSPENDIDA] ${new Date().toLocaleDateString()}: ${motivo}`.trim(),
    })

    if (actualizado) {
      await recargarTodo()
    }

    return actualizado
  }, [hookBase, recargarTodo])

  /**
   * Reactivar negociación suspendida
   */
  const reactivarNegociacion = useCallback(async () => {
    const actualizado = await hookBase.actualizarNegociacion({
      estado: 'Activa',
      notas: `${hookBase.negociacion?.notas || ''}\n\n[REACTIVADA] ${new Date().toLocaleDateString()}`.trim(),
    })

    if (actualizado) {
      await recargarTodo()
    }

    return actualizado
  }, [hookBase, recargarTodo])

  /**
   * Verificar si puede completarse automáticamente
   * Una negociación se completa cuando el 100% está pagado
   */
  const puedeCompletarseAuto = useMemo(() => {
    return hookBase.esActiva && totalesPago.porcentajePagado >= 100
  }, [hookBase.esActiva, totalesPago.porcentajePagado])

  return {
    // Del hook base
    ...hookBase,

    // Estado de tabs
    activeTab,
    setActiveTab,

    // Abonos
    abonos,
    cargandoAbonos,
    totalesPago,

    // Acciones adicionales
    suspenderNegociacion,
    reactivarNegociacion,
    recargarTodo,

    // Helpers
    puedeCompletarseAuto,
  }
}
