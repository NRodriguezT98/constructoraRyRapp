/**
 * Componente de Header de Clientes
 * Presentacional puro - recibe callbacks por props
 */

'use client'

import { motion } from 'framer-motion'
import { Plus, Users } from 'lucide-react'
import { clientesStyles, fadeInUp } from '../styles'

interface ClientesHeaderProps {
  onNuevoCliente: () => void
}

export function ClientesHeader({ onNuevoCliente }: ClientesHeaderProps) {
  return (
    <motion.div
      className={clientesStyles.headerWrapper}
      variants={fadeInUp}
      initial='initial'
      animate='animate'
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 p-2.5 shadow-lg'>
            <Users className='h-6 w-6 text-white' />
          </div>
          <div>
            <h1 className={clientesStyles.headerTitle}>Gestión de Clientes</h1>
            <p className={clientesStyles.headerSubtitle}>
              Administra tu base de clientes y relaciones comerciales
            </p>
          </div>
        </div>

        <button
          type='button'
          onClick={onNuevoCliente}
          className={`${clientesStyles.button} ${clientesStyles.buttonPrimary}`}
        >
          <Plus className='h-4 w-4' />
          Nuevo Cliente
        </button>
      </div>
    </motion.div>
  )
}
