'use client'

import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'

import { seleccionClienteStyles as styles } from '../styles/seleccion-cliente.styles'

interface AbonosHeaderPremiumProps {
  totalClientes: number
}

export function AbonosHeaderPremium({
  totalClientes,
}: AbonosHeaderPremiumProps) {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={styles.header.container}
    >
      <div className={styles.header.pattern} />
      <div className={styles.header.content}>
        <div className={styles.header.topRow}>
          <div className={styles.header.titleGroup}>
            <div className={styles.header.iconCircle}>
              <DollarSign className={styles.header.icon} />
            </div>
            <div className={styles.header.titleWrapper}>
              <h1 className={styles.header.title}>Gestión de Abonos</h1>
              <p className={styles.header.subtitle}>
                Registro y seguimiento de pagos • Selecciona un cliente
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span className={styles.header.badge}>
              <DollarSign className='h-3.5 w-3.5' />
              {totalClientes} Cliente{totalClientes !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
