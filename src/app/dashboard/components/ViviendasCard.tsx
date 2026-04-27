'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import Link from 'next/link'

import type { DashboardStatsData } from '../hooks/useDashboardStats'

import { ViviendasRingChart } from './ViviendasRingChart'

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

interface ViviendasCardProps {
  loading: boolean
  viviendas: DashboardStatsData['viviendas']
  canNavigate: boolean
}

export function ViviendasCard({
  loading,
  viviendas,
  canNavigate,
}: ViviendasCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty(
          '--mouse-x',
          `${e.clientX - rect.left}px`
        )
        e.currentTarget.style.setProperty(
          '--mouse-y',
          `${e.clientY - rect.top}px`
        )
      }}
      className='group relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-md backdrop-blur-2xl transition-colors hover:border-amber-400/50 dark:border-gray-700/50 dark:bg-gray-800/50 dark:shadow-none dark:hover:border-amber-500/30 md:flex-row'
    >
      {/* Subtle top glow */}
      <div className='absolute inset-x-0 top-0 z-10 h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:via-amber-500/50' />

      {/* Spotlight Overlay */}
      <div className='pointer-events-none absolute -inset-px z-0 rounded-3xl bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(0,0,0,0.015),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_40%)]' />

      <div className='relative z-10 mb-6 flex h-full flex-col justify-between md:mb-0 md:w-1/2'>
        <div>
          <h2 className='text-lg font-medium text-slate-900 dark:text-white'>
            Disponibilidad de Viviendas
          </h2>
          <p className='mb-8 mt-1 text-sm text-slate-500 dark:text-white/50'>
            Distribución de viviendas y estado actual
          </p>
        </div>
        {canNavigate && (
          <div>
            <Link
              href='/viviendas'
              className='inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-white/90'
            >
              Ver Inventario <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        )}
      </div>

      <div className='relative z-10 flex items-center justify-center md:w-1/2'>
        {loading ? (
          <div className='h-32 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10' />
        ) : (
          <ViviendasRingChart
            disponibles={viviendas.disponibles}
            asignadas={viviendas.asignadas}
            entregadas={viviendas.entregadas}
          />
        )}
      </div>
    </motion.div>
  )
}
