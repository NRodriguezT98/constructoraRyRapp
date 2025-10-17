import ClienteDetalleClient from './cliente-detalle-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClienteDetallePage({ params }: PageProps) {
  const { id } = await params

  return <ClienteDetalleClient clienteId={id} />
}
