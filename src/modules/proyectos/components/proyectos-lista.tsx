'use client'

import { AnimatePresence, motion } from 'framer-motion'

import type { Proyecto } from '../types'

import { ProyectoCardPremium } from './ProyectoCardPremium'

interface ProyectosListaProps {
  proyectos: Proyecto[]
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
  onRestore?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ProyectosLista({
  proyectos,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  canEdit = false,
  canDelete = false,
}: ProyectosListaProps) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      <AnimatePresence mode="popLayout">
        {proyectos.map(proyecto => (
          <motion.div
            key={proyecto.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <ProyectoCardPremium
              proyecto={proyecto}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
              onRestore={onRestore}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
