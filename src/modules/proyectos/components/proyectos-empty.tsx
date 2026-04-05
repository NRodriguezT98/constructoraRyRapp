'use client'

import { Building2, Plus } from 'lucide-react'

import { EmptyState } from '@/shared/components/ui/EmptyState'

interface ProyectosEmptyProps {
  onCrear?: () => void
}

export function ProyectosEmpty({ onCrear }: ProyectosEmptyProps) {
  return (
    <EmptyState
      icon={Building2}
      title='No hay proyectos'
      description='Comienza creando tu primer proyecto de construcción'
      action={
        onCrear
          ? {
              label: 'Crear Proyecto',
              onClick: onCrear,
              icon: Plus,
            }
          : undefined
      }
      moduleName='proyectos'
    />
  )
}
