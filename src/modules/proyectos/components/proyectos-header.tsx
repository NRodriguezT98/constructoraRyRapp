'use client'

import { Building2, Plus } from 'lucide-react'
import { PageHeader } from '../../../shared/components/ui'

interface ProyectosHeaderProps {
  onNuevoProyecto: () => void
}

export function ProyectosHeader({ onNuevoProyecto }: ProyectosHeaderProps) {
  return (
    <PageHeader
      title="Proyectos"
      description="Gestiona tus proyectos de construcción"
      icon={Building2}
      iconColor="from-blue-500 to-blue-600"
      titleGradient="from-blue-600 via-purple-600 to-pink-600"
      action={{
        label: "Nuevo Proyecto",
        onClick: onNuevoProyecto,
        icon: Plus
      }}
    />
  )
}
