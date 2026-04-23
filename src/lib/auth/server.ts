/**
 * ============================================
 * AUTH SERVER SERVICE
 * ============================================
 *
 * Servicio de autenticación para Server Components.
 * Proporciona funciones helper para obtener sesión y permisos.
 */

import { cache } from 'react'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { errorLog } from '@/lib/utils/logger'
import type { Usuario } from '@/modules/usuarios/types'

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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // También obtener la sesión completa para acceder al access_token
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Retornar objeto compatible con tipo Session
  return {
    user,
    access_token: session?.access_token || '',
    expires_at: session?.expires_at || 0,
    expires_in: session?.expires_in || 0,
    refresh_token: session?.refresh_token || '',
    token_type: 'bearer' as const,
  }
}) /**
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
  let rol = 'Administrador de Obra'
  let nombres = ''
  let email: string = user.email || ''

  // ✅ Decodificar JWT para leer custom claims
  // Los claims custom están en el root del JWT payload, no en user.app_metadata
  if (session.access_token) {
    try {
      // Decodificar JWT (Edge Runtime compatible - sin Buffer)
      const parts = session.access_token.split('.')
      if (parts.length === 3) {
        // Decodificar base64 sin Buffer (compatible con Edge Runtime y Node.js)
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        // Agregar padding si es necesario
        while (base64.length % 4) {
          base64 += '='
        }

        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        const payload = JSON.parse(jsonPayload)

        // Leer claims custom del payload
        rol = payload.user_rol || 'Administrador de Obra'
        nombres = payload.user_nombres || ''
        email = payload.user_email || user.email || ''
      }
    } catch (error) {
      errorLog('auth-jwt-decode', error)
      // Fallback a valores por defecto
    }
  }

  // Construir objeto Usuario básico desde JWT
  // NOTA: Campos adicionales (telefono, apellidos, etc.) solo se obtienen
  // si realmente se necesitan mediante query separada y explícita
  const perfil: Partial<Usuario> = {
    id: user.id,
    rol: rol as
      | 'Administrador'
      | 'Contabilidad'
      | 'Administrador de Obra'
      | 'Gerencia',
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
export async function hasRole(
  rol: 'Administrador' | 'Contabilidad' | 'Administrador de Obra' | 'Gerencia'
): Promise<boolean> {
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
    viviendas: [
      'Administrador',
      'Contabilidad',
      'Administrador de Obra',
      'Gerencia',
    ],
    clientes: [
      'Administrador',
      'Contabilidad',
      'Administrador de Obra',
      'Gerencia',
    ],
    proyectos: [
      'Administrador',
      'Contabilidad',
      'Administrador de Obra',
      'Gerencia',
    ],
    abonos: ['Administrador', 'Contabilidad', 'Gerencia'],
    documentos: [
      'Administrador',
      'Contabilidad',
      'Administrador de Obra',
      'Gerencia',
    ],
    negociaciones: ['Administrador', 'Contabilidad', 'Gerencia'],
    auditorias: ['Administrador', 'Gerencia'],
    admin: ['Administrador'],
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
 *
 * @param modulo - Módulo específico (opcional). Si se pasa, consulta permisos_rol en DB.
 *                 Si no se pasa, usa permisos genéricos por rol (backward compatible).
 */
export async function getServerPermissions(modulo?: string) {
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

  // Administrador siempre tiene todos los permisos
  if (rol === 'Administrador') {
    return {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canView: true,
      isAdmin: true,
    }
  }

  // Si se especifica módulo, consultar permisos específicos desde DB
  if (modulo) {
    const supabase = await createServerSupabaseClient()
    const { data: permisos } = await supabase
      .from('permisos_rol')
      .select('accion, permitido')
      .eq('rol', rol)
      .eq('modulo', modulo)
      .eq('permitido', true)

    const acciones = new Set((permisos ?? []).map(p => p.accion))

    return {
      canCreate: acciones.has('crear') || acciones.has('asignar'),
      canEdit: acciones.has('editar') || acciones.has('trasladar'),
      canDelete: acciones.has('eliminar'),
      canView: acciones.has('ver'),
      isAdmin: false,
    }
  }

  // Fallback genérico (backward compatible)
  return {
    canCreate: ['Administrador', 'Contabilidad'].includes(rol),
    canEdit: ['Administrador', 'Contabilidad'].includes(rol),
    canDelete: false,
    canView: true,
    isAdmin: false,
  }
}
