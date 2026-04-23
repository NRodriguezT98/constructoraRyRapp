/**
 * ============================================
 * SERVICE: Invalidación de Sesiones por Cambio de Permisos
 * ============================================
 *
 * Gestión de sesiones cuando cambian los permisos de un rol.
 *
 * ARQUITECTURA JWT:
 *   - Los permisos se escriben en el JWT automáticamente en cada login
 *     a través del hook PostgreSQL custom_access_token_hook (user_permisos claim).
 *   - No se requiere sincronización manual post-login.
 *   - Cuando cambian los permisos de un rol → forzar re-login para que
 *     el hook regenere el JWT con los permisos actualizados.
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import { logger } from '@/lib/utils/logger'

import type { Rol } from '../types'

/**
 * Invalidar sesiones de todos los usuarios activos de un rol.
 *
 * Se llama cuando cambian los permisos del rol para que en el próximo
 * login el hook custom_access_token_hook escriba los nuevos permisos en el JWT.
 */
export async function invalidarSesionPorCambioPermisos(
  rol: Rol
): Promise<void> {
  try {
    const { data: usuarios, error: errorUsuarios } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('rol', rol)
      .eq('estado', 'Activo')

    if (errorUsuarios) {
      logger.error(
        '❌ [JWT] Error obteniendo usuarios para invalidación:',
        errorUsuarios
      )
      throw errorUsuarios
    }

    if (!usuarios || usuarios.length === 0) {
      logger.info(`ℹ️ [JWT] No hay usuarios activos con rol: ${rol}`)
      return
    }

    for (const usuario of usuarios) {
      try {
        await supabaseAdmin.auth.admin.signOut(usuario.id, 'global')
      } catch (error) {
        logger.error(
          `⚠️ [JWT] Error invalidando sesión de ${usuario.id}:`,
          error
        )
      }
    }

    logger.info(
      `✅ [JWT] Sesiones invalidadas para ${usuarios.length} usuario(s) con rol: ${rol}`
    )
  } catch (error) {
    logger.error('❌ [JWT] Error en invalidación de sesiones:', error)
    throw error
  }
}
