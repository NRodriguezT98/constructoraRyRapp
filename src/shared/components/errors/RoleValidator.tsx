/**
 * ============================================
 * COMPONENTE: RoleValidator
 * ============================================
 *
 * Wrapper que valida el rol del usuario antes de renderizar children.
 * Muestra error si el rol no es válido.
 */

'use client'

import { useAuth } from '@/contexts/auth-context'
import { InvalidRoleError } from './InvalidRoleError'

const ROLES_VALIDOS = ['Administrador', 'Contador', 'Supervisor', 'Gerente'] as const

interface RoleValidatorProps {
  children: React.ReactNode
  /**
   * Si true, solo valida si hay sesión activa.
   * Si false, no valida en páginas públicas.
   */
  requireAuth?: boolean
}

export function RoleValidator({ children, requireAuth = true }: RoleValidatorProps) {
  const { user, perfil, loading } = useAuth()

  // Mientras carga, no mostrar nada (evitar flicker)
  if (loading) {
    return null
  }

  // Si no requiere auth y no hay sesión, renderizar children (página pública)
  if (!requireAuth && !perfil) {
    return <>{children}</>
  }

  // Si requiere auth pero no hay sesión, dejar que AuthContext redirija
  if (requireAuth && !perfil) {
    return null
  }

  // Validar rol si hay perfil
  if (perfil) {
    const rolActual = perfil.rol
    const esRolInvalido = !ROLES_VALIDOS.includes(rolActual as any)

    if (esRolInvalido) {
      console.error(`❌ [ROLE VALIDATOR] Rol inválido: "${rolActual}"`)
      // ⚠️ NO pasamos información sensible del sistema
      return (
        <InvalidRoleError
          detectedRole={rolActual}
          userEmail={user?.email}
        />
      )
    }
  }

  // Rol válido o sin sesión (dependiendo de requireAuth)
  return <>{children}</>
}
