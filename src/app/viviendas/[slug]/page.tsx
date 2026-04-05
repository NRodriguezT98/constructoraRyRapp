import { notFound } from 'next/navigation'

import { logger } from '@/lib/utils/logger'
import { resolverSlugViviendaServer } from '@/lib/utils/slug.server'

import ViviendaDetalleClient from './vivienda-detalle-client-new' // ✅ Estructura de proyectos

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Página de detalle de vivienda (Server Component)
 * Extrae el ID del slug y renderiza el componente cliente
 */
export default async function ViviendaDetallePage({ params }: PageProps) {
  try {
    const { slug } = await params

    // Resolver slug a UUID completo
    const viviendaId = await resolverSlugViviendaServer(slug)

    if (!viviendaId) {
      notFound()
    }

    return <ViviendaDetalleClient viviendaId={viviendaId} />
  } catch (error) {
    logger.error('Error crítico en ViviendaDetallePage:', error)
    throw error
  }
}
