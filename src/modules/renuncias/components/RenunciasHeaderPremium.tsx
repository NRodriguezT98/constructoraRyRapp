'use client'

import { motion } from 'framer-motion'
import { ChevronRight, FileX, LayoutDashboard } from 'lucide-react'

import { ProtectedLink } from '@/shared/components/ui/ProtectedLink'

import { renunciasStyles as styles } from '../styles/renuncias.styles'

interface RenunciasHeaderPremiumProps {
  totalRenuncias: number
}

export function RenunciasHeaderPremium({
  totalRenuncias,
}: RenunciasHeaderPremiumProps) {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={styles.header.container}
    >
      <div className={styles.header.pattern} />
      <div className={styles.header.content}>
        <div className='mb-3 flex items-center gap-1.5'>
          <LayoutDashboard className='h-3 w-3 text-red-200' />
          <ProtectedLink
            href='/dashboard'
            className='text-xs text-red-200 transition-colors hover:text-white'
          >
            Dashboard
          </ProtectedLink>
          <ChevronRight className='h-3 w-3 text-red-300/60' />
          <span className='text-xs font-semibold text-white'>Renuncias</span>
        </div>
        <div className={styles.header.topRow}>
          <div className={styles.header.titleGroup}>
            <div className={styles.header.iconCircle}>
              <FileX className={styles.header.icon} />
            </div>
            <div className={styles.header.titleWrapper}>
              <h1 className={styles.header.title}>Gestión de Renuncias</h1>
              <p className={styles.header.subtitle}>
                Administra renuncias y devoluciones de negociaciones
              </p>
            </div>
          </div>
          <div className={styles.header.buttonGroup}>
            <span className={styles.header.badge}>
              <FileX className='h-3.5 w-3.5' />
              {totalRenuncias} Renuncias
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
