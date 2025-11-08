import { resolverSlugVivienda } from '@/lib/utils/slug.utils'

import ViviendaDetalleClient from './vivienda-detalle-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViviendaDetallePage({ params }: PageProps) {
  const { id } = await params

  // Resolver slug a UUID si es necesario
  const viviendaUUID = await resolverSlugVivienda(id) || id

  return <ViviendaDetalleClient viviendaId={viviendaUUID} />
}
