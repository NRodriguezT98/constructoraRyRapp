/**
 * 🎨 Header Hero Premium de Clientes
 * Diseño glassmorphism con gradient cyan→blue→indigo
 * Botón "Nuevo Cliente" integrado en el header (consistente con otros módulos)
 */

'use client'

import { motion } from 'framer-motion'
import { Plus, Users } from 'lucide-react'

import { clientesListaStyles as styles } from '../styles/clientes-lista.styles'

interface ClientesHeaderProps {
  onNuevoCliente?: () => void
  totalClientes: number
}

export function ClientesHeader({
  onNuevoCliente,
  totalClientes,
}: ClientesHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
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

          {/* Acciones del header (badge + botón) */}
          <div className='flex items-center gap-2'>
            <span className={styles.header.badge}>
              <Users className='h-3.5 w-3.5' />
              {totalClientes} Cliente{totalClientes !== 1 ? 's' : ''}
            </span>

            {/* Botón Nuevo Cliente dentro del header */}
            {onNuevoCliente && (
              <motion.button
                type='button'
                onClick={onNuevoCliente}
                className={styles.header.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className='h-4 w-4' />
                Nuevo Cliente
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
