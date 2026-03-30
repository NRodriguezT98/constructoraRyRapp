/**
 * Página: Editar Cliente (Accordion Wizard)
 * Server Component — obtiene permisos y delega a Client Component
 *
 * ✅ REGLA #-11: Edición en página propia, no en modal
 */

import { getServerPermissions } from '@/lib/auth/server'
import { EditarClienteAccordionView } from '@/modules/clientes/components/EditarClienteAccordionView'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarClientePage({ params }: PageProps) {
  const { id } = await params
  const permisos = await getServerPermissions('clientes')

  return (
    <EditarClienteAccordionView clienteId={id} canEdit={permisos.canEdit} />
  )
}
