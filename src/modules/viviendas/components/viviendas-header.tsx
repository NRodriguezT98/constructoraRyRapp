'use client'

import { motion } from 'framer-motion'
import { Home, Plus } from 'lucide-react'
import { viviendasStyles as styles } from '../styles/viviendas.styles'

interface ViviendasHeaderProps {
  onNuevaVivienda: () => void
  totalViviendas: number
}

export function ViviendasHeader({ onNuevaVivienda, totalViviendas }: ViviendasHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.header.container}
    >
      <div className={styles.header.pattern} />
      <div className={styles.header.content}>
        <div className={styles.header.topRow}>
          <div className={styles.header.titleGroup}>
            <div className={styles.header.iconCircle}>
              <Home className={styles.header.icon} />
            </div>
            <div className={styles.header.titleWrapper}>
              <h1 className={styles.header.title}>Gestión de Viviendas</h1>
              <p className={styles.header.subtitle}>
                Administración completa • Control de inventario
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={styles.header.badge}>
              <Home className="w-3.5 h-3.5" />
              {totalViviendas} Viviendas
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNuevaVivienda}
              className={styles.header.button}
            >
              <Plus className="w-4 h-4" />
              Nueva Vivienda
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
