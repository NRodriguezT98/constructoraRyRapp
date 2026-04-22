/**
 * Ruta: /clientes/[id]/asignar-vivienda-v2
 *
 * Nuevo formulario acordeón para asignar vivienda a un cliente.
 * Reemplaza al formulario de 3 pasos con sidebar.
 */

import type { Metadata } from 'next'

import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { resolverSlugCliente } from '@/lib/utils/slug.utils'
import { AsignarViviendaV2Page } from '@/modules/clientes/pages/asignar-vivienda-v2'

export const metadata: Metadata = {
  title: 'Asignar Vivienda | RyR Constructora',
  description: 'Asignar vivienda a cliente con formulario acordeón progresivo',
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ nombre?: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { canCreate, isAdmin } = await getServerPermissions('negociaciones')

  if (!canCreate && !isAdmin) {
    forbidden()
  }

  const { id } = await params
  const search = await searchParams

  const clienteUUID = (await resolverSlugCliente(id)) || id

  return (
    <AsignarViviendaV2Page
      clienteId={clienteUUID}
      clienteSlug={id}
      clienteNombre={search.nombre}
    />
  )
}
