'use client'

import { motion } from 'framer-motion'
import {
    staggerContainer,
    staggerItem,
} from '../../../shared/styles/animations'
import type { Proyecto } from '../types'
import { ProyectoCardPremium } from './ProyectoCardPremium'

interface ProyectosListaProps {
  proyectos: Proyecto[]
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ProyectosLista({
  proyectos,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}: ProyectosListaProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial='hidden'
      animate='visible'
      className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    >
      {proyectos.map(proyecto => (
        <motion.div key={proyecto.id} variants={staggerItem}>
          <ProyectoCardPremium
            proyecto={proyecto}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
