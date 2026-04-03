import { motion } from 'framer-motion'
import { LucideIcon, Upload } from 'lucide-react'

import { moduleThemes, type ModuleName } from '../../config/module-themes'
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
  moduleName?: ModuleName // 🎨 Tema del módulo
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  moduleName = 'proyectos',
}: EmptyStateProps) {
  const ActionIcon = action?.icon
  const theme = moduleThemes[moduleName]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl px-6 py-14 text-center',
        'bg-white/60 backdrop-blur-xl dark:bg-gray-900/60',
        'border border-gray-200/50 dark:border-gray-700/50',
        'shadow-xl shadow-gray-200/30 dark:shadow-black/20',
        className
      )}
    >
      {/* Pattern overlay decorativo */}
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),transparent_50%)]' />

      {/* Orbes de color difuminado del módulo */}
      <motion.div
        className={cn(
          'pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-[0.07] blur-3xl',
          `bg-gradient-to-br ${theme.classes.gradient.triple}`
        )}
        animate={{ scale: [1, 1.15, 1], opacity: [0.07, 0.12, 0.07] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={cn(
          'pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full opacity-[0.06] blur-3xl',
          `bg-gradient-to-tr ${theme.classes.gradient.primary}`
        )}
        animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Ícono premium con doble ring */}
      {Icon ? (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className='relative mb-6'
        >
          {/* Ring exterior pulsante */}
          <motion.div
            className={cn(
              'absolute -inset-3 rounded-2xl opacity-20 blur-md',
              `bg-gradient-to-br ${theme.classes.gradient.triple}`
            )}
            animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Contenedor del ícono con glassmorphism */}
          <div
            className={cn(
              'relative rounded-2xl p-5',
              'bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-700/80',
              'border border-gray-200/60 dark:border-gray-600/40',
              'shadow-lg shadow-gray-200/50 dark:shadow-black/30'
            )}
          >
            <Icon
              className={cn(
                'h-10 w-10',
                theme.classes.text.primary,
                'dark:' + theme.classes.text.dark
              )}
              strokeWidth={1.5}
            />
          </div>
        </motion.div>
      ) : null}

      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='mb-2'
      >
        <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
          {title}
        </h3>
        {/* Línea decorativa con gradiente del módulo */}
        <motion.div
          className={cn(
            'mx-auto mt-2 h-0.5 rounded-full bg-gradient-to-r',
            theme.classes.gradient.triple
          )}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '60%', opacity: 0.4 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        />
      </motion.div>

      {/* Descripción */}
      {description ? (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='mb-6 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400'
        >
          {description}
        </motion.p>
      ) : null}

      {/* Botón de acción premium */}
      {action ? (
        <motion.button
          onClick={action.onClick}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={cn(
            'group relative overflow-hidden rounded-xl px-5 py-2.5 text-sm font-bold text-white',
            'shadow-lg transition-all duration-300',
            `bg-gradient-to-r ${theme.classes.gradient.triple}`,
            `hover:shadow-xl ${theme.classes.shadow}`
          )}
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Shimmer en hover */}
          <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full' />

          <span className='relative flex items-center gap-2'>
            {ActionIcon ? (
              <ActionIcon className='h-4 w-4' strokeWidth={2.5} />
            ) : (
              <Upload className='h-4 w-4' strokeWidth={2.5} />
            )}
            {action.label}
          </span>
        </motion.button>
      ) : null}
    </motion.div>
  )
}
