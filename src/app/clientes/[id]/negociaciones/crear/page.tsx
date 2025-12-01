/**
 * Ruta: /clientes/[id]/negociaciones/crear
 *
 * ⚠️ REDIRIGE A: /clientes/[id]/asignar-vivienda
 * Esta ruta se mantiene por backward compatibility
 */

import { redirect } from 'next/navigation'


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

  // Construir query params
  const queryParams = new URLSearchParams()
  if (search.nombre) queryParams.set('nombre', search.nombre)
  if (search.viviendaId) queryParams.set('viviendaId', search.viviendaId)
  if (search.valor) queryParams.set('valor', search.valor)

  const queryString = queryParams.toString()
  const newUrl = `/clientes/${id}/asignar-vivienda${queryString ? `?${queryString}` : ''}`

  // Redirigir a la nueva ruta
  redirect(newUrl)
}
