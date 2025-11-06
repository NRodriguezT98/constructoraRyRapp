/**
 * ============================================
 * AUTH CONTEXT - Refactorizado con React Query
 * ============================================
 *
 * Context de autenticación que usa React Query internamente.
 * Mantiene la misma API para compatibilidad con código existente.
 *
 * BENEFICIOS:
 * - ✅ Cache automático de sesión y perfil
 * - ✅ Invalidación inteligente
 * - ✅ Sin problemas de closures
 * - ✅ Estados de carga precisos
 * - ✅ Refetch automático en background
 */

'use client'

import {
    useAuthPerfilQuery,
    useAuthSessionQuery,
    useAuthUserQuery,
    useLoginMutation,
    useLogoutMutation,
    type Perfil,
} from '@/hooks/auth'
import type { User } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  user: User | null
  perfil: Perfil | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Queries de React Query
  const { data: session, isLoading: sessionLoading } = useAuthSessionQuery()
  const { data: user, isLoading: userLoading } = useAuthUserQuery()
  const { data: perfil, isLoading: perfilLoading } = useAuthPerfilQuery(user?.id)

  // Mutaciones
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()

  // ============================================
  // SIGN IN - Wrapper para mantener API
  // ============================================

  const signIn = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }

  // ============================================
  // SIGN OUT - Wrapper para mantener API
  // ============================================

  const signOut = async () => {
    await logoutMutation.mutateAsync()
  }

  // ============================================
  // LOADING STATE
  // ============================================

  const loading = sessionLoading || userLoading || perfilLoading

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AuthContextType = {
    user: user ?? null,
    perfil: perfil ?? null,
    loading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

// Re-export Perfil type para compatibilidad
export type { Perfil }
