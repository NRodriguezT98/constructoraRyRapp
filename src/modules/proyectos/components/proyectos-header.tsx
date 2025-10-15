'use client'

import { motion } from 'framer-motion'
import { Building2, Plus, Sparkles } from 'lucide-react'

interface ProyectosHeaderProps {
  onNuevoProyecto: () => void
}

export function ProyectosHeader({ onNuevoProyecto }: ProyectosHeaderProps) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      {/* Título moderno con icono */}
      <div className='flex items-center gap-4'>
        <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30'>
          <Building2 className='h-7 w-7 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Proyectos
          </h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Administra y supervisa tus desarrollos inmobiliarios
          </p>
        </div>
      </div>

      {/* Botón CTA moderno */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNuevoProyecto}
        className='group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40'
      >
        <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100' />
        <Plus className='relative h-5 w-5' />
        <span className='relative'>Nuevo Proyecto</span>
        <Sparkles className='relative h-4 w-4 opacity-70' />
      </motion.button>
    </div>
  )
}
