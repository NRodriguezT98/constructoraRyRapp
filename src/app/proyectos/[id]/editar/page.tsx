import { getServerPermissions } from '@/lib/auth/server'
import { resolverSlugProyecto } from '@/lib/utils/slug.utils'
import { EditarProyectoView } from '@/modules/proyectos/components/EditarProyectoView'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarProyectoPage({ params }: PageProps) {
  const { id } = await params
  const permisos = await getServerPermissions()

  const proyectoUUID = await resolverSlugProyecto(id)

  if (!proyectoUUID) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Proyecto no encontrado</div>
  }

  return <EditarProyectoView proyectoId={proyectoUUID} canEdit={permisos.canEdit} />
}
