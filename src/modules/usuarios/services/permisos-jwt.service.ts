/**
 * ============================================
 * SERVICE: Permisos JWT Cache
 * ============================================
 *
 * Servicio para cachear permisos en JWT metadata.
 * Mejora performance del middleware (0 queries en navegación).
 *
 * ARQUITECTURA:
 * 1. Al login → Cargar permisos + Guardar en JWT
 * 2. Middleware → Leer del JWT (sin DB query)
 * 3. Al cambiar permisos → Invalidar sesión
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import { supabase } from '@/lib/supabase/client'

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
  console.log('🔐 [JWT] Obteniendo permisos para cachear en JWT:', rol)

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
    console.error('❌ [JWT] Error obteniendo permisos:', error)
    throw error
  }

  // Convertir a formato compacto: "modulo.accion"
  const permisosCompactos = data.map(p => `${p.modulo}.${p.accion}`)

  console.log(`✅ [JWT] ${permisosCompactos.length} permisos cacheados`)
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
  console.log('🔄 [JWT] Sincronizando permisos al JWT para usuario:', userId)

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
      console.error('❌ [JWT] Error actualizando metadata:', error)
      throw error
    }

    console.log('✅ [JWT] Permisos sincronizados al JWT exitosamente')
  } catch (error) {
    console.error('❌ [JWT] Error en sincronización:', error)
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
  console.log('🔄 [JWT] Invalidando sesiones por cambio de permisos:', rol)

  try {
    // Obtener todos los usuarios con ese rol
    const { data: usuarios, error: errorUsuarios } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('rol', rol)
      .eq('estado', 'Activo')

    if (errorUsuarios) {
      console.error('❌ [JWT] Error obteniendo usuarios:', errorUsuarios)
      throw errorUsuarios
    }

    console.log(`🔄 [JWT] Encontrados ${usuarios?.length || 0} usuarios activos con rol ${rol}`)

    // Invalidar sesiones de cada usuario (sign out forzado)
    if (usuarios && usuarios.length > 0) {
      for (const usuario of usuarios) {
        try {
          await supabaseAdmin.auth.admin.signOut(usuario.id, 'global')
          console.log(`✅ [JWT] Sesión invalidada para usuario: ${usuario.id}`)
        } catch (error) {
          console.error(`⚠️ [JWT] Error invalidando sesión de ${usuario.id}:`, error)
          // Continuar con los demás usuarios
        }
      }
    }

    console.log('✅ [JWT] Sesiones invalidadas exitosamente')
  } catch (error) {
    console.error('❌ [JWT] Error en invalidación de sesiones:', error)
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
    console.error('⚠️ [JWT] Sincronización falló pero login continúa:', error)
  }
}
