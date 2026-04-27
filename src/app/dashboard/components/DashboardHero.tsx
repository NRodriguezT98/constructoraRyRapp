'use client'

import { motion } from 'framer-motion'

interface DashboardHeroProps {
  saludo: string
  nombre: string
  rol: string
  fechaHoy: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

export function DashboardHero({
  saludo,
  nombre,
  rol,
  fechaHoy,
}: DashboardHeroProps) {
  return (
    <div className='mb-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
      <motion.div variants={itemVariants} className='space-y-3'>
        <div className='flex items-center gap-3'>
          <p className='text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-white/50'>
            {fechaHoy}
          </p>
          <div className='flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'>
            <span className='relative flex h-1.5 w-1.5'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
              <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500' />
            </span>
            Sistema en línea
          </div>
        </div>
        <h1
          className='text-4xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl'
          style={{ fontFamily: 'var(--font-jakarta)' }}
        >
          <span className='font-light text-slate-500 dark:text-white/60'>
            {saludo},
          </span>
          <br />
          {nombre}
        </h1>
        <div className='flex items-center gap-3 pt-2'>
          <span className='inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80'>
            <div className='mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 dark:shadow-[0_0_8px_rgba(52,211,153,0.8)]' />
            {rol}
          </span>
          <span className='ml-2 hidden items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-white/30 sm:inline-flex'>
            <kbd className='rounded border border-slate-200 bg-white px-1.5 py-0.5 font-sans shadow-sm dark:border-white/10 dark:bg-white/5'>
              ⌘
            </kbd>
            <kbd className='rounded border border-slate-200 bg-white px-1.5 py-0.5 font-sans shadow-sm dark:border-white/10 dark:bg-white/5'>
              K
            </kbd>
            para comandos
          </span>
        </div>
      </motion.div>
    </div>
  )
}
