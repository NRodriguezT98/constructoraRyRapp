import { getServerPermissions } from '@/lib/auth/server'
import { resolverSlugVivienda } from '@/lib/utils/slug.utils'
import { EditarViviendaAccordionView } from '@/modules/viviendas/components/EditarViviendaAccordionView'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EditarViviendaPage({ params }: PageProps) {
  const { slug } = await params
  const permisos = await getServerPermissions()

  const viviendaUUID = await resolverSlugVivienda(slug)

  if (!viviendaUUID) {
    return (
      <div className='flex min-h-screen items-center justify-center text-gray-500'>
        Vivienda no encontrada
      </div>
    )
  }

  return (
    <EditarViviendaAccordionView
      viviendaId={viviendaUUID}
      canEdit={permisos.canEdit}
    />
  )
}
