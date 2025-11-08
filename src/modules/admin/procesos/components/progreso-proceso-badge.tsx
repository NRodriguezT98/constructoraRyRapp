/**
 * 🏷️ COMPONENTE: Badge de Progreso de Proceso
 *
 * Badge compacto que muestra el progreso del proceso del cliente.
 * Diseñado para usarse en headers o cards como resumen visual rápido.
 *
 * Muestra:
 * - Porcentaje de progreso
 * - Último paso completado
 * - Próximo paso pendiente
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock, Loader2 } from 'lucide-react'

import { useProgresoCliente } from '../hooks'

interface ProgresoProcesoBadgeProps {
  clienteId: string
  variant?: 'compact' | 'expanded'
}

export function ProgresoProcesoBadge({ clienteId, variant = 'compact' }: ProgresoProcesoBadgeProps) {
  const { progreso, ultimoPasoCompletado, proximoPasoPendiente, loading, error } = useProgresoCliente({ clienteId })

  // No mostrar nada si está cargando o no hay progreso
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
        <Loader2 className="w-4 h-4 animate-spin text-white/70" />
        <span className="text-xs text-white/70">Cargando proceso...</span>
      </div>
    )
  }

  if (error || !progreso || progreso.totalPasos === 0) {
    return null  // No mostrar si hay error o no hay proceso
  }

  const porcentaje = progreso.porcentajeCompletado

  // Determinar color según porcentaje
  const getColorClass = () => {
    if (porcentaje === 100) return 'from-green-500 to-emerald-600'
    if (porcentaje >= 75) return 'from-blue-500 to-cyan-600'
    if (porcentaje >= 50) return 'from-purple-500 to-pink-600'
    if (porcentaje >= 25) return 'from-amber-500 to-orange-600'
    return 'from-gray-500 to-slate-600'
  }

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: string | null | undefined) => {
    if (!fecha) return ''
    const date = new Date(fecha)
    return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })
  }

  // Versión compacta: Solo badge con porcentaje
  if (variant === 'compact') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                     bg-gradient-to-r ${getColorClass()}
                     shadow-lg backdrop-blur-sm`}
        >
          {porcentaje === 100 ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <Clock className="w-4 h-4 text-white" />
          )}
          <span className="text-xs font-semibold text-white">
            Proceso: {porcentaje}%
          </span>
          <span className="text-xs text-white/80">
            ({progreso.pasosCompletados + progreso.pasosOmitidos}/{progreso.totalPasos})
          </span>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Versión expandida: Con detalles de pasos en layout horizontal
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden"
      >
        {/* Layout horizontal */}
        <div className="p-2.5 flex items-center gap-4">
          {/* Barra de progreso con info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-[11px] font-semibold text-white/90">
                Proceso de Compra
              </span>
              <span className="text-[11px] font-bold text-white ml-auto">
               {porcentaje}% · {progreso.pasosCompletados + progreso.pasosOmitidos}/{progreso.totalPasos}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${porcentaje}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${getColorClass()} shadow-sm`}
              />
            </div>
          </div>

          {/* Si está completado (100%), solo mostrar mensaje */}
          {porcentaje === 100 ? (
            <>
              {/* Separador vertical */}
              <div className="h-10 w-px bg-white/20" />

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <div className="text-xs font-semibold text-green-300 whitespace-nowrap">
                  ¡Proceso completado! 🎉
                </div>
              </div>
            </>
          ) : (
            /* Si NO está completado, mostrar último paso y próximo paso */
            <>
              {/* Último paso completado */}
              {ultimoPasoCompletado && (
                <>
                  {/* Separador vertical */}
                  <div className="h-10 w-px bg-white/20" />

                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium text-green-300/80">
                        Último: {ultimoPasoCompletado.fechaCompletado && formatearFecha(ultimoPasoCompletado.fechaCompletado)}
                      </div>
                      <div className="text-xs font-medium text-white truncate">
                        {ultimoPasoCompletado.nombre}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Próximo paso pendiente */}
              {proximoPasoPendiente && (
                <>
                  {/* Separador vertical */}
                  <div className="h-10 w-px bg-white/20" />

                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium text-blue-300/80">
                        Próximo paso
                      </div>
                      <div className="text-xs font-medium text-white truncate">
                        {proximoPasoPendiente.nombre}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
