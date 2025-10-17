/**
 * Componente de Skeleton para Clientes
 * Presentacional puro - muestra estado de carga
 */

'use client'

import { motion } from 'framer-motion'
import { clientesStyles, fadeInUp } from '../styles'

export function ClientesSkeleton() {
  return (
    <motion.div
      className={clientesStyles.grid}
      variants={fadeInUp}
      initial='initial'
      animate='animate'
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={`${clientesStyles.card} ${clientesStyles.skeleton}`}>
          {/* Header */}
          <div className='mb-4 flex items-start justify-between'>
            <div className='flex-1'>
              <div className={`${clientesStyles.skeletonLine} mb-2 w-3/4`} />
              <div className={`${clientesStyles.skeletonLine} w-1/2`} />
            </div>
            <div className={`${clientesStyles.skeletonCircle} h-10 w-10`} />
          </div>

          {/* Body */}
          <div className='space-y-3'>
            <div className={`${clientesStyles.skeletonLine} w-full`} />
            <div className={`${clientesStyles.skeletonLine} w-5/6`} />
            <div className={`${clientesStyles.skeletonLine} w-4/6`} />
          </div>

          {/* Footer */}
          <div className='mt-4 flex gap-2'>
            <div className={`${clientesStyles.skeletonLine} h-8 w-20`} />
            <div className={`${clientesStyles.skeletonLine} h-8 w-16`} />
          </div>
        </div>
      ))}
    </motion.div>
  )
}
