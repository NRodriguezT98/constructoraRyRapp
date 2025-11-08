'use client'

import { useId } from 'react'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { cn } from '../../utils/helpers'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'gradient' | 'solid' | 'dots'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

export function LoadingSpinner({
  size = 'md',
  className,
  variant = 'gradient',
}: LoadingSpinnerProps) {
  const gradientId = useId() // ID único para cada spinner

  if (variant === 'dots') {
    return <LoadingDots className={className} />
  }

  return (
    <div className='relative inline-flex'>
      {/* Resplandor exterior animado */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full opacity-40 blur-lg',
          variant === 'gradient'
            ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
            : 'bg-blue-500 dark:bg-blue-400',
          sizeClasses[size]
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Spinner con gradiente */}
      <motion.div
        className={cn(sizeClasses[size], className)}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {variant === 'gradient' ? (
          <svg
            className='h-full w-full'
            viewBox='0 0 50 50'
            style={{
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
            }}
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1='0%'
                y1='0%'
                x2='100%'
                y2='100%'
              >
                <stop offset='0%' stopColor='#3b82f6' />
                <stop offset='50%' stopColor='#a855f7' />
                <stop offset='100%' stopColor='#ec4899' />
              </linearGradient>
            </defs>
            <circle
              cx='25'
              cy='25'
              r='20'
              fill='none'
              stroke={`url(#${gradientId})`}
              strokeWidth='4'
              strokeLinecap='round'
              strokeDasharray='80, 200'
            />
          </svg>
        ) : (
          <Loader2 className='h-full w-full text-blue-600 dark:text-blue-400' />
        )}
      </motion.div>
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
  className?: string
}

export function LoadingOverlay({ message, className }: LoadingOverlayProps) {
  // Posiciones fijas para las partículas (evita hydration mismatch)
  const particlePositions = [
    { left: 15, top: 20 },
    { left: 85, top: 30 },
    { left: 25, top: 70 },
    { left: 75, top: 60 },
    { left: 50, top: 15 },
    { left: 40, top: 80 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center gap-6',
        'bg-white/90 backdrop-blur-xl dark:bg-gray-900/90',
        'z-50 rounded-2xl',
        className
      )}
    >
      {/* Partículas decorativas de fondo */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            className='absolute h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20'
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Contenido */}
      <div className='relative flex flex-col items-center gap-6'>
        {/* Spinner premium */}
        <LoadingSpinner size='lg' variant='gradient' />

        {/* Mensaje con animación */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-center'
          >
            <p className='mb-1 text-base font-semibold text-gray-700 dark:text-gray-300'>
              {message}
            </p>
            <LoadingDots />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

interface LoadingDotsProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingDots({ className, size = 'sm' }: LoadingDotsProps) {
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {[0, 1, 2].map(index => (
        <motion.div
          key={index}
          className={cn('rounded-full', dotSizes[size])}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-gray-200 dark:bg-gray-700',
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    >
      {/* Efecto shimmer animado */}
      <motion.div
        className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10'
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn('space-y-4 p-6', className)}>
      <div className='flex items-center gap-4'>
        <Skeleton variant='circular' width={48} height={48} />
        <div className='flex-1 space-y-2'>
          <Skeleton variant='text' width='60%' height={16} />
          <Skeleton variant='text' width='40%' height={12} />
        </div>
      </div>
      <div className='space-y-2'>
        <Skeleton variant='rectangular' width='100%' height={80} />
        <div className='flex gap-2'>
          <Skeleton variant='rectangular' width='30%' height={32} />
          <Skeleton variant='rectangular' width='30%' height={32} />
        </div>
      </div>
    </div>
  )
}
