import { notFound } from 'next/navigation'

import { resolverSlugClienteServer } from '@/lib/utils/slug.server'

import AbonosDetalleClient from './abonos-detalle-client'

interface PageProps {
  params: Promise<{ clienteId: string }>
}

export default async function AbonosDetallePage({ params }: PageProps) {
  const { clienteId } = await params

  const clienteUUID = await resolverSlugClienteServer(clienteId)

  if (!clienteUUID) {
    notFound()
  }

  return <AbonosDetalleClient clienteId={clienteUUID} />
}
