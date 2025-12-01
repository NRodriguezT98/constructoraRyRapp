/**
 * ============================================
 * REACT QUERY: Autenticación - Mutations
 * ============================================
 *
 * Mutaciones de React Query para login, logout y gestión de sesión.
 * Invalida automáticamente las queries relacionadas.
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createClient } from '@/lib/supabase/client'
import { debugLog, errorLog, successLog, warnLog } from '@/lib/utils/logger'

import { authKeys } from './useAuthQuery'

const supabase = createClient()

// ============================================
// MUTATION: Login
// ============================================

interface LoginCredentials {
  email: string
  password: string
}

/**
 * Mutación para iniciar sesión
 * Invalida queries de auth después del login exitoso
 */
export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      debugLog('🔐 Login mutation iniciado', { email })

      // 1. Iniciar sesión con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      debugLog('📥 Respuesta de Supabase Auth', {
        hasUser: !!authData?.user,
        hasSession: !!authData?.session,
      })

      if (authError) {
        errorLog('login-mutation-auth', authError, { email })
        throw authError
      }
      if (!authData.user) {
        const error = new Error('No se pudo obtener el usuario')
        errorLog('login-mutation-no-user', error, { email })
        throw error
      }

      successLog('Usuario autenticado con Supabase')

      // 2. Obtener perfil del usuario
      const { data: perfilData, error: perfilError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      debugLog('📥 Perfil obtenido', {
        hasPerfil: !!perfilData,
        rol: perfilData?.rol,
      })

      if (perfilError) {
        errorLog('login-mutation-perfil', perfilError, { userId: authData.user.id })
        throw perfilError
      }

      // ✅ 3. Sincronizar permisos al JWT (async, no bloquea login)
      try {
        const syncResponse = await fetch('/api/auth/sync-permisos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: authData.user.id,
            rol: perfilData.rol,
          }),
        })

        if (syncResponse.ok) {
          successLog('Permisos sincronizados al JWT')
        } else {
          warnLog('Error sincronizando permisos (no crítico)', { status: syncResponse.status })
        }
      } catch (error) {
        warnLog('Error sincronizando permisos (no crítico)', error)
      }

      debugLog('🎉 Login mutation completado exitosamente')

      return {
        session: authData.session,
        user: authData.user,
        perfil: perfilData,
      }
    },
    onSuccess: (data) => {
      debugLog('✅ Login mutation onSuccess ejecutado')

      // Invalidar todas las queries de autenticación
      queryClient.invalidateQueries({ queryKey: authKeys.all })

      // Establecer datos en cache inmediatamente
      queryClient.setQueryData(authKeys.session(), data.session)
      queryClient.setQueryData(authKeys.user(), data.user)
      queryClient.setQueryData(authKeys.perfil(data.user.id), data.perfil)

      successLog(`Login exitoso: ${data.user.email}`)
    },
    onError: (error: Error) => {
      errorLog('login-mutation-general', error)
    },
  })
}

// ============================================
// MUTATION: Logout
// ============================================

/**
 * Mutación para cerrar sesión
 * Limpia todo el cache de autenticación
 * NOTA: No maneja navegación ni toasts (responsabilidad del hook useLogout)
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      debugLog('🔐 Ejecutando supabase.auth.signOut()...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        errorLog('logout-mutation', error)
        throw error
      }
      successLog('SignOut ejecutado correctamente')
    },
    onSuccess: () => {
      debugLog('🧹 Limpiando cache de autenticación...')

      // Limpiar TODAS las queries de autenticación
      queryClient.removeQueries({ queryKey: authKeys.all })

      // Resetear cache completo (opcional, pero recomendado)
      queryClient.clear()

      successLog('Cache de autenticación limpiado')
    },
    onError: (error: Error) => {
      errorLog('logout-mutation-error', error)
    },
  })
}

// ============================================
// MUTATION: Actualizar Perfil
// ============================================

interface UpdatePerfilData {
  nombres?: string
  apellidos?: string
  debe_cambiar_password?: boolean
}

/**
 * Mutación para actualizar el perfil del usuario
 * Usa optimistic updates para mejor UX
 */
export function useUpdatePerfilMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: UpdatePerfilData) => {
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async (updates) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: authKeys.perfil(userId) })

      // Snapshot del valor anterior
      const previousPerfil = queryClient.getQueryData(authKeys.perfil(userId))

      // Actualización optimista
      queryClient.setQueryData(authKeys.perfil(userId), (old: any) => ({
        ...old,
        ...updates,
      }))

      return { previousPerfil }
    },
    onError: (err, updates, context) => {
      // Revertir en caso de error
      if (context?.previousPerfil) {
        queryClient.setQueryData(authKeys.perfil(userId), context.previousPerfil)
      }
      console.error('❌ Error actualizando perfil:', err)
    },
    onSuccess: () => {
      // Invalidar para refetch
      queryClient.invalidateQueries({ queryKey: authKeys.perfil(userId) })
      console.log('✅ Perfil actualizado')
    },
  })
}

// ============================================
// MUTATION: Refrescar Sesión
// ============================================

/**
 * Mutación para refrescar la sesión actual
 * Útil cuando el token está por expirar
 */
export function useRefreshSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      return data.session
    },
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.session(), session)
      console.log('✅ Sesión refrescada')
    },
    onError: (error: Error) => {
      console.error('❌ Error refrescando sesión:', error.message)
    },
  })
}
