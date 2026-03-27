/**
 * ConfirmarCambiosModal - Componente COMPARTIDO entre módulos
 * ✅ Theming dinámico por moduleName
 * ✅ Estados: idle → loading → success/error con animaciones
 * ✅ Reutilizable en proyectos, viviendas, clientes, etc.
 */

'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Loader2,
    RefreshCcw,
    Sparkles,
    X,
    XCircle,
} from 'lucide-react'

import type { ModuleName } from '@/shared/config/module-themes'

import {
    CONFETTI_COLORS,
    CONFETTI_PARTICLES,
    MODAL_BADGE_BG,
    MODAL_BADGE_STRONG,
    MODAL_BADGE_TEXT,
    MODAL_BTN_CONFIRM,
    MODAL_CAT_ICON_BG,
    MODAL_DOTS,
    MODAL_GRADIENT,
    MODAL_REDIRECT_TEXT,
    MODAL_RING,
    MODAL_SPINNER,
    MODAL_SUCCESS_BG,
    MODAL_SUCCESS_GLOW,
    modalAnimations,
} from './ConfirmarCambiosModal.styles'

// ── Tipos exportados ─────────────────────────────────────────────
export type EstadoModal = 'idle' | 'loading' | 'success' | 'error'

export interface CambioDetectado {
  campo: string
  label: string
  valorAnterior: string | number
  valorNuevo: string | number
  icono: any
  categoria: string
}

export interface CategoriaConfig {
  titulo: string
  icono: any
}

interface ConfirmarCambiosModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cambios: CambioDetectado[]
  categoriasConfig: Record<string, CategoriaConfig>
  moduleName?: ModuleName
  tituloEntidad?: string

  /** @deprecated Usar `estado` en su lugar */
  isLoading?: boolean

  /** Estado actual de la modal */
  estado?: EstadoModal
  /** Texto durante loading (ej: "Actualizando proyecto...") */
  mensajeLoading?: string
  /** Título de éxito (ej: "¡Proyecto actualizado!") */
  mensajeExito?: string
  /** Subtítulo de éxito (ej: "Redirigiendo al listado...") */
  subtituloExito?: string
  /** Texto de error */
  mensajeError?: string
  /** Callback al reintentar en error */
  onRetry?: () => void
}

export function ConfirmarCambiosModal({
  isOpen,
  onClose,
  onConfirm,
  cambios,
  categoriasConfig,
  moduleName = 'proyectos',
  tituloEntidad = 'registro',
  isLoading = false,
  estado: estadoProp,
  mensajeLoading = 'Guardando cambios...',
  mensajeExito = '¡Cambios guardados!',
  subtituloExito = 'Redirigiendo...',
  mensajeError,
  onRetry,
}: ConfirmarCambiosModalProps) {
  // Backwards compat: derive estado from isLoading if not provided
  const estado: EstadoModal = estadoProp ?? (isLoading ? 'loading' : 'idle')
  const isBlocked = estado === 'loading' || estado === 'success'

  // Confetti delay for success state
  const [showConfetti, setShowConfetti] = useState(false)
  useEffect(() => {
    if (estado === 'success') {
      const t = setTimeout(() => setShowConfetti(true), 250)
      return () => clearTimeout(t)
    }
    setShowConfetti(false)
  }, [estado])

  // JIT-safe colors
  const fb = 'proyectos'
  const gradient = MODAL_GRADIENT[moduleName] ?? MODAL_GRADIENT[fb]
  const spinner = MODAL_SPINNER[moduleName] ?? MODAL_SPINNER[fb]
  const ring = MODAL_RING[moduleName] ?? MODAL_RING[fb]
  const dots = MODAL_DOTS[moduleName] ?? MODAL_DOTS[fb]
  const successBg = MODAL_SUCCESS_BG[moduleName] ?? MODAL_SUCCESS_BG[fb]
  const successGlow = MODAL_SUCCESS_GLOW[moduleName] ?? MODAL_SUCCESS_GLOW[fb]
  const btnConfirm = MODAL_BTN_CONFIRM[moduleName] ?? MODAL_BTN_CONFIRM[fb]
  const badgeBg = MODAL_BADGE_BG[moduleName] ?? MODAL_BADGE_BG[fb]
  const badgeText = MODAL_BADGE_TEXT[moduleName] ?? MODAL_BADGE_TEXT[fb]
  const badgeStrong = MODAL_BADGE_STRONG[moduleName] ?? MODAL_BADGE_STRONG[fb]
  const catIconBg = MODAL_CAT_ICON_BG[moduleName] ?? MODAL_CAT_ICON_BG[fb]
  const redirectText = MODAL_REDIRECT_TEXT[moduleName] ?? MODAL_REDIRECT_TEXT[fb]

  // Agrupar cambios por categoría
  const cambiosPorCategoria = cambios.reduce((acc, cambio) => {
    if (!acc[cambio.categoria]) acc[cambio.categoria] = []
    acc[cambio.categoria].push(cambio)
    return acc
  }, {} as Record<string, CambioDetectado[]>)

  const totalCambios = cambios.length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
      {/* Overlay */}
      <motion.div
        {...modalAnimations.overlay}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70"
        onClick={!isBlocked ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        {...modalAnimations.modal}
        className="relative my-4 w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r ${gradient}`}>
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {estado === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : estado === 'error' ? (
                  <XCircle className="w-4 h-4 text-white" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {estado === 'success' ? '¡Operación Exitosa!' : estado === 'error' ? 'Error' : 'Confirmar Cambios'}
                </h3>
                <p className="text-white/80 text-xs">
                  {estado === 'success'
                    ? 'Los cambios se guardaron correctamente'
                    : estado === 'error'
                      ? 'Ocurrió un problema al guardar'
                      : 'Revisa los cambios antes de guardar'}
                </p>
              </div>
            </div>
            {!isBlocked ? (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Body — stateful content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {/* ── LOADING ─────────────────────────────────── */}
            {estado === 'loading' ? (
              <motion.div
                key="loading"
                {...modalAnimations.stateTransition}
                className="flex flex-col items-center justify-center py-14 px-6"
              >
                {/* Spinner + pulsing ring */}
                <div className="relative flex items-center justify-center mb-6">
                  <motion.div
                    {...modalAnimations.loadingRingPulse}
                    className={`absolute w-16 h-16 rounded-full border-2 ${ring}`}
                  />
                  <motion.div {...modalAnimations.spinnerRotate}>
                    <Loader2 className={`w-10 h-10 ${spinner}`} />
                  </motion.div>
                </div>

                <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {mensajeLoading}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                  Esto puede tomar unos segundos
                </p>

                {/* Bouncing dots */}
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      {...modalAnimations.dotBounce(i)}
                      className={`w-2 h-2 rounded-full ${dots}`}
                    />
                  ))}
                </div>
              </motion.div>

            /* ── SUCCESS ───────────────────────────────── */
            ) : estado === 'success' ? (
              <motion.div
                key="success"
                {...modalAnimations.stateTransition}
                className="flex flex-col items-center justify-center py-14 px-6 relative"
              >
                {/* Confetti */}
                {showConfetti ? (
                  <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {CONFETTI_PARTICLES.map((p) => (
                      <motion.div
                        key={p.id}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                        animate={{
                          x: p.x,
                          y: p.y,
                          opacity: [1, 1, 0],
                          scale: p.scale,
                          rotate: p.rotate,
                        }}
                        transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
                        className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: CONFETTI_COLORS[p.id % CONFETTI_COLORS.length] }}
                      />
                    ))}
                  </div>
                ) : null}

                {/* Checkmark icon */}
                <motion.div
                  {...modalAnimations.successIcon}
                  className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${successBg} shadow-2xl ${successGlow} flex items-center justify-center mb-5`}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                  <motion.div
                    {...modalAnimations.pulseRing}
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${successBg} opacity-30`}
                  />
                </motion.div>

                {/* Sparkle */}
                <motion.div {...modalAnimations.fadeUp(0.4)} className="absolute top-8 right-1/4">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </motion.div>

                <motion.div {...modalAnimations.fadeUp(0.3)}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                    {mensajeExito}
                  </h3>
                  <p className={`text-sm mt-2 text-center text-gray-500 dark:text-gray-400`}>
                    {subtituloExito}
                  </p>
                </motion.div>

                {/* Redirect indicator */}
                <motion.div {...modalAnimations.fadeUp(0.6)} className="mt-5 flex items-center gap-2">
                  <Loader2 className={`w-4 h-4 animate-spin ${redirectText}`} />
                  <span className={`text-xs ${redirectText}`}>Redirigiendo...</span>
                </motion.div>
              </motion.div>

            /* ── ERROR ──────────────────────────────────── */
            ) : estado === 'error' ? (
              <motion.div
                key="error"
                {...modalAnimations.stateTransition}
                className="flex flex-col items-center justify-center py-14 px-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-500 shadow-2xl shadow-red-500/40 flex items-center justify-center mb-5"
                >
                  <XCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">
                  Error al guardar
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
                  {mensajeError || 'Ocurrió un error inesperado. Por favor intenta de nuevo.'}
                </p>
              </motion.div>

            /* ── IDLE (cambios diff) ───────────────────── */
            ) : (
              <motion.div
                key="idle"
                {...modalAnimations.stateTransition}
                className="p-4 max-h-[65vh] overflow-y-auto custom-scrollbar"
              >
                {totalCambios === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-4">
                      <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No se detectaron cambios
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
                      No has modificado ningún campo. Puedes cerrar este modal o volver atrás para realizar cambios.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Resumen */}
                    <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${badgeBg}`}>
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${badgeText}`} />
                      <p className={`text-xs ${badgeText}`}>
                        <strong className={`font-bold ${badgeStrong}`}>
                          {totalCambios}
                        </strong>{' '}
                        cambio(s) detectados en {tituloEntidad}
                      </p>
                    </div>

                    {/* Cambios por categoría */}
                    {Object.entries(cambiosPorCategoria).map(([categoria, cambiosCategoria]) => {
                      const config = categoriasConfig[categoria]
                      if (!config) return null
                      const IconoCategoria = config.icono

                      return (
                        <div
                          key={categoria}
                          className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center shadow-sm bg-gradient-to-br ${catIconBg}`}>
                                <IconoCategoria className="w-3.5 h-3.5 text-white" />
                              </div>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                {config.titulo} ({cambiosCategoria.length})
                              </h4>
                            </div>
                          </div>
                          <div className="p-3 space-y-2.5">
                            {cambiosCategoria.map((cambio, index) => {
                              const Icono = cambio.icono
                              return (
                                <div key={index} className="space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <Icono className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                      {cambio.label}
                                    </span>
                                  </div>
                                  <div className="pl-5 flex items-center gap-2 text-xs flex-wrap">
                                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
                                      Anterior:
                                    </span>
                                    <span className="text-red-800 dark:text-red-200 line-through">
                                      {cambio.valorAnterior}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                                      Nuevo:
                                    </span>
                                    <span className="text-green-800 dark:text-green-200 font-semibold">
                                      {cambio.valorNuevo}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}

                    {/* Advertencia */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        <strong className="font-semibold">⚠️ Cambios permanentes:</strong> Estos cambios se guardarán en el sistema.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer — contextual per state */}
        <AnimatePresence mode="wait">
          {estado === 'idle' && totalCambios > 0 ? (
            <motion.div
              key="footer-idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30"
            >
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg ${btnConfirm}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar y Guardar</span>
                </button>
              </div>
            </motion.div>
          ) : estado === 'error' ? (
            <motion.div
              key="footer-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30"
            >
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
                {onRetry ? (
                  <button
                    onClick={onRetry}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg ${btnConfirm}`}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span>Reintentar</span>
                  </button>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
