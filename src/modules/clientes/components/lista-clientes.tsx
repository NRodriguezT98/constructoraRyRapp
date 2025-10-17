/**
 * Componente principal de Lista de Clientes
 * Presentacional puro - recibe datos y callbacks por props
 */

'use client'

import { motion } from 'framer-motion'
import { clientesStyles, staggerContainer } from '../styles'
import type { ClienteResumen } from '../types'
import { ClienteCard } from './cliente-card'
import { ClientesEmpty } from './clientes-empty'
import { ClientesSkeleton } from './clientes-skeleton'

interface ListaClientesProps {
  clientes: ClienteResumen[]
  isLoading: boolean
  onVerCliente?: (cliente: ClienteResumen) => void
  onEditarCliente?: (cliente: ClienteResumen) => void
  onEliminarCliente?: (cliente: ClienteResumen) => void
  onNuevoCliente?: () => void
}

export function ListaClientes({
  clientes,
  isLoading,
  onVerCliente,
  onEditarCliente,
  onEliminarCliente,
  onNuevoCliente,
}: ListaClientesProps) {
  // Estado de carga
  if (isLoading) {
    return <ClientesSkeleton />
  }

  // Estado vacío
  if (clientes.length === 0) {
    return <ClientesEmpty onNuevoCliente={onNuevoCliente} />
  }

  // Lista de clientes
  return (
    <motion.div
      className={clientesStyles.grid}
      variants={staggerContainer}
      initial='initial'
      animate='animate'
    >
      {clientes.map((cliente) => (
        <ClienteCard
          key={cliente.id}
          cliente={cliente}
          onVer={onVerCliente}
          onEditar={onEditarCliente}
          onEliminar={onEliminarCliente}
        />
      ))}
    </motion.div>
  )
}
