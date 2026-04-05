'use client'

import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'

/** Corona animada para usuarios Administrador */
export function AdminCrown() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0, rotate: -20 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className='absolute -top-2.5 left-1/2 z-10 -translate-x-1/2'
    >
      <motion.div
        animate={{ y: [0, -2, 0], rotate: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Crown className='h-4 w-4 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' />
      </motion.div>
    </motion.div>
  )
}
