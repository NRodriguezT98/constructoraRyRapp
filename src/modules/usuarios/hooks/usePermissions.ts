/**
 * ============================================
 * HOOK: usePermissions
 * ============================================
 *
 * Hook para verificar permisos del usuario actual.
 * Proporciona funciones y helpers para control de acceso.
 *
 * DISEÑO PARA MIGRACIÓN FUTURA:
 * - Actualmente usa permisos estáticos del código
 * - En el futuro, consultará tabla de permisos en DB
 * - La API del hook se mantiene igual (sin breaking changes)
 */

'use client'

import { useAuth } from '@/contexts/auth-context'
import { useMemo } from 'react'
import type { Accion, Modulo, Rol } from '../types'
import {
    DESCRIPCION_PERMISOS,
    obtenerModulosConAcceso,
    obtenerPermisos,
    PERMISOS_POR_ROL,
    tieneAlgunPermiso as verificarAlgunPermiso,
    tienePermiso as verificarPermiso,
    tieneTodosLosPermisos as verificarTodosPermisos,
} from '../types'

export function usePermissions() {
  const { perfil } = useAuth()
  const rol = perfil?.rol as Rol | undefined

  /**
   * Verifica si el usuario actual tiene un permiso específico
   */
  const puede = useMemo(() => {
    return (modulo: Modulo, accion: Accion): boolean => {
      if (!rol) return false
      return verificarPermiso(rol, modulo, accion)
    }
  }, [rol])

  /**
   * Verifica si el usuario tiene ALGUNO de los permisos
   */
  const puedeAlguno = useMemo(() => {
    return (modulo: Modulo, acciones: Accion[]): boolean => {
      if (!rol) return false
      return verificarAlgunPermiso(rol, modulo, acciones)
    }
  }, [rol])

  /**
   * Verifica si el usuario tiene TODOS los permisos
   */
  const puedeTodos = useMemo(() => {
    return (modulo: Modulo, acciones: Accion[]): boolean => {
      if (!rol) return false
      return verificarTodosPermisos(rol, modulo, acciones)
    }
  }, [rol])

  /**
   * Obtiene todos los permisos del usuario para un módulo
   */
  const permisosModulo = useMemo(() => {
    return (modulo: Modulo): Accion[] => {
      if (!rol) return []
      return obtenerPermisos(rol, modulo)
    }
  }, [rol])

  /**
   * Obtiene todos los módulos a los que el usuario tiene acceso
   */
  const modulosConAcceso = useMemo(() => {
    if (!rol) return []
    return obtenerModulosConAcceso(rol)
  }, [rol])

  /**
   * Verifica si el usuario es administrador
   */
  const esAdmin = useMemo(() => {
    return rol === 'Administrador'
  }, [rol])

  /**
   * Verifica si el usuario es gerente
   */
  const esGerente = useMemo(() => {
    return rol === 'Gerente'
  }, [rol])

  /**
   * Verifica si el usuario es vendedor
   */
  const esVendedor = useMemo(() => {
    return rol === 'Vendedor'
  }, [rol])

  /**
   * Obtiene la descripción de un permiso
   */
  const obtenerDescripcionPermiso = useMemo(() => {
    return (modulo: Modulo, accion: Accion): string => {
      return DESCRIPCION_PERMISOS[modulo]?.[accion] || 'Sin descripción'
    }
  }, [])

  /**
   * Obtiene todos los permisos disponibles del usuario
   * Útil para mostrar en UI de configuración
   */
  const todosLosPermisos = useMemo(() => {
    if (!rol) return []

    const permisos: { modulo: Modulo; accion: Accion; descripcion: string }[] = []

    Object.entries(PERMISOS_POR_ROL[rol]).forEach(([modulo, acciones]) => {
      acciones.forEach(accion => {
        permisos.push({
          modulo: modulo as Modulo,
          accion,
          descripcion: DESCRIPCION_PERMISOS[modulo as Modulo]?.[accion] || '',
        })
      })
    })

    return permisos
  }, [rol])

  return {
    // Verificación de permisos
    puede,
    puedeAlguno,
    puedeTodos,

    // Información de permisos
    permisosModulo,
    modulosConAcceso,
    todosLosPermisos,
    obtenerDescripcionPermiso,

    // Helpers de rol
    esAdmin,
    esGerente,
    esVendedor,
    rol,

    // Estado
    tieneRol: !!rol,
  }
}

/**
 * Hook simplificado para verificaciones rápidas de permisos
 *
 * @example
 * const { puede } = useCan()
 * if (puede('clientes', 'crear')) { ... }
 */
export function useCan() {
  const { puede, puedeAlguno, puedeTodos } = usePermissions()
  return { puede, puedeAlguno, puedeTodos }
}

/**
 * Hook para verificar si el usuario es admin
 *
 * @example
 * const isAdmin = useIsAdmin()
 * if (isAdmin) { ... }
 */
export function useIsAdmin(): boolean {
  const { esAdmin } = usePermissions()
  return esAdmin
}

/**
 * Hook para obtener el rol del usuario
 *
 * @example
 * const rol = useRole()
 */
export function useRole(): Rol | undefined {
  const { rol } = usePermissions()
  return rol
}
