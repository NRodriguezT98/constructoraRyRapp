/**
 * Página: Crear Nuevo Proyecto (Accordion Wizard)
 * Server Component — obtiene permisos y delega a Client Component
 */

import { getServerPermissions } from '@/lib/auth/server'
import { NuevoProyectoView } from '@/modules/proyectos/components/NuevoProyectoView'

export default async function NuevoProyectoPage() {
  const permisos = await getServerPermissions()

  return <NuevoProyectoView canCreate={permisos.canCreate} />
}
