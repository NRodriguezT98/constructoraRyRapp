/**
 * ============================================
 * HOOK: useNegociacionesQuery
 * ============================================
 *
 * ✅ REACT QUERY + SEPARACIÓN DE RESPONSABILIDADES
 * Hook que maneja data fetching con React Query para negociaciones.
 *
 * Ventajas React Query:
 * - Cache automático de negociaciones
 * - Refetch en background
 * - Loading/error states optimizados
 * - Invalidación de cache selectiva
 * - Sincronización entre tabs/ventanas
 *
 * @version 2.0.0 - 2025-01-26 (Migrado a React Query)
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { obtenerFuentesPagoConAbonos } from '@/modules/abonos/services/abonos.service'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'

// ============================================
// QUERY KEYS (Centralizar para invalidación)
// ============================================

export const negociacionesQueryKeys = {
  all: ['negociaciones'] as const,
  byCliente: (clienteId: string) => [...negociacionesQueryKeys.all, 'cliente', clienteId] as const,
  detalle: (negociacionId: string) => [...negociacionesQueryKeys.all, 'detalle', negociacionId] as const,
  fuentesPago: (negociacionId: string) => ['fuentesPago', negociacionId] as const,
}

// ============================================
// TYPES
// ============================================

export interface NegociacionDetalle {
  id: string
  estado: string
  valor_negociado: number
  descuento_aplicado: number
  proyecto?: { nombre: string; id: string }
  vivienda?: {
    id: string
    numero: string
    manzanas?: { nombre: string; id: string }
  }
  fecha_negociacion: string
  fecha_creacion?: string
  fecha_completada?: string
}

export interface NegociacionConValores extends NegociacionDetalle {
  valorBase: number
  descuento: number
  valorFinal: number
}

interface FuentePago {
  id: string
  tipo: string
  monto: number // ✅ Cambiar de monto_aprobado a monto (como viene del service)
  entidad?: string
  numero_referencia?: string
  detalles?: string // ✅ Cambiar de observaciones a detalles
  monto_recibido: number
  abonos?: any[]
}

interface Abono {
  id: string
  monto: number
  fecha_abono: string
  metodo_pago?: string
  numero_recibo?: string
  observaciones?: string
  comprobante_url?: string
}

// ============================================
// HOOK PRINCIPAL
// ============================================

interface UseNegociacionesQueryProps {
  clienteId: string
  enabled?: boolean
}

export function useNegociacionesQuery({ clienteId, enabled = true }: UseNegociacionesQueryProps) {
  const queryClient = useQueryClient()

  // =====================================================
  // QUERY: Lista de negociaciones del cliente
  // =====================================================

  const {
    data: negociaciones = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: negociacionesQueryKeys.byCliente(clienteId),
    queryFn: async () => {
      console.log('📊 [useNegociacionesQuery] Fetching negociaciones para cliente:', clienteId)
      const data = await negociacionesService.obtenerNegociacionesCliente(clienteId)
      return data as NegociacionDetalle[]
    },
    enabled: enabled && !!clienteId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
  })

  // =====================================================
  // CÁLCULOS COMPUTADOS
  // =====================================================

  /**
   * Negociaciones con valores calculados (memoizado)
   */
  const negociacionesConValores = useMemo((): NegociacionConValores[] => {
    return negociaciones.map((neg) => {
      const valorBase = neg.valor_negociado || 0
      const descuento = neg.descuento_aplicado || 0
      const valorFinal = valorBase - descuento

      return {
        ...neg,
        valorBase,
        descuento,
        valorFinal,
      }
    })
  }, [negociaciones])

  /**
   * Estadísticas rápidas (para header)
   */
  const stats = useMemo(() => {
    const activas = negociacionesConValores.filter((n) => n.estado === 'Activa').length
    const completadas = negociacionesConValores.filter((n) => n.estado === 'Completada').length
    const suspendidas = negociacionesConValores.filter((n) => n.estado === 'Suspendida').length

    return {
      total: negociacionesConValores.length,
      activas,
      completadas,
      suspendidas,
    }
  }, [negociacionesConValores])

  // =====================================================
  // INVALIDACIÓN DE CACHE (React Query)
  // =====================================================

  /**
   * Invalidar cache de negociaciones (forzar refetch)
   */
  const invalidarNegociaciones = useCallback(() => {
    console.log('🔄 [useNegociacionesQuery] Invalidando cache de negociaciones')
    queryClient.invalidateQueries({ queryKey: negociacionesQueryKeys.byCliente(clienteId) })
  }, [clienteId, queryClient])

  /**
   * Invalidar todas las negociaciones (global)
   */
  const invalidarTodasNegociaciones = useCallback(() => {
    console.log('🔄 [useNegociacionesQuery] Invalidando TODAS las negociaciones')
    queryClient.invalidateQueries({ queryKey: negociacionesQueryKeys.all })
  }, [queryClient])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Data
    negociaciones: negociacionesConValores,
    stats,

    // Estado de carga
    isLoading,
    error,

    // Acciones
    refetch,
    invalidarNegociaciones,
    invalidarTodasNegociaciones,
  }
}

// ============================================
// HOOK: Detalle de negociación (fuentes + abonos)
// ============================================

interface UseNegociacionDetalleProps {
  negociacionId: string | null
  enabled?: boolean
}

export function useNegociacionDetalle({ negociacionId, enabled = true }: UseNegociacionDetalleProps) {
  // =====================================================
  // QUERY: Fuentes de pago con abonos
  // =====================================================

  const {
    data: fuentesPago = [],
    isLoading: isLoadingFuentes,
    error: errorFuentes,
  } = useQuery({
    queryKey: negociacionesQueryKeys.fuentesPago(negociacionId || ''),
    queryFn: async () => {
      if (!negociacionId) return []

      console.log('💰 [useNegociacionDetalle] Fetching fuentes de pago:', negociacionId)
      const data = await obtenerFuentesPagoConAbonos(negociacionId)
      return data as FuentePago[]
    },
    enabled: enabled && !!negociacionId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
  })

  // =====================================================
  // CÁLCULOS COMPUTADOS
  // =====================================================

  /**
   * Todos los abonos de todas las fuentes (ordenados)
   */
  const abonos = useMemo((): Abono[] => {
    const todosAbonos = fuentesPago.flatMap((fuente) => fuente.abonos || [])

    // Ordenar por fecha descendente
    return todosAbonos.sort(
      (a: any, b: any) => new Date(b.fecha_abono).getTime() - new Date(a.fecha_abono).getTime()
    )
  }, [fuentesPago])

  /**
   * Totales calculados
   */
  const totales = useMemo(() => {
    const totalFuentesPago = fuentesPago.reduce((sum, fuente) => sum + (fuente.monto || 0), 0)
    const totalAbonado = abonos.reduce((sum, abono) => sum + (abono.monto || 0), 0)

    return {
      totalFuentesPago,
      totalAbonado,
      saldoPendiente: totalFuentesPago - totalAbonado,
      porcentajePagado: totalFuentesPago > 0 ? (totalAbonado / totalFuentesPago) * 100 : 0,
    }
  }, [fuentesPago, abonos])

  /**
   * Fuentes transformadas (formato UI)
   */
  const fuentesTransformadas = useMemo(() => {
    return fuentesPago.map((fuente) => ({
      id: fuente.id, // ✅ Incluir id para edición
      tipo: fuente.tipo,
      monto: fuente.monto || 0, // ✅ Ya viene como 'monto' desde el service
      entidad: fuente.entidad || undefined,
      numero_referencia: fuente.numero_referencia || undefined,
      detalles: fuente.detalles || undefined, // ✅ Usar 'detalles' no 'observaciones'
      monto_recibido: fuente.monto_recibido || 0,
    }))
  }, [fuentesPago])

  /**
   * Último abono registrado + días desde último pago
   */
  const ultimoAbono = abonos.length > 0 ? abonos[0] : null

  const diasDesdeUltimoAbono = useMemo(() => {
    if (!ultimoAbono?.fecha_abono) return null

    const fechaAbono = new Date(ultimoAbono.fecha_abono)
    const hoy = new Date()
    const diffTime = Math.abs(hoy.getTime() - fechaAbono.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }, [ultimoAbono])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Data
    fuentesPago: fuentesTransformadas,
    abonos,
    totales,
    ultimoAbono,
    diasDesdeUltimoAbono,

    // Estado de carga
    isLoading: isLoadingFuentes,
    error: errorFuentes,
  }
}
