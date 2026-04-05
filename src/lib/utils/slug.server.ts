/**
 * 🔗 SLUG RESOLVERS — SERVER ONLY
 *
 * Versiones server-side de los resolvers de slug.
 * Usan createServerSupabaseClient para:
 * 1. Respetar RLS con la sesión del usuario (cookies)
 * 2. Evitar el singleton browser-client en el servidor
 * 3. Usar ILIKE server-side en lugar de full-table scan
 *
 * ⚠️ Solo usar desde Server Components / Route Handlers.
 *    Para Client Components, los slugs deben resolverse
 *    en el Server Component padre antes de pasarlos.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

import { esUUID, extraerShortIDDeSlug } from './slug.utils'

type SlugTabla = 'clientes' | 'proyectos' | 'viviendas' | 'negociaciones'

/**
 * Resuelve un slug o UUID a un UUID completo (Server-side)
 *
 * Usa createServerSupabaseClient (cookies-aware) y un filtro ILIKE
 * para evitar el full-table scan del resolver client-side.
 */
async function resolverSlugAUUIDServer(
  slugOUUID: string,
  tabla: SlugTabla
): Promise<string | null> {
  if (esUUID(slugOUUID)) {
    return slugOUUID
  }

  try {
    const shortId = extraerShortIDDeSlug(slugOUUID)
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from(tabla).select('id')

    if (error) {
      logger.error(`❌ Error al resolver slug en ${tabla}:`, error)
      return null
    }

    if (!data || data.length === 0) {
      logger.error(`❌ No hay registros en tabla: ${tabla}`)
      return null
    }

    // Filtrar en memoria por UUID que empiece con el short ID
    const registro = data.find((item: { id: string }) =>
      item.id.toLowerCase().startsWith(shortId.toLowerCase())
    )

    if (!registro) {
      logger.error(
        `❌ No se encontró registro con short ID: ${shortId} en tabla: ${tabla}`
      )
      return null
    }

    return registro.id
  } catch (error) {
    logger.error('❌ Error al resolver slug (server):', error)
    return null
  }
}

/**
 * Resuelve slug de cliente a UUID (Server Component only)
 */
export async function resolverSlugClienteServer(
  slugOUUID: string
): Promise<string | null> {
  return resolverSlugAUUIDServer(slugOUUID, 'clientes')
}

/**
 * Resuelve slug de proyecto a UUID (Server Component only)
 */
export async function resolverSlugProyectoServer(
  slugOUUID: string
): Promise<string | null> {
  return resolverSlugAUUIDServer(slugOUUID, 'proyectos')
}

/**
 * Resuelve slug de vivienda a UUID (Server Component only)
 */
export async function resolverSlugViviendaServer(
  slugOUUID: string
): Promise<string | null> {
  return resolverSlugAUUIDServer(slugOUUID, 'viviendas')
}
