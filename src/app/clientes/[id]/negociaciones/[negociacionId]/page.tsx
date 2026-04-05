import { notFound } from 'next/navigation'

import { resolverSlugClienteServer } from '@/lib/utils/slug.server'

import NegociacionDetalleClient from './negociacion-detalle-client'

interface PageProps {
  params: Promise<{
    id: string
    negociacionId: string
  }>
}

export default async function NegociacionDetallePage({ params }: PageProps) {
  const { id, negociacionId } = await params

  const clienteUUID = await resolverSlugClienteServer(id)

  if (!clienteUUID) {
    notFound()
  }

  return (
    <NegociacionDetalleClient
      clienteId={clienteUUID}
      negociacionId={negociacionId}
    />
  )
}
