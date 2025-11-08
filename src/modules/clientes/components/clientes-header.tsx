/**
 * 🎨 Header Hero Premium de Clientes
 * Diseño glassmorphism con gradient purple→violet
 * Botón FAB flotante superior derecho
 */

'use client'

import { motion } from 'framer-motion'
import { Plus, Users } from 'lucide-react'

import { clientesListaStyles as styles } from '../styles/clientes-lista.styles'

interface ClientesHeaderProps {
  onNuevoCliente?: () => void
  totalClientes: number
}

export function ClientesHeader({ onNuevoCliente, totalClientes }: ClientesHeaderProps) {
  return (
    <>
      {/* 🎨 HEADER HERO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.header.container}
      >
        <div className={styles.header.pattern} />
        <div className={styles.header.content}>
          <div className={styles.header.topRow}>
            <div className={styles.header.titleGroup}>
              <div className={styles.header.iconCircle}>
                <Users className={styles.header.icon} />
              </div>
              <div className={styles.header.titleWrapper}>
                <h1 className={styles.header.title}>Gestión de Clientes</h1>
                <p className={styles.header.subtitle}>
                  Base de datos centralizada • Relaciones comerciales
                </p>
              </div>
            </div>
            <span className={styles.header.badge}>
              <Users className="w-4 h-4" />
              {totalClientes} Cliente{totalClientes !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 🎈 FAB SUPERIOR DERECHO (Solo si puede crear) */}
      {onNuevoCliente && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className={styles.fab.container}
        >
          <button
            type="button"
            onClick={onNuevoCliente}
            className={styles.fab.button}
          >
            <div className={styles.fab.buttonGlow} />
            <div className={styles.fab.buttonContent}>
              <Plus className={styles.fab.icon} />
              <span className={styles.fab.text}>Nuevo Cliente</span>
            </div>
          </button>
        </motion.div>
      )}
    </>
  )
}
