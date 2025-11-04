'use client'

import { motion } from 'framer-motion'
import { Building2, Plus, Sparkles } from 'lucide-react'

interface ProyectosHeaderProps {
  onNuevoProyecto?: () => void
}

export function ProyectosHeader({ onNuevoProyecto }: ProyectosHeaderProps) {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      {/* Título compacto con icono */}
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md shadow-blue-500/30'>
          <Building2 className='h-5 w-5 text-white' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Proyectos
          </h1>
          <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
            Administra y supervisa tus desarrollos inmobiliarios
          </p>
        </div>
      </div>

      {/* Botón CTA compacto (solo si puede crear) */}
      {onNuevoProyecto && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNuevoProyecto}
          className='group relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/40'
        >
          <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100' />
          <Plus className='relative h-4 w-4' />
          <span className='relative'>Nuevo Proyecto</span>
          <Sparkles className='relative h-3.5 w-3.5 opacity-70' />
        </motion.button>
      )}
    </div>
  )
}
