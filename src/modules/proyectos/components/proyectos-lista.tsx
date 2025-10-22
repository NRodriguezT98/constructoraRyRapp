'use client'

import { motion } from 'framer-motion'
import {
    staggerContainer,
    staggerItem,
} from '../../../shared/styles/animations'
import { useProyectosStore } from '../store/proyectos.store'
import type { Proyecto } from '../types'
import { ProyectoCard } from './proyecto-card'

interface ProyectosListaProps {
  proyectos: Proyecto[]
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
}

export function ProyectosLista({
  proyectos,
  onEdit,
  onDelete,
}: ProyectosListaProps) {
  const { vista } = useProyectosStore()

  return (
    <motion.div
      variants={staggerContainer}
      initial='hidden'
      animate='visible'
      className={
        vista === 'grid'
          ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
          : 'space-y-3'
      }
    >
      {proyectos.map(proyecto => (
        <motion.div key={proyecto.id} variants={staggerItem}>
          <ProyectoCard
            proyecto={proyecto}
            vista={vista}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
