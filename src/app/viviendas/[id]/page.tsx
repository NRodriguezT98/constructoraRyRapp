import ViviendaDetalleClient from './vivienda-detalle-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViviendaDetallePage({ params }: PageProps) {
  const { id } = await params

  return <ViviendaDetalleClient viviendaId={id} />
}
