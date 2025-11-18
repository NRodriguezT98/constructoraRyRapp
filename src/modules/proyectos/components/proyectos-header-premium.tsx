/**
 * ProyectosHeaderPremium - Header compacto con diseño premium
 * ✅ Estándar de diseño compacto
 * ✅ Gradientes verde/esmeralda/teal
 * ✅ Glassmorphism
 * ✅ Animaciones Framer Motion
 */

'use client'

import { motion } from 'framer-motion'
import { Building2, Plus } from 'lucide-react'

import { proyectosPageStyles as styles } from '../styles/proyectos-page.styles'

interface ProyectosHeaderPremiumProps {
  onNuevoProyecto?: () => void
  totalProyectos: number
}

export function ProyectosHeaderPremium({
  onNuevoProyecto,
  totalProyectos,
}: ProyectosHeaderPremiumProps) {
  return (
    <motion.div {...styles.animations.header} className={styles.header.container}>
      {/* Pattern overlay */}
      <div className={styles.header.pattern} />

      {/* Content */}
      <div className={styles.header.content}>
        <div className={styles.header.topRow}>
          {/* Left: Icon + Title */}
          <div className={styles.header.titleGroup}>
            <div className={styles.header.iconCircle}>
              <Building2 className={styles.header.icon} />
            </div>
            <div className={styles.header.titleWrapper}>
              <h1 className={styles.header.title}>Gestión de Proyectos</h1>
              <p className={styles.header.subtitle}>
                Administra y supervisa tus desarrollos inmobiliarios • Sistema integrado
              </p>
            </div>
          </div>

          {/* Right: Badge + Botón */}
          <div className={styles.header.buttonGroup}>
            <span className={styles.header.badge}>
              <Building2 className={styles.header.badgeIcon} />
              {totalProyectos} {totalProyectos === 1 ? 'Proyecto' : 'Proyectos'}
            </span>
            {onNuevoProyecto && (
              <motion.button
                {...styles.animations.button}
                onClick={onNuevoProyecto}
                className={styles.header.button}
              >
                <Plus className={styles.header.buttonIcon} />
                Nuevo Proyecto
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
