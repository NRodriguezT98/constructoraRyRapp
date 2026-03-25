'use client'

import { motion } from 'framer-motion'
import { FileX } from 'lucide-react'

import { renunciasStyles as styles } from '../styles/renuncias.styles'

interface RenunciasHeaderPremiumProps {
  totalRenuncias: number
}

export function RenunciasHeaderPremium({ totalRenuncias }: RenunciasHeaderPremiumProps) {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={styles.header.container}
    >
      <div className={styles.header.pattern} />
      <div className={styles.header.content}>
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
              <FileX className="w-3.5 h-3.5" />
              {totalRenuncias} Renuncias
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
