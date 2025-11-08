import { motion } from 'framer-motion'
import { LucideIcon, Sparkles } from 'lucide-react'

import { cn } from '../../utils/helpers'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon

  // Posiciones fijas para las partículas (evita hydration mismatch)
  const particlePositions = [
    { left: 25, top: 30 },
    { left: 70, top: 25 },
    { left: 35, top: 60 },
    { left: 65, top: 55 },
    { left: 45, top: 35 },
    { left: 55, top: 70 },
    { left: 30, top: 45 },
    { left: 60, top: 40 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center px-4 py-8 text-center',
        className
      )}
    >
      {/* Fondo decorativo con menos partículas */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        {particlePositions.slice(0, 4).map((pos, i) => (
          <motion.div
            key={i}
            className='absolute h-1 w-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20'
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Ícono compacto */}
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className='relative mb-4'
        >
          {/* Resplandor sutil */}
          <motion.div
            className='absolute inset-0 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 opacity-20 blur-xl dark:from-gray-500 dark:to-gray-600'
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Contenedor del ícono */}
          <div className='relative rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-4 shadow-md dark:from-gray-800 dark:to-gray-700'>
            <Icon
              className='h-10 w-10 text-gray-400 dark:text-gray-500'
              strokeWidth={1.5}
            />
          </div>
        </motion.div>
      )}

      {/* Título compacto */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='mb-2'
      >
        <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
          {title}
        </h3>
        {/* Línea decorativa */}
        <motion.div
          className='mx-auto mt-1 h-0.5 rounded-full bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600'
          initial={{ width: 0 }}
          animate={{ width: '50%' }}
          transition={{ delay: 0.4, duration: 0.6 }}
        />
      </motion.div>

      {/* Descripción */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='mb-5 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-400'
        >
          {description}
        </motion.p>
      )}

      {/* Botón de acción compacto */}
      {action && (
        <motion.button
          onClick={action.onClick}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='group relative overflow-hidden rounded-lg px-4 py-2 text-sm font-bold text-white shadow-md'
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Gradiente de fondo */}
          <div className='absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 transition-transform group-hover:scale-110' />

          {/* Resplandor en hover */}
          <motion.div
            className='absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100'
            initial={false}
          />

          {/* Contenido del botón */}
          <span className='relative flex items-center gap-2'>
            {ActionIcon && (
              <ActionIcon className='h-4 w-4' strokeWidth={2.5} />
            )}
            {action.label}
            <Sparkles className='h-3.5 w-3.5' />
          </span>
        </motion.button>
      )}
    </motion.div>
  )
}
