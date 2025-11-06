/**
 * ============================================
 * AUTH SERVER SERVICE
 * ============================================
 *
 * Servicio de autenticación para Server Components.
 * Proporciona funciones helper para obtener sesión y permisos.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Usuario } from '@/modules/usuarios/types'
import { cache } from 'react'

/**
 * Obtener sesión actual del usuario
 * Usa React cache para evitar múltiples queries en mismo render
 *
 * ✅ SEGURO: Usa getUser() que valida el token con Supabase Auth
 * (en lugar de getSession() que solo lee cookies)
 */
export const getServerSession = cache(async () => {
  const supabase = await createServerSupabaseClient()

  // ✅ CAMBIO: getUser() valida el token, getSession() solo lee cookies
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Retornar objeto compatible con tipo Session
  return {
    user,
    access_token: '', // No necesitamos el token aquí
    expires_at: 0,
    expires_in: 0,
    refresh_token: '',
    token_type: 'bearer',
  }
})/**
 * Obtener perfil completo del usuario autenticado
 * Incluye rol y permisos
 *
 * ✅ OPTIMIZADO: Lee desde JWT claims (no hace query a DB)
 */
export const getServerUserProfile = cache(async (): Promise<Usuario | null> => {
  const session = await getServerSession()

  if (!session) {
    return null
  }

  const user = session.user

  // ✅ Leer rol, nombres y email desde JWT claims
  const rol = (user as any).app_metadata?.user_rol || 'Vendedor'
  const nombres = (user as any).app_metadata?.user_nombres || ''
  const email = (user as any).app_metadata?.user_email || user.email || ''

  // Construir objeto Usuario básico desde JWT
  // NOTA: Campos adicionales (telefono, apellidos, etc.) solo se obtienen
  // si realmente se necesitan mediante query separada y explícita
  const perfil: Partial<Usuario> = {
    id: user.id,
    rol: rol as 'Administrador' | 'Gerente' | 'Vendedor',
    nombres,
    email,
    // Campos requeridos por tipo Usuario pero no disponibles en JWT:
    apellidos: '', // No disponible en JWT
    telefono: null, // No disponible en JWT
    estado: 'Activo', // Asumimos activo si tiene sesión válida
    avatar_url: null,
    preferencias: {},
    creado_por: null,
    ultimo_acceso: new Date().toISOString(),
    fecha_creacion: user.created_at || '',
    fecha_actualizacion: new Date().toISOString(),
    debe_cambiar_password: false,
    intentos_fallidos: 0,
    bloqueado_hasta: null,
  }

  return perfil as Usuario
})

/**
 * Verificar si el usuario tiene un rol específico
 */
export async function hasRole(rol: 'Administrador' | 'Gerente' | 'Vendedor'): Promise<boolean> {
  const perfil = await getServerUserProfile()
  return perfil?.rol === rol
}

/**
 * Verificar si el usuario es administrador
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('Administrador')
}

/**
 * Verificar si el usuario puede acceder a un módulo
 * Basado en matriz de permisos por rol
 */
export async function canAccessModule(modulo: string): Promise<boolean> {
  const perfil = await getServerUserProfile()

  if (!perfil) {
    return false
  }

  // Matriz de permisos: qué roles pueden acceder a qué módulos
  const modulePermissions: Record<string, string[]> = {
    'viviendas': ['Administrador', 'Gerente', 'Vendedor'],
    'clientes': ['Administrador', 'Gerente', 'Vendedor'],
    'proyectos': ['Administrador', 'Gerente', 'Vendedor'],
    'abonos': ['Administrador', 'Gerente'],
    'renuncias': ['Administrador', 'Gerente'],
    'auditorias': ['Administrador'],
    'admin': ['Administrador'],
  }

  const allowedRoles = modulePermissions[modulo]

  if (!allowedRoles) {
    // Si no está en el mapa, permitir a todos los autenticados
    return true
  }

  return allowedRoles.includes(perfil.rol)
}

/**
 * Obtener permisos granulares del usuario
 * Para usar en Server Components
 */
export async function getServerPermissions() {
  const perfil = await getServerUserProfile()

  if (!perfil) {
    return {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canView: false,
      isAdmin: false,
    }
  }

  const rol = perfil.rol

  const permisos = {
    canCreate: ['Administrador', 'Gerente'].includes(rol),
    canEdit: ['Administrador', 'Gerente'].includes(rol),
    canDelete: rol === 'Administrador',
    canView: true, // Si llegó hasta aquí, tiene acceso
    isAdmin: rol === 'Administrador',
  }

  return permisos
}
