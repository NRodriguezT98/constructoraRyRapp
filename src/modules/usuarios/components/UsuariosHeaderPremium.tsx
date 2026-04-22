/**
 * UsuariosHeaderPremium — Header hero del módulo de usuarios
 * ✅ Gradiente índigo/púrpura/fuchsia
 * ✅ Badge con total
 * ✅ Botón Nuevo Usuario (condicional por permiso)
 */

'use client'

import { motion } from 'framer-motion'
import { Plus, Users } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { usuariosPageStyles as styles } from '../styles/usuarios-page.styles'

interface UsuariosHeaderPremiumProps {
  totalUsuarios: number
  canCreate?: boolean
}

export function UsuariosHeaderPremium({
  totalUsuarios,
  canCreate = false,
}: UsuariosHeaderPremiumProps) {
  const router = useRouter()

  return (
    <motion.div
      {...styles.animations.header}
      className={styles.header.container}
    >
      {/* Pattern overlay */}
      <div className={styles.header.pattern} />

      <div className={styles.header.content}>
        <div className={styles.header.topRow}>
          {/* Left: icon + título */}
          <div className={styles.header.titleGroup}>
            <div className={styles.header.iconCircle}>
              <Users className={styles.header.icon} />
            </div>
            <div className={styles.header.titleWrapper}>
              <h1 className={styles.header.title}>Gestión de Usuarios</h1>
              <p className={styles.header.subtitle}>
                Administra accesos, roles y permisos del sistema • RBAC
              </p>
            </div>
          </div>

          {/* Right: badge + botón */}
          <div className={styles.header.buttonGroup}>
            <span className={styles.header.badge}>
              <Users className={styles.header.badgeIcon} />
              {totalUsuarios} {totalUsuarios === 1 ? 'Usuario' : 'Usuarios'}
            </span>

            {canCreate && (
              <motion.button
                {...styles.animations.button}
                onClick={() => router.push('/usuarios/nueva')}
                className={styles.header.button}
              >
                <Plus className={styles.header.buttonIcon} />
                Nuevo Usuario
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
