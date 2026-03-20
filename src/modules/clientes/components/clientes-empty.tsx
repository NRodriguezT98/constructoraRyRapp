/**
 * Componente de Estado Vacío para Clientes
 * ✅ Usa EmptyState compartido con theming de clientes
 */

'use client'

import { UserPlus, Users } from 'lucide-react'

import { EmptyState } from '@/shared/components/ui/EmptyState'

interface ClientesEmptyProps {
  onNuevoCliente?: () => void
  mensaje?: string
}

export function ClientesEmpty({ onNuevoCliente, mensaje }: ClientesEmptyProps) {
  return (
    <EmptyState
      icon={Users}
      title={mensaje || 'No hay clientes registrados'}
      description="Comienza agregando tu primer cliente para gestionar tus relaciones comerciales"
      action={onNuevoCliente ? {
        label: 'Crear Primer Cliente',
        onClick: onNuevoCliente,
        icon: UserPlus,
      } : undefined}
      moduleName="clientes"
    />
  )
}
