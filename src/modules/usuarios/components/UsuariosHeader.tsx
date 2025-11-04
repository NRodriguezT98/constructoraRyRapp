/**
 * 🎨 Header Hero Premium de Usuarios
 * Diseño glassmorphism con gradient violet→purple
 * Similar a clientes pero con identidad propia
 */

'use client'

import { motion } from 'framer-motion'
import { Shield, Users } from 'lucide-react'
import { usuariosPremiumStyles as styles } from '../styles/usuarios-premium.styles'

interface UsuariosHeaderProps {
  totalUsuarios: number
}

export function UsuariosHeader({ totalUsuarios }: UsuariosHeaderProps) {
  return (
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
              <Shield className={styles.header.icon} />
            </div>
            <div className={styles.header.titleWrapper}>
              <h1 className={styles.header.title}>Gestión de Usuarios</h1>
              <p className={styles.header.subtitle}>
                Administra usuarios, roles y permisos del sistema
              </p>
            </div>
          </div>
          <span className={styles.header.badge}>
            <Users className="w-4 h-4" />
            {totalUsuarios} Usuario{totalUsuarios !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
