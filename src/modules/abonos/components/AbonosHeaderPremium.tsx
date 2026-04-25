'use client'

import { motion } from 'framer-motion'
import { ChevronRight, DollarSign, LayoutDashboard } from 'lucide-react'

import { ProtectedLink } from '@/shared/components/ui/ProtectedLink'

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
        <div className='mb-3 flex items-center gap-1.5'>
          <LayoutDashboard className='h-3 w-3 text-violet-200' />
          <ProtectedLink
            href='/dashboard'
            className='text-xs text-violet-200 transition-colors hover:text-white'
          >
            Dashboard
          </ProtectedLink>
          <ChevronRight className='h-3 w-3 text-violet-300/60' />
          <span className='text-xs font-semibold text-white'>Abonos</span>
        </div>
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
