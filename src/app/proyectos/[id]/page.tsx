import ProyectoDetalleClient from './proyecto-detalle-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProyectoDetallePage({ params }: PageProps) {
  const { id } = await params
  return <ProyectoDetalleClient proyectoId={id} />
}
