/**
 * ============================================
 * SERVICE: Permisos JWT Cache
 * ============================================
 *
 * Servicio para cachear permisos en JWT metadata.
 * Mejora performance del middleware (0 queries en navegación).
 *
 * ARQUITECTURA:
 * 1. Al login â†’ Cargar permisos + Guardar en JWT
 * 2. Middleware â†’ Leer del JWT (sin DB query)
 * 3. Al cambiar permisos â†’ Invalidar sesión
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type { Rol } from '../types'

/**
 * Formato compacto de permisos para JWT
 * Ejemplo: ["proyectos.ver", "documentos.crear"]
 */
export type PermisoCompacto = string

/**
 * Obtener permisos en formato compacto para JWT
 */
export async function obtenerPermisosParaJWT(rol: Rol): Promise<PermisoCompacto[]> {

  // Administrador: No necesita cache (bypass automático)
  if (rol === 'Administrador') {
    return ['*.*'] // Wildcard = todos los permisos
  }

  const { data, error } = await supabase
    .from('permisos_rol')
    .select('modulo, accion')
    .eq('rol', rol)
    .eq('permitido', true)

  if (error) {
    logger.error('❌ [JWT] Error obteniendo permisos:', error)
    throw error
  }

  // Convertir a formato compacto: "modulo.accion"
  const permisosCompactos = data.map(p => `${p.modulo}.${p.accion}`)

  return permisosCompactos
}

/**
 * Sincronizar permisos del usuario al JWT metadata
 * Se ejecuta al login y al cambiar permisos
 */
export async function sincronizarPermisosAlJWT(
  userId: string,
  rol: Rol
): Promise<void> {

  try {
    // Obtener permisos en formato compacto
    const permisos = await obtenerPermisosParaJWT(rol)

    // Actualizar metadata del usuario con admin client
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        permisos_cache: permisos,
        permisos_cache_updated_at: new Date().toISOString(),
      },
    })

    if (error) {
      logger.error('❌ [JWT] Error actualizando metadata:', error)
      throw error
    }

  } catch (error) {
    logger.error('❌ [JWT] Error en sincronización:', error)
    throw error
  }
}

/**
 * Verificar si un permiso existe en el cache del JWT
 * Usado por el middleware (ultra rápido, sin query)
 */
export function tienePermisoEnCache(
  permisosCache: PermisoCompacto[],
  modulo: string,
  accion: string
): boolean {
  // Wildcard para Administrador
  if (permisosCache.includes('*.*')) {
    return true
  }

  // Buscar permiso específico
  return permisosCache.includes(`${modulo}.${accion}`)
}

/**
 * Invalidar sesión de un usuario (fuerza re-login)
 * Se ejecuta cuando cambian los permisos de su rol
 */
export async function invalidarSesionPorCambioPermisos(
  rol: Rol
): Promise<void> {

  try {
    // Obtener todos los usuarios con ese rol
    const { data: usuarios, error: errorUsuarios } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('rol', rol)
      .eq('estado', 'Activo')

    if (errorUsuarios) {
      logger.error('❌ [JWT] Error obteniendo usuarios:', errorUsuarios)
      throw errorUsuarios
    }


    // Invalidar sesiones de cada usuario (sign out forzado)
    if (usuarios && usuarios.length > 0) {
      for (const usuario of usuarios) {
        try {
          await supabaseAdmin.auth.admin.signOut(usuario.id, 'global')
        } catch (error) {
          logger.error(`⚠️ [JWT] Error invalidando sesión de ${usuario.id}:`, error)
          // Continuar con los demás usuarios
        }
      }
    }

  } catch (error) {
    logger.error('❌ [JWT] Error en invalidación de sesiones:', error)
    throw error
  }
}

/**
 * Hook para sincronizar permisos después de login
 * Llamar desde el login handler
 */
export async function sincronizarPermisosPostLogin(
  userId: string,
  rol: Rol
): Promise<void> {
  try {
    await sincronizarPermisosAlJWT(userId, rol)
  } catch (error) {
    // No bloquear login si falla la sincronización
    logger.error('⚠️ [JWT] Sincronización falló pero login continúa:', error)
  }
}
