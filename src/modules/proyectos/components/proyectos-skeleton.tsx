'use client'

import { motion } from 'framer-motion'

import { Skeleton } from '@/shared/components/ui/Loading'

export function ProyectosSkeleton() {
  // Generar 6 skeletons para simular carga
  const skeletons = Array.from({ length: 6 })

  // Vista lista con diseño horizontal mejorado
  return (
    <div className='space-y-4'>
      {skeletons.map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * 0.08,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          className='relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white p-6 shadow-lg dark:border-gray-700/50 dark:bg-gray-800'
        >
          {/* Resplandor decorativo */}
          <motion.div
            className='absolute right-0 top-0 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/10'
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.3,
            }}
          />

          <div className='relative flex items-center gap-6'>
            {/* Ícono grande con efecto */}
            <div className='relative flex-shrink-0'>
              <Skeleton variant='circular' width={80} height={80} />
              <motion.div
                className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-lg'
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Contenido principal */}
            <div className='flex-1 space-y-4'>
              {/* Título grande */}
              <Skeleton variant='text' width='45%' height={32} />

              {/* Ubicación */}
              <Skeleton variant='text' width='35%' height={18} />

              {/* Descripción */}
              <div className='space-y-2'>
                <Skeleton variant='text' width='85%' height={14} />
                <Skeleton variant='text' width='70%' height={14} />
              </div>

              {/* Stats en fila */}
              <div className='flex gap-6 pt-2'>
                <Skeleton
                  variant='rectangular'
                  width={130}
                  height={52}
                  className='rounded-xl'
                />
                <Skeleton
                  variant='rectangular'
                  width={130}
                  height={52}
                  className='rounded-xl'
                />
                <Skeleton
                  variant='rectangular'
                  width={130}
                  height={52}
                  className='rounded-xl'
                />
              </div>
            </div>

            {/* Botones de acción verticales */}
            <div className='flex flex-shrink-0 flex-col gap-3'>
              <Skeleton
                variant='rectangular'
                width={110}
                height={42}
                className='rounded-xl'
              />
              <Skeleton
                variant='rectangular'
                width={110}
                height={42}
                className='rounded-xl'
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
