'use client'

import { Home, Plus } from 'lucide-react'

import { EmptyState } from '@/shared/components/ui/EmptyState'

interface ViviendasEmptyProps {
  onCrear: () => void
}

/**
 * Estado vacío cuando no hay viviendas
 * ✅ Usa EmptyState compartido con theming de viviendas
 */
export function ViviendasEmpty({ onCrear }: ViviendasEmptyProps) {
  return (
    <EmptyState
      icon={Home}
      title='No hay viviendas registradas'
      description='Comienza agregando la primera vivienda de tu proyecto'
      action={{
        label: 'Crear Primera Vivienda',
        onClick: onCrear,
        icon: Plus,
      }}
      moduleName='viviendas'
    />
  )
}
