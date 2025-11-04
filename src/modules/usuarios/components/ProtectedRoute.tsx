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
  console.warn('⚠️ [SISTEMA ANTIGUO] ProtectedRoute ejecutado - ESTO NO DEBERÍA PASAR CON MIDDLEWARE')
  console.warn('  Módulo:', modulo, '| Acción:', accion || acciones)

  const router = useRouter()
  const { perfil, loading: authLoading } = useAuth()
  const { puede, puedeAlguno, puedeTodos, permisosLoading } = usePermissions()

  useEffect(() => {
    // Esperar a que cargue autenticación Y permisos
    if (authLoading || permisosLoading) {
      return
    }

    // Si no está autenticado, redirigir al login
    if (!perfil) {
      router.push('/login')
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
      router.push(redirectTo)
    }
  }, [
    authLoading,
    permisosLoading,
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

  // Mostrar loading mientras valida autenticación O permisos
  if (authLoading || permisosLoading) {
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
 * Componente de loading moderno
 * Diseño minimalista sin mencionar detalles técnicos
 */
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="text-center">
        {/* Spinner moderno con efecto de pulso */}
        <div className="relative inline-flex items-center justify-center">
          {/* Círculo exterior con pulso */}
          <div className="absolute h-20 w-20 rounded-full bg-violet-500/20 dark:bg-violet-400/20 animate-ping"></div>

          {/* Círculo medio giratorio */}
          <div className="absolute h-16 w-16 rounded-full border-4 border-violet-200 dark:border-violet-900"></div>

          {/* Spinner principal */}
          <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-violet-600 dark:border-t-violet-400 border-r-violet-500 dark:border-r-violet-500"></div>

          {/* Punto central con pulso */}
          <div className="absolute h-3 w-3 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse"></div>
        </div>

        {/* Texto genérico y amigable */}
        <div className="mt-8 space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-pulse">
            Cargando...
          </p>
          <div className="flex items-center justify-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
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
  console.warn('⚠️ [SISTEMA ANTIGUO] RequireView ejecutado - ESTO NO DEBERÍA PASAR CON MIDDLEWARE')
  console.warn('  Módulo:', modulo)

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
  const { esAdmin, permisosLoading } = usePermissions()

  useEffect(() => {
    // ⭐ SOLUCIÓN IDEAL: Esperar a que cargue autenticación Y permisos
    if (authLoading || permisosLoading) return

    if (!perfil || !esAdmin) {
      router.push(redirectTo)
    }
  }, [authLoading, permisosLoading, perfil, esAdmin, router, redirectTo])

  // ⭐ MEJORADO: Mostrar loading mientras valida autenticación O permisos
  if (authLoading || permisosLoading) {
    return <LoadingPage />
  }

  if (!esAdmin) {
    return null
  }

  return <>{children}</>
}
