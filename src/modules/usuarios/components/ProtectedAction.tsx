/**
 * ============================================
 * COMPONENTES: ProtectedAction
 * ============================================
 *
 * Componentes wrapper para condicionar renderizado basado en permisos.
 * Simplifican el uso del sistema de permisos en la UI.
 *
 * @version 2.0.0 - Migrado a React Query + Base de Datos
 *
 * @example
 * // Mostrar botón solo si puede crear
 * <CanCreate modulo="proyectos">
 *   <CreateButton />
 * </CanCreate>
 *
 * @example
 * // Mostrar acciones con fallback
 * <CanEdit modulo="clientes" fallback={<DisabledButton />}>
 *   <EditButton />
 * </CanEdit>
 */

'use client'

import type { ReactNode } from 'react'

import { usePermisosQuery } from '../hooks/usePermisosQuery'
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

  /** Contenido a mostrar si NO tiene permiso */
  fallback?: ReactNode
}

/**
 * Componente base para proteger acciones basadas en permisos
 *
 * ✨ NUEVO: Usa React Query + Base de Datos para permisos dinámicos
 */
export function ProtectedAction({
  modulo,
  accion,
  acciones,
  requireAll = false,
  children,
  fallback = null,
}: ProtectedActionProps) {
  const { puede, puedeAlguno, puedeTodos, isLoading } = usePermisosQuery()

  // Validación: no puede usar accion y acciones juntos
  if (accion && acciones) {
    console.error('ProtectedAction: No uses "accion" y "acciones" al mismo tiempo')
    return <>{fallback}</>
  }

  // Mientras carga, mostrar fallback
  if (isLoading) {
    return <>{fallback}</>
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
    return <>{fallback}</>
  }

  return tienePermiso ? <>{children}</> : <>{fallback}</>
}

/**
 * Componente simplificado para verificar permiso de CREAR
 */
interface SimpleActionProps {
  modulo: Modulo
  children: ReactNode
  fallback?: ReactNode
}

export function CanCreate({ modulo, children, fallback }: SimpleActionProps) {
  return (
    <ProtectedAction modulo={modulo} accion="crear" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente simplificado para verificar permiso de EDITAR
 */
export function CanEdit({ modulo, children, fallback }: SimpleActionProps) {
  return (
    <ProtectedAction modulo={modulo} accion="editar" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente simplificado para verificar permiso de ELIMINAR
 */
export function CanDelete({ modulo, children, fallback }: SimpleActionProps) {
  return (
    <ProtectedAction modulo={modulo} accion="eliminar" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente simplificado para verificar permiso de VER
 */
export function CanView({ modulo, children, fallback }: SimpleActionProps) {
  return (
    <ProtectedAction modulo={modulo} accion="ver" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente simplificado para verificar permiso de APROBAR
 */
export function CanApprove({ modulo, children, fallback }: SimpleActionProps) {
  return (
    <ProtectedAction modulo={modulo} accion="aprobar" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente simplificado para verificar permiso de RECHAZAR
 */
export function CanReject({ modulo, children, fallback }: SimpleActionProps) {
  return (
    <ProtectedAction modulo={modulo} accion="rechazar" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente simplificado para verificar permiso de EXPORTAR
 */
export function CanExport({ modulo, children, fallback }: SimpleActionProps) {
  return (
    <ProtectedAction modulo={modulo} accion="exportar" fallback={fallback}>
      {children}
    </ProtectedAction>
  )
}

/**
 * Componente para verificar si el usuario es Administrador
 */
interface AdminOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { esAdmin, isLoading } = usePermisosQuery()

  if (isLoading) return <>{fallback}</>

  return esAdmin ? <>{children}</> : <>{fallback}</>
}

/**
 * Componente para verificar si el usuario es Gerencia o superior
 */
export function ManagerOrAbove({ children, fallback = null }: AdminOnlyProps) {
  const { esAdmin, esGerente, isLoading } = usePermisosQuery()

  if (isLoading) return <>{fallback}</>

  return esAdmin || esGerente ? <>{children}</> : <>{fallback}</>
}
