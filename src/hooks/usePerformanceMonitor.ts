/**
 * 🔬 HOOK DE MEDICIÓN DE RENDIMIENTO
 *
 * Mide tiempos de navegación, carga de componentes y renders
 * Útil para diagnosticar cuellos de botella
 */

'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

interface PerformanceMetrics {
  route: string
  navigationStart: number
  firstRender: number
  dataLoaded?: number
  totalTime: number
  renderCount: number
}

// Store global de métricas
const metricsStore: PerformanceMetrics[] = []

export function usePerformanceMonitor(componentName?: string) {
  const pathname = usePathname()
  const renderCount = useRef(0)
  const navigationStartRef = useRef<number>(0)
  const firstRenderRef = useRef<number>(0)
  const isFirstRender = useRef(true)
  const hasLoggedData = useRef(false) // ⭐ NUEVO: evita múltiples logs

  useEffect(() => {
    renderCount.current += 1

    // Marcar inicio de navegación
    if (isFirstRender.current) {
      navigationStartRef.current = performance.now()
      firstRenderRef.current = performance.now()
      isFirstRender.current = false

      // Log en consola con estilo
      console.log(
        `%c🚀 NAVEGACIÓN → ${pathname}${componentName ? ` (${componentName})` : ''}`,
        'background: #4F46E5; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      )
    }

    return () => {
      // Cleanup - no hacer nada
    }
  }, [pathname, componentName])

  // ⭐ useCallback garantiza que la función sea estable
  const markDataLoaded = useCallback(() => {
    if (hasLoggedData.current) return // ⭐ Evita llamadas múltiples

    const now = performance.now()
    const totalTime = now - navigationStartRef.current

    const metric: PerformanceMetrics = {
      route: pathname,
      navigationStart: navigationStartRef.current,
      firstRender: firstRenderRef.current - navigationStartRef.current,
      dataLoaded: now - navigationStartRef.current,
      totalTime,
      renderCount: renderCount.current,
    }

    metricsStore.push(metric)
    hasLoggedData.current = true // ⭐ Marca como registrado

    // Log detallado en consola
    console.group(`%c📊 MÉTRICAS - ${pathname}`, 'color: #10B981; font-weight: bold;')
    console.log(`%c⏱️  Primer Render:`, 'color: #3B82F6', `${metric.firstRender.toFixed(2)}ms`)
    console.log(`%c📦 Datos Cargados:`, 'color: #8B5CF6', `${metric.dataLoaded.toFixed(2)}ms`)
    console.log(`%c🎯 Tiempo Total:`, 'color: #EF4444', `${totalTime.toFixed(2)}ms`)
    console.log(`%c🔄 Re-renders:`, 'color: #F59E0B', renderCount.current)

    // Advertencias de rendimiento
    if (totalTime > 1000) {
      console.warn(`⚠️  LENTO: La carga tomó más de 1 segundo`)
    }
    if (renderCount.current > 5) {
      console.warn(`⚠️  MUCHOS RE-RENDERS: ${renderCount.current} renders`)
    }

    console.groupEnd()
  }, [pathname]) // ⭐ Solo depende del pathname

  // ⭐ useCallback para mark también
  const mark = useCallback((eventName: string) => {
    const now = performance.now()
    const elapsed = now - navigationStartRef.current

    console.log(
      `%c🔖 ${eventName}`,
      'color: #6366F1; font-weight: bold;',
      `+${elapsed.toFixed(2)}ms`
    )
  }, [])

  return {
    markDataLoaded,
    mark,
    renderCount: renderCount.current,
  }
}

// Hook para mostrar métricas globales
export function useGlobalMetrics() {
  // ⭐ Directamente retornamos los datos del store sin useState
  const averageTime = metricsStore.length > 0
    ? metricsStore.reduce((sum, m) => sum + m.totalTime, 0) / metricsStore.length
    : 0

  const slowestRoute = metricsStore.length > 0
    ? metricsStore.reduce((slowest, current) =>
        current.totalTime > slowest.totalTime ? current : slowest
      )
    : { route: '', totalTime: 0 }

  return {
    allMetrics: metricsStore,
    averageTime,
    slowestRoute,
    totalNavigations: metricsStore.length,
  }
}

// Función para limpiar métricas
export function clearMetrics() {
  metricsStore.length = 0
  console.clear()
  console.log('%c🧹 Métricas limpiadas', 'color: #10B981; font-weight: bold;')
}

// Función para exportar reporte
export function exportMetricsReport() {
  const report = {
    timestamp: new Date().toISOString(),
    metrics: metricsStore,
    summary: {
      totalNavigations: metricsStore.length,
      averageTime: metricsStore.reduce((sum, m) => sum + m.totalTime, 0) / metricsStore.length,
      slowest: metricsStore.reduce((slowest, current) =>
        current.totalTime > slowest.totalTime ? current : slowest
      ),
      fastest: metricsStore.reduce((fastest, current) =>
        current.totalTime < fastest.totalTime ? current : fastest
      ),
    }
  }

  console.log('%c📄 REPORTE DE RENDIMIENTO', 'background: #3B82F6; color: white; padding: 8px; font-size: 14px; font-weight: bold;')
  console.table(metricsStore)
  console.log('Resumen:', report.summary)

  // Copiar al portapapeles (si está disponible)
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
    console.log('%c✅ Reporte copiado al portapapeles', 'color: #10B981;')
  }

  return report
}
