/**
 * ============================================
 * COMPONENTE: ProtectedRoute
 * ============================================
 *
 * Protege rutas completas verificando permisos del usuario.
 * Redirige automáticamente si no tiene acceso.
 *
 * @example
 * // En página de proyectos
 * export default function ProyectosPage() {
 *   return (
 *     <ProtectedRoute modulo="proyectos" accion="ver">
 *       <ProyectosContent />
 *     </ProtectedRoute>
 *   )
 * }
 *
 * @example
 * // Requiere crear Y editar
 * export default function GestionPage() {
 *   return (
 *     <ProtectedRoute
 *       modulo="usuarios"
 *       acciones={['crear', 'editar']}
 *       requireAll
 *     >
 *       <GestionContent />
 *     </ProtectedRoute>
 *   )
 * }
 */

'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import type { Accion, Modulo } from '../types'

interface ProtectedRouteProps {
  /** Módulo al que pertenece el permiso */
  modulo: Modulo

  /** Acción específica (modo exclusivo con acciones[]) */
  accion?: Accion

  /** Múltiples acciones (modo exclusivo con accion) */
  acciones?: Accion[]

  /** Si true, requiere TODAS las acciones. Si false, requiere AL MENOS UNA */
  requireAll?: boolean

  /** Ruta a la que redirigir si no tiene permiso */
  redirectTo?: string

  /** Contenido a renderizar si tiene permiso */
  children: ReactNode

  /** Contenido a mostrar mientras valida permisos */
  loading?: ReactNode
}

export function ProtectedRoute({
  modulo,
  accion,
  acciones,
  requireAll = false,
  redirectTo = '/dashboard',
  children,
  loading = <LoadingPage />,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { perfil, loading: authLoading } = useAuth()
  const { puede, puedeAlguno, puedeTodos } = usePermissions()

  useEffect(() => {
    // Esperar a que cargue la autenticación
    if (authLoading) return

    // Si no está autenticado, redirigir al login
    if (!perfil) {
      router.push('/auth/login')
      return
    }

    // Validación: no puede usar accion y acciones juntos
    if (accion && acciones) {
      console.error('ProtectedRoute: No uses "accion" y "acciones" al mismo tiempo')
      router.push(redirectTo)
      return
    }

    // Determinar si tiene permiso
    let tienePermiso = false

    if (accion) {
      // Modo: acción única
      tienePermiso = puede(modulo, accion)
    } else if (acciones && acciones.length > 0) {
      // Modo: múltiples acciones
      if (requireAll) {
        tienePermiso = puedeTodos(modulo, acciones)
      } else {
        tienePermiso = puedeAlguno(modulo, acciones)
      }
    } else {
      console.error('ProtectedRoute: Debes proporcionar "accion" o "acciones"')
      router.push(redirectTo)
      return
    }

    // Redirigir si no tiene permiso
    if (!tienePermiso) {
      console.warn(`ProtectedRoute: Sin permiso para ${modulo} - ${accion || acciones?.join(', ')}`)
      router.push(redirectTo)
    }
  }, [
    authLoading,
    perfil,
    modulo,
    accion,
    acciones,
    requireAll,
    puede,
    puedeAlguno,
    puedeTodos,
    router,
    redirectTo,
  ])

  // Mostrar loading mientras valida
  if (authLoading) {
    return <>{loading}</>
  }

  // Si no está autenticado, no renderizar nada (ya redirigió)
  if (!perfil) {
    return null
  }

  // Verificar permiso para renderizar
  let tienePermiso = false

  if (accion) {
    tienePermiso = puede(modulo, accion)
  } else if (acciones && acciones.length > 0) {
    tienePermiso = requireAll
      ? puedeTodos(modulo, acciones)
      : puedeAlguno(modulo, acciones)
  }

  // Solo renderizar si tiene permiso
  if (!tienePermiso) {
    return null
  }

  return <>{children}</>
}

/**
 * Componente de loading por defecto
 */
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Verificando permisos...
        </p>
      </div>
    </div>
  )
}

/**
 * Componente simplificado para proteger rutas que solo requieren "ver"
 *
 * @example
 * export default function ClientesPage() {
 *   return (
 *     <RequireView modulo="clientes">
 *       <ClientesContent />
 *     </RequireView>
 *   )
 * }
 */
interface RequireViewProps {
  modulo: Modulo
  redirectTo?: string
  children: ReactNode
}

export function RequireView({ modulo, redirectTo, children }: RequireViewProps) {
  return (
    <ProtectedRoute modulo={modulo} accion="ver" redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  )
}

/**
 * Componente simplificado para proteger rutas de administrador
 *
 * @example
 * export default function ConfigPage() {
 *   return (
 *     <RequireAdmin>
 *       <ConfigContent />
 *     </RequireAdmin>
 *   )
 * }
 */
interface RequireAdminProps {
  redirectTo?: string
  children: ReactNode
}

export function RequireAdmin({ redirectTo = '/dashboard', children }: RequireAdminProps) {
  const router = useRouter()
  const { perfil, loading: authLoading } = useAuth()
  const { esAdmin } = usePermissions()

  useEffect(() => {
    if (authLoading) return

    if (!perfil || !esAdmin) {
      router.push(redirectTo)
    }
  }, [authLoading, perfil, esAdmin, router, redirectTo])

  if (authLoading) {
    return <LoadingPage />
  }

  if (!esAdmin) {
    return null
  }

  return <>{children}</>
}
