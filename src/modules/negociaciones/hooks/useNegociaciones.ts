/**
 * Hook principal del módulo de Negociaciones
 *
 * Gestiona la lógica de negocio siguiendo arquitectura limpia:
 * - Separación de responsabilidades
 * - Performance optimizado (useMemo, useCallback)
 * - TypeScript estricto
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { negociacionesGlobalService } from '../services/negociaciones-global.service'
import type {
    FiltrosNegociaciones,
    MetricasNegociaciones,
    NegociacionConRelaciones,
} from '../types'

export function useNegociaciones() {
  // ============================================
  // ESTADO
  // ============================================
  const [negociaciones, setNegociaciones] = useState<NegociacionConRelaciones[]>([])
  const [metricas, setMetricas] = useState<MetricasNegociaciones | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosNegociaciones>({})
  const [busqueda, setBusqueda] = useState('')

  // ============================================
  // CARGAR NEGOCIACIONES
  // ============================================
  const cargarNegociaciones = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const filtrosCompletos: FiltrosNegociaciones = {
        ...filtros,
        busqueda: busqueda.trim() || undefined,
      }

      const [negociacionesData, metricasData] = await Promise.all([
        negociacionesGlobalService.obtenerNegociaciones(filtrosCompletos),
        negociacionesGlobalService.obtenerMetricas(),
      ])

      setNegociaciones(negociacionesData)
      setMetricas(metricasData)
    } catch (err) {
      console.error('❌ Error al cargar negociaciones:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [filtros, busqueda])

  // Cargar al montar y cuando cambien filtros
  useEffect(() => {
    cargarNegociaciones()
  }, [cargarNegociaciones])

  // ============================================
  // FILTROS
  // ============================================
  const aplicarFiltroEstado = useCallback((estado: string | undefined) => {
    setFiltros((prev) => ({
      ...prev,
      estado: estado as any,
    }))
  }, [])

  const aplicarFiltroFechas = useCallback((desde?: string, hasta?: string) => {
    setFiltros((prev) => ({
      ...prev,
      fecha_desde: desde,
      fecha_hasta: hasta,
    }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({})
    setBusqueda('')
  }, [])

  // ============================================
  // NEGOCIACIONES FILTRADAS (useMemo para performance)
  // ============================================
  const negociacionesFiltradas = useMemo(() => {
    return negociaciones
  }, [negociaciones])

  // ============================================
  // UTILIDADES
  // ============================================
  const formatearMoneda = useCallback((valor: number): string => {
    return valor.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }, [])

  const formatearFecha = useCallback((fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [])

  const obtenerColorEstado = useCallback((estado: string) => {
    const colores = {
      // ✅ ESTADOS ACTUALIZADOS (2025-10-22)
      // Consultar: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
      Activa: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-700',
      },
      Suspendida: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-700',
      },
      'Cerrada por Renuncia': {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-700',
      },
      Completada: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-700',
      },
    }
    return colores[estado as keyof typeof colores] || colores['Activa']
  }, [])

  // ============================================
  // RETURN
  // ============================================
  return {
    // Data
    negociaciones: negociacionesFiltradas,
    metricas,

    // Estado
    isLoading,
    error,

    // Filtros
    filtros,
    busqueda,
    setBusqueda,
    aplicarFiltroEstado,
    aplicarFiltroFechas,
    limpiarFiltros,

    // Acciones
    recargar: cargarNegociaciones,

    // Utilidades
    formatearMoneda,
    formatearFecha,
    obtenerColorEstado,
  }
}
