/**
 * Ruta: /clientes/[id]/negociaciones/crear
 *
 * Página para crear una nueva negociación con cierre financiero completo
 */

import { CrearNegociacionPage } from '@/modules/clientes/pages/crear-negociacion'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Negociación | RyR Constructora',
  description: 'Crear nueva negociación con cierre financiero completo',
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

  return (
    <CrearNegociacionPage
      clienteId={id}
      clienteNombre={search.nombre}
      viviendaId={search.viviendaId}
      valorVivienda={search.valor ? parseFloat(search.valor) : undefined}
    />
  )
}
