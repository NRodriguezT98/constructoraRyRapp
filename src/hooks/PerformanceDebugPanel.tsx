/**
 * 🎛️ PANEL DE DEBUG DE RENDIMIENTO
 *
 * Muestra métricas en tiempo real durante desarrollo
 * Presiona Ctrl+Shift+P para mostrar/ocultar
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Activity, BarChart3, Clock, Download, RefreshCw, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { clearMetrics, exportMetricsReport, useGlobalMetrics } from './usePerformanceMonitor'

export function PerformanceDebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const { allMetrics, averageTime, slowestRoute, totalNavigations } = useGlobalMetrics()
  const pathname = usePathname()

  // Toggle con Ctrl+Shift+P
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Auto-refresh cada 500ms
  const [, setRefresh] = useState(0)
  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(() => setRefresh(r => r + 1), 500)
    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        title="Presiona Ctrl+Shift+P"
      >
        <Activity className="h-4 w-4" />
        Perf Monitor
      </button>
    )
  }

  const currentRouteMetrics = allMetrics.filter(m => m.route === pathname).slice(-5)
  const lastMetric = currentRouteMetrics[currentRouteMetrics.length - 1]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        drag
        dragMomentum={false}
        onDragEnd={(_, info) => {
          setPosition({
            x: position.x + info.offset.x,
            y: position.y + info.offset.y,
          })
        }}
        style={{
          left: position.x,
          top: position.y,
        }}
        className="fixed z-[9999] w-96 select-none rounded-xl border border-gray-200 bg-white/95 shadow-2xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-white" />
            <h3 className="font-bold text-white">Performance Monitor</h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[600px] overflow-y-auto p-4">
          {/* Ruta Actual */}
          <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
            <div className="mb-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
              RUTA ACTUAL
            </div>
            <div className="font-mono text-sm text-purple-900 dark:text-purple-100">
              {pathname}
            </div>
          </div>

          {/* Métricas Globales */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <BarChart3 className="h-3 w-3" />
                <span>Navegaciones</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {totalNavigations}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Promedio</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {averageTime.toFixed(0)}
                <span className="ml-1 text-xs text-gray-500">ms</span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <RefreshCw className="h-3 w-3" />
                <span>Renders</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {lastMetric?.renderCount || 0}
              </div>
            </div>
          </div>

          {/* Última Métrica */}
          {lastMetric && (
            <div className="mb-4 space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                ÚLTIMA CARGA
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 dark:text-blue-400">Primer Render</span>
                <span className="font-mono text-sm font-bold text-blue-900 dark:text-blue-100">
                  {lastMetric.firstRender.toFixed(2)} ms
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 dark:text-blue-400">Datos Cargados</span>
                <span className="font-mono text-sm font-bold text-blue-900 dark:text-blue-100">
                  {lastMetric.dataLoaded?.toFixed(2) || 'N/A'} ms
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-blue-200 pt-2 dark:border-blue-800">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  TIEMPO TOTAL
                </span>
                <span
                  className={`font-mono text-lg font-bold ${
                    lastMetric.totalTime > 1000
                      ? 'text-red-600 dark:text-red-400'
                      : lastMetric.totalTime > 500
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {lastMetric.totalTime.toFixed(2)} ms
                </span>
              </div>
            </div>
          )}

          {/* Ruta Más Lenta */}
          {slowestRoute.route && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
              <div className="mb-2 text-xs font-semibold text-red-700 dark:text-red-300">
                RUTA MÁS LENTA
              </div>
              <div className="mb-1 font-mono text-xs text-red-900 dark:text-red-100">
                {slowestRoute.route}
              </div>
              <div className="font-mono text-lg font-bold text-red-600 dark:text-red-400">
                {slowestRoute.totalTime.toFixed(2)} ms
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearMetrics()
                setIsVisible(false)
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <RefreshCw className="h-3 w-3" />
              Limpiar
            </button>
            <button
              onClick={() => {
                exportMetricsReport()
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-xs font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700"
            >
              <Download className="h-3 w-3" />
              Exportar
            </button>
          </div>

          {/* Ayuda */}
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            <div className="mb-1 font-semibold">Atajos:</div>
            <div>• <kbd className="rounded bg-gray-200 px-1 dark:bg-gray-700">Ctrl+Shift+P</kbd> - Toggle panel</div>
            <div>• Arrastra para mover</div>
            <div>• Las métricas se actualizan automáticamente</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
