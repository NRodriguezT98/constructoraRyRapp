'use client'

import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

export interface Perfil {
  id: string
  nombres: string
  apellidos: string
  email: string
  rol: 'Administrador' | 'Gerente' | 'Vendedor'
  estado: 'Activo' | 'Inactivo'
  debe_cambiar_password: boolean
  ultimo_acceso: string | null
  fecha_creacion: string
  fecha_actualizacion: string
}

interface AuthContextType {
  user: User | null
  perfil: Perfil | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          const { data: perfilData } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (perfilData) {
            setPerfil(perfilData as Perfil)
          }
        }
      } catch (error) {
        console.error('[AUTH] Error:', error)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          const { data: perfilData } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (perfilData) {
            setPerfil(perfilData as Perfil)
          }
        } else {
          setUser(null)
          setPerfil(null)
        }
      }
    )
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    if (data.user) {
      setUser(data.user)
      const { data: perfilData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (perfilData) {
        setPerfil(perfilData as Perfil)
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPerfil(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
