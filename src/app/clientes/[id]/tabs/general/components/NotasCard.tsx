'use client'

import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'

import * as styles from '@/app/clientes/[id]/cliente-detalle.styles'
import type { Cliente } from '@/modules/clientes/types'

interface NotasCardProps {
  cliente: Cliente
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export function NotasCard({ cliente }: NotasCardProps) {
  if (!cliente.notas) return null

  return (
    <motion.div
      {...fadeInUp}
      transition={{ delay: 0.3 }}
      className={styles.infoCardClasses.card}
    >
      <div className={styles.infoCardClasses.header}>
        <div
          className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.adicional}`}
        >
          <MessageSquare className={styles.infoCardClasses.icon} />
        </div>
        <h3 className={styles.infoCardClasses.title}>Notas y Observaciones</h3>
      </div>
      <div className={styles.infoCardClasses.content}>
        <p className='text-sm text-gray-700 dark:text-gray-300'>
          {cliente.notas}
        </p>
      </div>
    </motion.div>
  )
}
