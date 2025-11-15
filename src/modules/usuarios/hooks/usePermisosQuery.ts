/**
 * ============================================
 * HOOK: usePermisosQuery
 * ============================================
 *
 * Hook con React Query para gestionar permisos desde BD.
 * Reemplaza el sistema hardcodeado de usePermissions.
 *
 * CARACTERÍSTICAS:
 * - Consulta permisos desde tabla permisos_rol
 * - Cache automático con React Query
 * - Bypass automático para Administrador
 * - Invalidación de cache al actualizar
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { useAuth } from '@/contexts/auth-context'

import {
    actualizarPermiso,
    actualizarPermisosEnLote,
    obtenerPermisosPorRol,
    obtenerTodosLosPermisos
} from '../services/permisos.service'
import type { Accion, Modulo, Rol } from '../types'

/**
 * Hook principal para gestión de permisos con React Query
 */
export function usePermisosQuery() {
  const { perfil, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const rol = perfil?.rol as Rol | undefined

  /**
   * Query: Obtener permisos del rol actual
   */
  const {
    data: permisos = [],
    isLoading: permisosLoading,
    error: permisosError,
  } = useQuery({
    queryKey: ['permisos', rol],
    queryFn: () => {
      if (!rol) {
        throw new Error('No hay rol definido')
      }
      return obtenerPermisosPorRol(rol)
    },
    enabled: !!rol, // Solo ejecutar si hay rol
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
  })

  /**
   * Estado combinado de carga
   */
  const isLoading = useMemo(() => {
    return authLoading || (!!rol && permisosLoading)
  }, [authLoading, rol, permisosLoading])

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const puede = useCallback(
    (modulo: Modulo, accion: Accion): boolean => {
      if (!rol) return false

      // Bypass para Administrador
      if (rol === 'Administrador') {
        return true
      }

      // Verificar en permisos obtenidos de BD
      return permisos.some(
        p => p.modulo === modulo && p.accion === accion && p.permitido
      )
    },
    [rol, permisos]
  )

  /**
   * Verifica si el usuario tiene ALGUNO de los permisos
   */
  const puedeAlguno = useCallback(
    (modulo: Modulo, acciones: Accion[]): boolean => {
      if (!rol) return false
      return acciones.some(accion => puede(modulo, accion))
    },
    [rol, puede]
  )

  /**
   * Verifica si el usuario tiene TODOS los permisos
   */
  const puedeTodos = useCallback(
    (modulo: Modulo, acciones: Accion[]): boolean => {
      if (!rol) return false
      return acciones.every(accion => puede(modulo, accion))
    },
    [rol, puede]
  )

  /**
   * Obtiene todos los permisos del usuario para un módulo
   */
  const permisosModulo = useCallback(
    (modulo: Modulo): Accion[] => {
      if (!rol) return []

      return permisos
        .filter(p => p.modulo === modulo && p.permitido)
        .map(p => p.accion as Accion)
    },
    [rol, permisos]
  )

  /**
   * Obtiene todos los módulos a los que el usuario tiene acceso
   */
  const modulosConAcceso = useMemo(() => {
    if (!rol) return []

    const modulos = new Set(permisos.filter(p => p.permitido).map(p => p.modulo))
    return Array.from(modulos) as Modulo[]
  }, [rol, permisos])

  /**
   * Helpers de rol
   */
  const esAdmin = useMemo(() => rol === 'Administrador', [rol])
  const esContador = useMemo(() => rol === 'Contador', [rol])
  const esSupervisor = useMemo(() => rol === 'Supervisor', [rol])
  const esGerente = useMemo(() => rol === 'Gerente', [rol])

  /**
   * Obtiene todos los permisos disponibles del usuario
   */
  const todosLosPermisos = useMemo(() => {
    if (!rol) return []

    return permisos
      .filter(p => p.permitido)
      .map(p => ({
        modulo: p.modulo as Modulo,
        accion: p.accion as Accion,
        descripcion: p.descripcion || '',
      }))
  }, [rol, permisos])

  return {
    // Verificación de permisos
    puede,
    puedeAlguno,
    puedeTodos,

    // Información de permisos
    permisosModulo,
    modulosConAcceso,
    todosLosPermisos,
    permisosRaw: permisos, // Permisos sin procesar

    // Helpers de rol
    esAdmin,
    esContador,
    esSupervisor,
    esGerente,
    rol,
    tieneRol: !!rol,

    // Estado
    isLoading,
    error: permisosError,
  }
}

/**
 * Hook para obtener TODOS los permisos del sistema (Admin only)
 * Útil para matriz de configuración de permisos
 */
export function useTodosLosPermisosQuery() {
  const { perfil } = useAuth()
  const esAdmin = perfil?.rol === 'Administrador'

  return useQuery({
    queryKey: ['permisos', 'todos'],
    queryFn: obtenerTodosLosPermisos,
    enabled: esAdmin, // Solo ejecutar si es admin
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Mutation: Actualizar un permiso específico
 * ✅ Invalida sesiones de usuarios afectados
 */
export function useActualizarPermisoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, permitido, rol }: { id: string; permitido: boolean; rol?: string }) => {
      const resultado = await actualizarPermiso(id, permitido)

      // ✅ Invalidar sesiones si se proporcionó el rol
      if (rol) {
        try {
          await fetch('/api/auth/invalidar-sesiones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol }),
          })
          console.log(`✅ [MUTATION] Sesiones invalidadas para rol: ${rol}`)
        } catch (error) {
          console.warn('⚠️ [MUTATION] Error invalidando sesiones (no crítico):', error)
        }
      }

      return resultado
    },

    onSuccess: () => {
      // Invalidar TODOS los queries de permisos
      queryClient.invalidateQueries({ queryKey: ['permisos'] })

      console.log('✅ [MUTATION] Permiso actualizado y cache invalidado')
    },

    onError: error => {
      console.error('❌ [MUTATION] Error actualizando permiso:', error)
    },
  })
}

/**
 * Mutation: Actualizar múltiples permisos en lote
 * ✅ Invalida sesiones de usuarios afectados
 */
export function useActualizarPermisosEnLoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      actualizaciones,
      rol,
    }: {
      actualizaciones: Array<{ id: string; permitido: boolean }>
      rol?: string
    }) => {
      const resultado = await actualizarPermisosEnLote(actualizaciones)

      // ✅ Invalidar sesiones si se proporcionó el rol
      if (rol) {
        try {
          await fetch('/api/auth/invalidar-sesiones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol }),
          })
          console.log(`✅ [MUTATION] Sesiones invalidadas para rol: ${rol}`)
        } catch (error) {
          console.warn('⚠️ [MUTATION] Error invalidando sesiones (no crítico):', error)
        }
      }

      return resultado
    },

    onSuccess: () => {
      // Invalidar TODOS los queries de permisos
      queryClient.invalidateQueries({ queryKey: ['permisos'] })

      console.log('✅ [MUTATION] Permisos en lote actualizados y cache invalidado')
    },

    onError: error => {
      console.error('❌ [MUTATION] Error actualizando permisos en lote:', error)
    },
  })
}

/**
 * Hook simplificado para verificaciones rápidas de permisos
 */
export function useCan() {
  const { puede, puedeAlguno, puedeTodos } = usePermisosQuery()
  return { puede, puedeAlguno, puedeTodos }
}

/**
 * Hook para verificar si el usuario es admin
 */
export function useIsAdmin(): boolean {
  const { esAdmin } = usePermisosQuery()
  return esAdmin
}

/**
 * Hook para obtener el rol del usuario
 */
export function useRole(): Rol | undefined {
  const { rol } = usePermisosQuery()
  return rol
}
