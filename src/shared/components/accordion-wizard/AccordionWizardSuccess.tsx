/**
 * AccordionWizardSuccess — Animación de éxito celebratoria
 * Se muestra brevemente después de crear exitosamente un registro,
 * antes de redirigir al listado.
 */

'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, PartyPopper, Sparkles } from 'lucide-react'

import type { ModuleName } from '@/shared/config/module-themes'

const SUCCESS_BG: Record<string, string> = {
  proyectos: 'from-green-500 to-emerald-500',
  viviendas: 'from-orange-500 to-amber-500',
  clientes: 'from-cyan-500 to-blue-500',
  negociaciones: 'from-pink-500 to-purple-500',
  abonos: 'from-blue-500 to-indigo-500',
  documentos: 'from-red-500 to-rose-500',
  auditorias: 'from-blue-500 to-indigo-500',
}

const SUCCESS_GLOW: Record<string, string> = {
  proyectos: 'shadow-green-500/40',
  viviendas: 'shadow-orange-500/40',
  clientes: 'shadow-cyan-500/40',
  negociaciones: 'shadow-pink-500/40',
  abonos: 'shadow-blue-500/40',
  documentos: 'shadow-red-500/40',
  auditorias: 'shadow-blue-500/40',
}

interface AccordionWizardSuccessProps {
  /** Controlador de visibilidad */
  isVisible: boolean
  /** Módulo para colores */
  moduleName: ModuleName
  /** Título del éxito (ej: "¡Cliente creado!") */
  title: string
  /** Subtítulo opcional */
  subtitle?: string
}

// Confetti particles
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 200 - 100,
  y: -(Math.random() * 120 + 40),
  rotate: Math.random() * 360,
  scale: Math.random() * 0.5 + 0.5,
  delay: Math.random() * 0.3,
}))

const PARTICLE_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F97316', '#06B6D4']

export function AccordionWizardSuccess({
  isVisible,
  moduleName,
  title,
  subtitle,
}: AccordionWizardSuccessProps) {
  const bg = SUCCESS_BG[moduleName] ?? SUCCESS_BG.proyectos
  const glow = SUCCESS_GLOW[moduleName] ?? SUCCESS_GLOW.proyectos
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowParticles(true), 300)
      return () => clearTimeout(timer)
    }
    setShowParticles(false)
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative flex flex-col items-center gap-4 p-8 text-center"
          >
            {/* Confetti particles */}
            {showParticles ? (
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {PARTICLES.map((p) => (
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
                    style={{
                      backgroundColor: PARTICLE_COLORS[p.id % PARTICLE_COLORS.length],
                    }}
                  />
                ))}
              </div>
            ) : null}

            {/* Ícono principal */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 }}
              className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${bg} shadow-2xl ${glow} flex items-center justify-center`}
            >
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />

              {/* Pulsing ring */}
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1, repeat: 2, repeatType: 'loop' }}
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${bg} opacity-30`}
              />
            </motion.div>

            {/* Sparkle decorations */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -top-2 -right-4"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-0 -left-6"
            >
              <PartyPopper className="w-5 h-5 text-orange-400" />
            </motion.div>

            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {title}
              </h2>
              {subtitle ? (
                <p className="text-white/70 text-sm mt-1">
                  {subtitle}
                </p>
              ) : null}
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
