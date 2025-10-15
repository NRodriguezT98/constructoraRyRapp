'use client'

import { EmptyState } from '../../../shared/components/ui/EmptyState'

interface ProyectosEmptyProps {
  onCrear: () => void
}

export function ProyectosEmpty({ onCrear }: ProyectosEmptyProps) {
  return (
    <EmptyState
      title="No hay proyectos"
      description="Comienza creando tu primer proyecto de construcción"
      action={{
        label: 'Crear Proyecto',
        onClick: onCrear
      }}
    />
  )
}
