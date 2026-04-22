/**
 * Página: Crear Nuevo Proyecto (Accordion Wizard)
 * Server Component — obtiene permisos y delega a Client Component
 */

import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { NuevoProyectoView } from '@/modules/proyectos/components/NuevoProyectoView'

export default async function NuevoProyectoPage() {
  const permisos = await getServerPermissions('proyectos')

  if (!permisos.canCreate && !permisos.isAdmin) {
    forbidden()
  }

  return <NuevoProyectoView canCreate={permisos.canCreate} />
}
