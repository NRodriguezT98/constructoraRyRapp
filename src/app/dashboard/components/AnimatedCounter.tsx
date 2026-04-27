'use client'

import { useEffect } from 'react'

import { animate, motion, useMotionValue, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.4,
  className,
}: AnimatedCounterProps) {
  const count = useMotionValue(0)
  const display = useTransform(count, v =>
    Math.round(v).toLocaleString('es-CO')
  )

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    })
    return controls.stop
  }, [count, value, duration])

  return <motion.span className={className}>{display}</motion.span>
}
