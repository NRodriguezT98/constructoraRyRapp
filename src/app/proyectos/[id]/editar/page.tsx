import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { resolverSlugProyectoServer } from '@/lib/utils/slug.server'
import { EditarProyectoView } from '@/modules/proyectos/components/EditarProyectoView'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarProyectoPage({ params }: PageProps) {
  const { id } = await params
  const permisos = await getServerPermissions('proyectos')

  if (!permisos.canEdit && !permisos.isAdmin) {
    forbidden()
  }

  const proyectoUUID = await resolverSlugProyectoServer(id)

  if (!proyectoUUID) {
    return (
      <div className='flex min-h-screen items-center justify-center text-gray-500'>
        Proyecto no encontrado
      </div>
    )
  }

  return (
    <EditarProyectoView proyectoId={proyectoUUID} canEdit={permisos.canEdit} />
  )
}
