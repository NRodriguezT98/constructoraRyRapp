import { notFound } from 'next/navigation'

import { resolverSlugAUUID } from '@/lib/utils/slug.utils'

import ViviendaDetalleClient from './vivienda-detalle-client-new'; // ✅ Estructura de proyectos

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Página de detalle de vivienda (Server Component)
 * Extrae el ID del slug y renderiza el componente cliente
 */
export default async function ViviendaDetallePage({ params }: PageProps) {
  console.log('🏠 [PAGE SERVER] ========== INICIO ==========')

  try {
    const { slug } = await params
    console.log('🏠 [PAGE SERVER] Slug recibido:', slug)

    // Resolver slug a UUID completo
    const viviendaId = await resolverSlugAUUID(slug, 'viviendas')
    console.log('🏠 [PAGE SERVER] UUID resuelto:', viviendaId)

    if (!viviendaId) {
      console.warn('🏠 [PAGE SERVER] ⚠️ UUID no encontrado, mostrando 404')
      notFound()
    }

    console.log('🏠 [PAGE SERVER] ✅ Renderizando cliente con UUID:', viviendaId)

    return <ViviendaDetalleClient viviendaId={viviendaId} />
  } catch (error) {
    console.error('🏠 [PAGE SERVER] ❌ ERROR CRÍTICO:', error)
    console.error('🏠 [PAGE SERVER] Stack:', error instanceof Error ? error.stack : 'No stack')
    throw error
  }
}
