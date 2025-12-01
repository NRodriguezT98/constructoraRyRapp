/**
 * Ruta: /clientes/[id]/asignar-vivienda
 *
 * Página para asignar una vivienda a un cliente con cierre financiero completo
 */

import { Metadata } from 'next'

import { resolverSlugCliente } from '@/lib/utils/slug.utils'
import { AsignarViviendaPage } from '@/modules/clientes/pages/asignar-vivienda'

export const metadata: Metadata = {
  title: 'Asignar Vivienda | RyR Constructora',
  description: 'Asignar vivienda a cliente con cierre financiero completo',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    nombre?: string
    viviendaId?: string
    valor?: string
  }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params
  const search = await searchParams

  // Resolver slug a UUID
  const clienteUUID = await resolverSlugCliente(id) || id

  return (
    <AsignarViviendaPage
      clienteId={clienteUUID}
      clienteSlug={id} // Pasar el slug original para links
      clienteNombre={search.nombre}
      viviendaId={search.viviendaId}
      valorVivienda={search.valor ? parseFloat(search.valor) : undefined}
    />
  )
}
