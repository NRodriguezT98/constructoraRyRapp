import { notFound } from 'next/navigation';

import { resolverSlugAUUID } from '@/lib/utils/slug.utils';

import ViviendaDetalleClient from './vivienda-detalle-client-new'; // ✅ Estructura de proyectos

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
    const viviendaId = await resolverSlugAUUID(slug, 'viviendas')

    if (!viviendaId) {
      notFound()
    }

    return <ViviendaDetalleClient viviendaId={viviendaId} />
  } catch (error) {
    console.error('❌ Error crítico en ViviendaDetallePage:', error)
    throw error
  }
}
