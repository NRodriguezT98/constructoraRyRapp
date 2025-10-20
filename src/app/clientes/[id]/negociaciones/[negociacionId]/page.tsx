import NegociacionDetalleClient from './negociacion-detalle-client'

interface PageProps {
  params: Promise<{
    id: string
    negociacionId: string
  }>
}

export default async function NegociacionDetallePage({ params }: PageProps) {
  const { id, negociacionId } = await params

  return <NegociacionDetalleClient clienteId={id} negociacionId={negociacionId} />
}
