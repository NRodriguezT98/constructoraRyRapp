/**
 * 📄 PÁGINA: EDITAR PLANTILLA
 *
 * Ruta: /admin/procesos/[id]/editar
 * Vista dedicada para editar plantillas existentes
 */

'use client'

import { FormularioPlantilla } from '@/modules/admin/procesos/components/formulario-plantilla'
import { use } from 'react'

interface EditarPlantillaPageProps {
  params: Promise<{ id: string }>
}

export default function EditarPlantillaPage({ params }: EditarPlantillaPageProps) {
  const { id } = use(params)

  return <FormularioPlantilla plantillaId={id} />
}
