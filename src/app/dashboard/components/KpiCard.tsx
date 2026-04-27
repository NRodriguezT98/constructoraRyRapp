'use client'

import type { ElementType } from 'react'

import { AnimatedCounter } from './AnimatedCounter'

interface KpiCardProps {
  label: string
  value: number
  sub: string
  icon: ElementType
  accentText: string
  sparkline: string
  loading: boolean
}

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accentText,
  sparkline,
  loading,
}: KpiCardProps) {
  return (
    <div
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
      className='group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-white dark:border-white/10 dark:bg-white/[0.02] dark:shadow-none dark:hover:bg-white/[0.04]'
    >
      {/* Spotlight Overlay */}
      <div className='pointer-events-none absolute -inset-px z-0 rounded-2xl bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(0,0,0,0.02),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.06),transparent_40%)]' />

      {/* Sparkline SVG */}
      <div className='pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-16 overflow-hidden opacity-[0.08] dark:opacity-20'>
        <svg
          viewBox='0 0 100 30'
          preserveAspectRatio='none'
          className={`h-full w-full ${accentText}`}
        >
          <path
            d={`${sparkline} L100,30 L0,30 Z`}
            fill='currentColor'
            opacity='0.15'
          />
          <path
            d={sparkline}
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
          />
        </svg>
      </div>

      <div className='relative z-10 mb-6 flex items-start justify-between'>
        <Icon
          className={`h-5 w-5 opacity-70 transition-opacity group-hover:opacity-100 ${accentText}`}
        />
        <span className='text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/40'>
          {label.split(' ')[0]}
        </span>
      </div>
      <div className='relative z-10'>
        {loading ? (
          <div className='h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-white/10' />
        ) : (
          <AnimatedCounter
            value={value}
            className='text-3xl font-semibold tracking-tight text-slate-900 dark:text-white'
          />
        )}
        <p className='mt-1 text-xs text-slate-500 dark:text-white/40'>{sub}</p>
      </div>
    </div>
  )
}
