/**
 * AccordionWizardHero — Header atractivo para wizards de creación.
 * Muestra ícono del módulo, título, subtítulo, tiempo estimado
 * y un chip con la cantidad de pasos.
 */

'use client'

import type { ModuleName } from '@/shared/config/module-themes'
import { motion } from 'framer-motion'
import { Clock, type LucideIcon } from 'lucide-react'

// ── Gradientes JIT-safe por módulo ───────────────────────
const HERO_BG: Record<string, string> = {
  proyectos: 'from-green-600 via-emerald-600 to-teal-600',
  viviendas: 'from-orange-600 via-amber-600 to-yellow-600',
  clientes: 'from-cyan-600 via-blue-600 to-indigo-600',
  negociaciones: 'from-pink-600 via-purple-600 to-indigo-600',
  abonos: 'from-blue-600 via-indigo-600 to-purple-600',
  documentos: 'from-red-600 via-rose-600 to-pink-600',
  auditorias: 'from-blue-600 via-indigo-600 to-purple-600',
}

const HERO_SHADOW: Record<string, string> = {
  proyectos: 'shadow-green-500/25',
  viviendas: 'shadow-orange-500/25',
  clientes: 'shadow-cyan-500/25',
  negociaciones: 'shadow-pink-500/25',
  abonos: 'shadow-blue-500/25',
  documentos: 'shadow-red-500/25',
  auditorias: 'shadow-blue-500/25',
}

interface AccordionWizardHeroProps {
  /** Ícono principal del wizard */
  icon: LucideIcon
  /** Título grande (ej: "Nuevo Cliente") */
  title: string
  /** Subtítulo descriptivo */
  subtitle: string
  /** Módulo para theming */
  moduleName: ModuleName
  /** Tiempo estimado (ej: "~2 minutos") */
  estimatedTime?: string
  /** Total de pasos */
  totalSteps?: number
}

export function AccordionWizardHero({
  icon: Icon,
  title,
  subtitle,
  moduleName,
  estimatedTime,
  totalSteps,
}: AccordionWizardHeroProps) {
  const gradient = HERO_BG[moduleName] ?? HERO_BG.proyectos
  const shadow = HERO_SHADOW[moduleName] ?? HERO_SHADOW.proyectos

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} p-6 shadow-xl ${shadow}`}
    >
      {/* Pattern decorativo */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />

      {/* Círculos decorativos */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

      <div className="relative z-10 flex items-start gap-4">
        {/* Ícono */}
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="text-white/80 text-sm mt-1 leading-relaxed">
            {subtitle}
          </p>

          {/* Chips informativos */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {totalSteps ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium">
                {totalSteps} pasos
              </span>
            ) : null}
            {estimatedTime ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium">
                <Clock className="w-3 h-3" />
                {estimatedTime}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium">
              * = obligatorio
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
