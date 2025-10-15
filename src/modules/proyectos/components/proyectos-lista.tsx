'use client'

import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../../shared/styles/animations'
import { useProyectosStore } from '../store/proyectos.store'
import { ProyectoCard } from './proyecto-card'
import type { Proyecto } from '../types'

interface ProyectosListaProps {
  proyectos: Proyecto[]
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
}

export function ProyectosLista({ proyectos, onEdit, onDelete }: ProyectosListaProps) {
  const { vista } = useProyectosStore()

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={
        vista === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }
    >
      {proyectos.map((proyecto) => (
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
