/**
 * ============================================
 * COMPONENTE: ProtectedAction
 * ============================================
 *
 * Renderiza children solo si el usuario tiene los permisos necesarios.
 * Permite condicionar UI sin lógica de permisos en cada componente.
 *
 * @example
 * // Mostrar botón solo si puede crear clientes
 * <ProtectedAction modulo="clientes" accion="crear">
 *   <Button>Crear Cliente</Button>
 * </ProtectedAction>
 *
 * @example
 * // Mostrar solo si puede editar O eliminar
 * <ProtectedAction modulo="proyectos" acciones={['editar', 'eliminar']}>
 *   <MenuActions />
 * </ProtectedAction>
 *
 * @example
 * // Mostrar solo si puede editar Y eliminar
 * <ProtectedAction modulo="usuarios" acciones={['editar', 'eliminar']} requireAll>
 *   <AdminPanel />
 * </ProtectedAction>
 *
 * @example
 * // Mostrar fallback si no tiene permiso
 * <ProtectedAction
 *   modulo="reportes"
 *   accion="exportar"
 *   fallback={<Text>No tienes permiso para exportar</Text>}
 * >
 *   <ExportButton />
 * </ProtectedAction>
 */

'use client'

import { type ReactNode } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import type { Accion, Modulo } from '../types'

interface ProtectedActionProps {
  /** Módulo al que pertenece el permiso */
  modulo: Modulo

  /** Acción específica (modo exclusivo con acciones[]) */
  accion?: Accion

  /** Múltiples acciones (modo exclusivo con accion) */
  acciones?: Accion[]

  /** Si true, requiere TODAS las acciones. Si false, requiere AL MENOS UNA */
  requireAll?: boolean

  /** Contenido a renderizar si tiene permiso */
  children: ReactNode

  /** Contenido alternativo si NO tiene permiso */
  fallback?: ReactNode

  /** Si true, renderiza children siempre pero con opacity reducida cuando no tiene permiso */
  showDisabled?: boolean
}

export function ProtectedAction({
  modulo,
  accion,
  acciones,
  requireAll = false,
  children,
  fallback = null,
  showDisabled = false,
}: ProtectedActionProps) {
  const { puede, puedeAlguno, puedeTodos } = usePermissions()

  // Validación: no puede usar accion y acciones juntos
  if (accion && acciones) {
    console.error('ProtectedAction: No uses "accion" y "acciones" al mismo tiempo')
    return null
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
    console.error('ProtectedAction: Debes proporcionar "accion" o "acciones"')
    return null
  }

  // Modo disabled: mostrar siempre pero opaco
  if (showDisabled && !tienePermiso) {
    return (
      <div className="opacity-40 pointer-events-none" aria-disabled="true">
        {children}
      </div>
    )
  }

  // Renderizar según permiso
  if (tienePermiso) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * Componente simplificado para solo verificar SI puede ver/acceder
 *
 * @example
 * <CanView modulo="clientes">
 *   <ClientesPage />
 * </CanView>
 */
interface CanViewProps {
  modulo: Modulo
  children: ReactNode
  fallback?: ReactNode
}

export function CanView({ modulo, children, fallback = null }: CanViewProps) {
  return (
    <ProtectedAction modulo={modulo} accion="ver" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente simplificado para verificar SI puede crear
 *
 * @example
 * <CanCreate modulo="proyectos">
 *   <CreateButton />
 * </CanCreate>
 */
interface CanCreateProps {
  modulo: Modulo
  children: ReactNode
  fallback?: ReactNode
}

export function CanCreate({ modulo, children, fallback = null }: CanCreateProps) {
  return (
    <ProtectedAction modulo={modulo} accion="crear" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente simplificado para verificar SI puede editar
 *
 * @example
 * <CanEdit modulo="viviendas">
 *   <EditButton />
 * </CanEdit>
 */
interface CanEditProps {
  modulo: Modulo
  children: ReactNode
  fallback?: ReactNode
}

export function CanEdit({ modulo, children, fallback = null }: CanEditProps) {
  return (
    <ProtectedAction modulo={modulo} accion="editar" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente simplificado para verificar SI puede eliminar
 *
 * @example
 * <CanDelete modulo="abonos">
 *   <DeleteButton />
 * </CanDelete>
 */
interface CanDeleteProps {
  modulo: Modulo
  children: ReactNode
  fallback?: ReactNode
}

export function CanDelete({ modulo, children, fallback = null }: CanDeleteProps) {
  return (
    <ProtectedAction modulo={modulo} accion="eliminar" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente para solo administradores
 *
 * @example
 * <AdminOnly fallback={<Text>Solo administradores</Text>}>
 *   <DangerZone />
 * </AdminOnly>
 */
interface AdminOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { esAdmin } = usePermissions()
  return esAdmin ? <>{children}</> : <>{fallback}</>
}
