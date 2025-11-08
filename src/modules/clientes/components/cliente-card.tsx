/**
 * ClienteCard - Wrapper inteligente que renderiza la card apropiada según el estado
 * Similar al patrón usado en ViviendaCard
 */

'use client'

import type { ClienteResumen } from '../types'

import { ClienteCardActivo, ClienteCardInactivo, ClienteCardInteresado } from './cards'

interface ClienteCardProps {
  cliente: ClienteResumen
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
  onRegistrarAbono?: (cliente: ClienteResumen) => void
}

/**
 * Componente inteligente que renderiza la card apropiada según el estado del cliente
 */
export function ClienteCard({
  cliente,
  onVer,
  onEditar,
  onEliminar,
  onRegistrarAbono,
}: ClienteCardProps) {
  // Renderizado condicional según el estado
  switch (cliente.estado) {
    case 'Interesado':
      return (
        <ClienteCardInteresado
          cliente={cliente}
          onVer={onVer}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      )

    case 'Activo':
      return (
        <ClienteCardActivo
          cliente={cliente}
          onVer={onVer}
          onEditar={onEditar}
          onEliminar={onEliminar}
          onRegistrarAbono={onRegistrarAbono}
        />
      )

    case 'Inactivo':
      return (
        <ClienteCardInactivo
          cliente={cliente}
          onVer={onVer}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      )

    default:
      // Fallback a card de interesado
      return (
        <ClienteCardInteresado
          cliente={cliente}
          onVer={onVer}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      )
  }
}
