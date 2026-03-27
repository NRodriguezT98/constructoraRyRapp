/**
 * AccordionWizardSubmitOverlay — Loading overlay animado que se muestra
 * durante el submit final del wizard. Cubre todo el formulario con backdrop-blur,
 * spinner temático, icono pulsante y texto descriptivo.
 *
 * Theming dinámico por moduleName (JIT-safe con Record maps).
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import type { ModuleName } from '@/shared/config/module-themes'

// ── Clases JIT-safe por módulo ──────────────────────────
const SPINNER_COLOR: Record<string, string> = {
  proyectos: 'text-green-500',
  viviendas: 'text-orange-500',
  clientes: 'text-cyan-500',
  negociaciones: 'text-pink-500',
  abonos: 'text-blue-500',
  documentos: 'text-red-500',
  auditorias: 'text-indigo-500',
}

const RING_COLOR: Record<string, string> = {
  proyectos: 'border-green-500/30',
  viviendas: 'border-orange-500/30',
  clientes: 'border-cyan-500/30',
  negociaciones: 'border-pink-500/30',
  abonos: 'border-blue-500/30',
  documentos: 'border-red-500/30',
  auditorias: 'border-indigo-500/30',
}

const GLOW_COLOR: Record<string, string> = {
  proyectos: 'shadow-green-500/20',
  viviendas: 'shadow-orange-500/20',
  clientes: 'shadow-cyan-500/20',
  negociaciones: 'shadow-pink-500/20',
  abonos: 'shadow-blue-500/20',
  documentos: 'shadow-red-500/20',
  auditorias: 'shadow-indigo-500/20',
}

const DOTS_COLOR: Record<string, string> = {
  proyectos: 'bg-green-500',
  viviendas: 'bg-orange-500',
  clientes: 'bg-cyan-500',
  negociaciones: 'bg-pink-500',
  abonos: 'bg-blue-500',
  documentos: 'bg-red-500',
  auditorias: 'bg-indigo-500',
}

// ── Animations ───────────────────────────────────────────
const overlayAnim = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
}

const cardAnim = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -10 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 25, delay: 0.1 },
}

const spinnerAnim = {
  animate: { rotate: 360 },
  transition: { duration: 1.2, repeat: Infinity, ease: 'linear' as const },
}

const pulseRingAnim = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
}

const dotAnim = (i: number) => ({
  animate: { y: [0, -6, 0] },
  transition: { duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' as const },
})

// ── Props ────────────────────────────────────────────────
interface AccordionWizardSubmitOverlayProps {
  isVisible: boolean
  moduleName: ModuleName
  /** Texto principal (ej: "Creando Proyecto...") */
  label?: string
  /** Texto secundario (ej: "Esto puede tomar unos segundos") */
  subtitle?: string
}

export function AccordionWizardSubmitOverlay({
  isVisible,
  moduleName,
  label = 'Procesando...',
  subtitle = 'Esto puede tomar unos segundos',
}: AccordionWizardSubmitOverlayProps) {
  const fallback = 'proyectos'
  const spinner = SPINNER_COLOR[moduleName] ?? SPINNER_COLOR[fallback]
  const ring = RING_COLOR[moduleName] ?? RING_COLOR[fallback]
  const glow = GLOW_COLOR[moduleName] ?? GLOW_COLOR[fallback]
  const dots = DOTS_COLOR[moduleName] ?? DOTS_COLOR[fallback]

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          key="submit-overlay"
          {...overlayAnim}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-gray-950/70 backdrop-blur-md"
        >
          <motion.div
            {...cardAnim}
            className={`relative flex flex-col items-center gap-5 px-10 py-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl ${glow}`}
          >
            {/* Spinner con ring pulsante */}
            <div className="relative flex items-center justify-center">
              {/* Ring pulsante */}
              <motion.div
                {...pulseRingAnim}
                className={`absolute w-16 h-16 rounded-full border-2 ${ring}`}
              />
              {/* Spinner principal */}
              <motion.div {...spinnerAnim}>
                <Loader2 className={`w-10 h-10 ${spinner}`} />
              </motion.div>
            </div>

            {/* Texto principal */}
            <div className="text-center space-y-1.5">
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {label}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            </div>

            {/* Dots animados */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  {...dotAnim(i)}
                  className={`w-2 h-2 rounded-full ${dots}`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
