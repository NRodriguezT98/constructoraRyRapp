'use client'

import { supabase } from '@/lib/supabase/client-browser'
import { auditLogService } from '@/services/audit-log.service'
import { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

// Configuración de timeout de sesión: 8 horas
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000
const CHECK_INTERVAL = 5 * 60 * 1000 // Verificar cada 5 minutos

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios en autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Verificar timeout de sesión periódicamente
    const checkSessionTimeout = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Calcular tiempo restante de la sesión usando expires_at
        // expires_at está en segundos Unix timestamp
        const ahora = Math.floor(Date.now() / 1000)
        const expiresAt = session.expires_at || 0
        const tiempoRestante = expiresAt - ahora

        console.log(`⏰ Tiempo restante de sesión: ${Math.floor(tiempoRestante / 60)} minutos`)

        // Si la sesión YA expiró (tiempo negativo o 0)
        if (tiempoRestante <= 0) {
          console.warn('🕐 Sesión expirada')

          // 📝 Registrar evento de auditoría
          if (session.user?.email) {
            auditLogService.logSessionExpirada(session.user.email, SESSION_TIMEOUT / 60000)
          }

          await supabase.auth.signOut()

          // Mostrar mensaje al usuario
          if (typeof window !== 'undefined') {
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
            window.location.href = '/login'
          }
        }
        // Advertencia si queda menos de 5 minutos (opcional)
        else if (tiempoRestante < 300) {
          console.warn(`⚠️ Tu sesión expirará en ${Math.floor(tiempoRestante / 60)} minutos`)
        }
      }
    }

    // Ejecutar verificación cada 5 minutos
    const interval = setInterval(checkSessionTimeout, CHECK_INTERVAL)

    // NO verificar inmediatamente - dar tiempo al login de completarse
    // La primera verificación será después de 5 minutos

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    // Obtener email antes de cerrar sesión
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email

    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // 📝 Registrar evento de auditoría
    if (email) {
      auditLogService.logLogout(email)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
