import { notFound } from 'next/navigation'

import { resolverSlugClienteServer } from '@/lib/utils/slug.server'

import ClienteDetalleClient from './cliente-detalle-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClienteDetallePage({ params }: PageProps) {
  const { id } = await params

  const clienteUUID = await resolverSlugClienteServer(id)

  if (!clienteUUID) {
    notFound()
  }

  return <ClienteDetalleClient clienteId={clienteUUID} />
}
