/**
 * ============================================
 * COMPONENTE: ProtectedApp
 * ============================================
 *
 * Wrapper de seguridad que valida el rol del usuario ANTES de renderizar la aplicación.
 * Si el rol es inválido, muestra pantalla de error y bloquea TODO acceso.
 */

'use client'

import { useAuth } from '@/contexts/auth-context'
import { InvalidRoleError } from '@/shared/components/errors'

const ROLES_VALIDOS = ['Administrador', 'Contador', 'Supervisor', 'Gerente'] as const

interface ProtectedAppProps {
  children: React.ReactNode
}

export function ProtectedApp({ children }: ProtectedAppProps) {
  const { user, perfil, loading } = useAuth()

  // Mientras carga auth, mostrar nada (evitar flicker)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Si hay perfil, validar el rol
  if (perfil) {
    const rolActual = perfil.rol
    const esRolInvalido = !ROLES_VALIDOS.includes(rolActual as any)

    if (esRolInvalido) {
      // 🚨 SEGURIDAD: Registrar intento de acceso con rol inválido
      const errorLog = {
        timestamp: new Date().toISOString(),
        email: user?.email,
        rolInvalido: rolActual,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      }

      console.error(`❌ [PROTECTED APP] ACCESO BLOQUEADO - Rol inválido`, errorLog)

      // TODO: Enviar a servicio de logging/alertas (Sentry, LogRocket, etc.)
      // await fetch('/api/security/invalid-role', { method: 'POST', body: JSON.stringify(errorLog) })

      // 🚨 BLOQUEO TOTAL: Mostrar solo pantalla de error (sin información sensible del sistema)
      return (
        <InvalidRoleError
          detectedRole={rolActual}
          userEmail={user?.email}
        />
      )
    }
  }

  // Rol válido o sin sesión: renderizar aplicación normal
  return <>{children}</>
}
