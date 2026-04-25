'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  ChevronRight,
  Hash,
  LayoutDashboard,
  Plus,
} from 'lucide-react'

import { ProtectedLink } from '@/shared/components/ui/ProtectedLink'

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
    <motion.div
      {...styles.animations.header}
      className={styles.header.container}
    >
      {/* Pattern overlay */}
      <div className={styles.header.pattern} />

      {/* Content */}
      <div className={styles.header.content}>
        {/* Breadcrumb */}
        <div className='mb-3 flex items-center gap-1.5'>
          <LayoutDashboard className='h-3 w-3 text-green-200' />
          <ProtectedLink
            href='/dashboard'
            modulo='proyectos'
            accion='ver'
            className='text-xs text-green-200 transition-colors hover:text-white'
          >
            Dashboard
          </ProtectedLink>
          <ChevronRight className='h-3 w-3 text-green-300/60' />
          <span className='text-xs font-semibold text-white'>Proyectos</span>
        </div>

        <div className={styles.header.topRow}>
          {/* Left: Icon + Title */}
          <div className={styles.header.titleGroup}>
            <div className={styles.header.iconCircle}>
              <Building2 className={styles.header.icon} />
            </div>
            <div className={styles.header.titleWrapper}>
              <h1 className={styles.header.title}>Gestión de Proyectos</h1>
              <p className={styles.header.subtitle}>
                Administra y supervisa tus desarrollos inmobiliarios • Sistema
                integrado
              </p>
            </div>
          </div>

          {/* Right: Badge + Botón */}
          <div className={styles.header.buttonGroup}>
            <span className={styles.header.badge}>
              <Hash className={styles.header.badgeIcon} />
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
