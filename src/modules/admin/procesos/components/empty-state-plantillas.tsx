/**
 * 📭 EMPTY STATE - PLANTILLAS
 *
 * Estado vacío cuando no hay plantillas creadas.
 * Diseño premium con animación de entrada.
 */

'use client'

import { motion } from 'framer-motion'
import { Plus, Settings } from 'lucide-react'
import { procesosStyles as styles } from '../styles/procesos.styles'

interface EmptyStatePlantillasProps {
  onCrear: () => void
}

export function EmptyStatePlantillas({ onCrear }: EmptyStatePlantillasProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={styles.empty.container}
    >
      <Settings className={styles.empty.icon} />
      <h3 className={styles.empty.title}>No hay plantillas creadas</h3>
      <p className={styles.empty.description}>
        Crea tu primera plantilla de proceso para comenzar a gestionar
        las etapas de negociación con tus clientes.
      </p>
      <button onClick={onCrear} className={styles.empty.button}>
        <Plus className="w-5 h-5 mr-2" />
        Crear Primera Plantilla
      </button>
    </motion.div>
  )
}
