/**
 * Componente de Estado Vacío para Clientes
 * Presentacional puro - muestra cuando no hay datos
 */

'use client'

import { motion } from 'framer-motion'
import { UserPlus, Users } from 'lucide-react'
import { clientesStyles, scaleIn } from '../styles'

interface ClientesEmptyProps {
  onNuevoCliente?: () => void
  mensaje?: string
}

export function ClientesEmpty({ onNuevoCliente, mensaje }: ClientesEmptyProps) {
  return (
    <motion.div
      className={clientesStyles.card}
      variants={scaleIn}
      initial='initial'
      animate='animate'
    >
      <div className={clientesStyles.emptyState}>
        <Users className={clientesStyles.emptyIcon} />
        <h3 className={clientesStyles.emptyTitle}>
          {mensaje || 'No hay clientes registrados'}
        </h3>
        <p className={clientesStyles.emptyDescription}>
          Comienza agregando tu primer cliente para gestionar tus relaciones comerciales
        </p>
        {onNuevoCliente && (
          <button
            type='button'
            onClick={onNuevoCliente}
            className={`${clientesStyles.button} ${clientesStyles.buttonPrimary}`}
          >
            <UserPlus className='h-5 w-5' />
            Crear Primer Cliente
          </button>
        )}
      </div>
    </motion.div>
  )
}
