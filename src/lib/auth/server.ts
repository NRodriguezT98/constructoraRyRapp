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
  console.log('🔐 [SERVER AUTH] getServerSession() llamado')

  const supabase = await createServerSupabaseClient()

  // ✅ CAMBIO: getUser() valida el token, getSession() solo lee cookies
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.log('  ❌ Sin sesión en server')
    return null
  }

  console.log('  ✅ Sesión obtenida:', user.email)

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
 */
export const getServerUserProfile = cache(async (): Promise<Usuario | null> => {
  const session = await getServerSession()

  if (!session) {
    return null
  }

  const supabase = await createServerSupabaseClient()

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error || !usuario) {
    return null
  }

  return usuario as Usuario
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
  console.log('🔑 [SERVER AUTH] getServerPermissions() llamado')

  const perfil = await getServerUserProfile()

  if (!perfil) {
    console.log('  ❌ Sin perfil, permisos denegados')
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

  console.log('  ✅ Permisos calculados:', { rol, ...permisos })

  return permisos
}
