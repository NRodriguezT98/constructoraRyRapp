import { resolverSlugProyecto } from '@/lib/utils/slug.utils'
import ProyectoDetalleClient from './proyecto-detalle-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProyectoDetallePage({ params }: PageProps) {
  const { id } = await params

  // Resolver slug a UUID si es necesario
  const proyectoUUID = await resolverSlugProyecto(id)

  if (!proyectoUUID) {
    // TODO: Página 404
    return <div>Proyecto no encontrado</div>
  }

  return <ProyectoDetalleClient proyectoId={proyectoUUID} />
}
