/**
 * ============================================
 * COMPONENTE: ProtectedApp
 * ============================================
 *
 * Wrapper de seguridad que valida el rol del usuario ANTES de renderizar la aplicación.
 * Si el rol es inválido, muestra pantalla de error y bloquea TODO acceso.
 */

'use client'

import { Building2 } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'
import { InvalidRoleError } from '@/shared/components/errors'
import { ModuleLoadingScreen } from '@/shared/components/ui/ModuleLoadingScreen'

const ROLES_VALIDOS = [
  'Administrador',
  'Contabilidad',
  'Administrador de Obra',
  'Gerencia',
] as const
type RolValido = (typeof ROLES_VALIDOS)[number]

function esRolValido(rol: string | null | undefined): rol is RolValido {
  return typeof rol === 'string' && ROLES_VALIDOS.includes(rol as RolValido)
}

interface ProtectedAppProps {
  children: React.ReactNode
}

export function ProtectedApp({ children }: ProtectedAppProps) {
  const { user, perfil, loading } = useAuth()

  // Mientras carga auth, mostrar pantalla de carga consistente
  if (loading) {
    return (
      <ModuleLoadingScreen
        Icon={Building2}
        label='Cargando...'
        ringColors='border-t-indigo-500 border-r-violet-500'
        ringBg='from-indigo-500/20 to-violet-500/20'
        iconGradient='from-indigo-600 via-violet-600 to-purple-600'
        iconShadow='shadow-indigo-500/50'
        pageBg='via-indigo-50/30 to-violet-50/30'
        pageBgDark='dark:via-indigo-950/20 dark:to-violet-950/20'
        labelColor='text-indigo-600 dark:text-indigo-400'
        sparkleColor='text-indigo-500'
      />
    )
  }

  // Si hay perfil, validar el rol
  if (perfil) {
    const rolActual = perfil.rol
    const esRolInvalido = !esRolValido(rolActual)

    if (esRolInvalido) {
      // 🚨 SEGURIDAD: Registrar intento de acceso con rol inválido
      const errorLog = {
        timestamp: new Date().toISOString(),
        email: user?.email,
        rolInvalido: rolActual,
        userAgent:
          typeof window !== 'undefined'
            ? window.navigator.userAgent
            : 'unknown',
      }

      logger.error(
        `❌ [PROTECTED APP] ACCESO BLOQUEADO - Rol inválido`,
        errorLog
      )

      // TODO: Enviar a servicio de logging/alertas (Sentry, LogRocket, etc.)
      // await fetch('/api/security/invalid-role', { method: 'POST', body: JSON.stringify(errorLog) })

      // 🚨 BLOQUEO TOTAL: Mostrar solo pantalla de error (sin información sensible del sistema)
      return (
        <InvalidRoleError detectedRole={rolActual} userEmail={user?.email} />
      )
    }
  }

  // Rol válido o sin sesión: renderizar aplicación normal
  return <>{children}</>
}
