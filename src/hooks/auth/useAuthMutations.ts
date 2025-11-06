/**
 * ============================================
 * REACT QUERY: Autenticación - Mutations
 * ============================================
 *
 * Mutaciones de React Query para login, logout y gestión de sesión.
 * Invalida automáticamente las queries relacionadas.
 */

'use client'

import { createClient } from '@/lib/supabase/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
      // 1. Iniciar sesión con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo obtener el usuario')

      // 2. Obtener perfil del usuario
      const { data: perfilData, error: perfilError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (perfilError) throw perfilError

      return {
        session: authData.session,
        user: authData.user,
        perfil: perfilData,
      }
    },
    onSuccess: (data) => {
      // Invalidar todas las queries de autenticación
      queryClient.invalidateQueries({ queryKey: authKeys.all })

      // Establecer datos en cache inmediatamente
      queryClient.setQueryData(authKeys.session(), data.session)
      queryClient.setQueryData(authKeys.user(), data.user)
      queryClient.setQueryData(authKeys.perfil(data.user.id), data.perfil)

      console.log('✅ Login exitoso:', data.user.email)
    },
    onError: (error: Error) => {
      console.error('❌ Error en login:', error.message)
    },
  })
}

// ============================================
// MUTATION: Logout
// ============================================

/**
 * Mutación para cerrar sesión
 * Limpia todo el cache de autenticación
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      // Limpiar TODAS las queries de autenticación
      queryClient.removeQueries({ queryKey: authKeys.all })

      // Resetear cache completo (opcional, pero recomendado)
      queryClient.clear()

      console.log('✅ Logout exitoso')

      // Redirigir al login
      router.push('/login')
    },
    onError: (error: Error) => {
      console.error('❌ Error en logout:', error.message)
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
