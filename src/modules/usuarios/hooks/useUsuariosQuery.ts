/**
 * ============================================
 * HOOK: useUsuariosQuery (React Query)
 * ============================================
 *
 * Migración de useUsuarios a React Query.
 * Gestiona usuarios con cache automático y mutations.
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { usuariosService } from '../services/usuarios.service'
import type {
    ActualizarUsuarioData,
    CrearUsuarioData,
    EstadoUsuario,
    FiltrosUsuarios,
    Rol
} from '../types'

/**
 * Query: Obtener todos los usuarios con filtros
 */
export function useUsuariosQuery(filtros?: FiltrosUsuarios) {
  return useQuery({
    queryKey: ['usuarios', filtros],
    queryFn: () => usuariosService.obtenerUsuarios(filtros),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Query: Obtener estadísticas de usuarios
 */
export function useEstadisticasUsuariosQuery() {
  return useQuery({
    queryKey: ['usuarios', 'estadisticas'],
    queryFn: () => usuariosService.obtenerEstadisticas(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Query: Obtener usuario por ID
 */
export function useUsuarioQuery(id: string | null) {
  return useQuery({
    queryKey: ['usuarios', id],
    queryFn: () => {
      if (!id) throw new Error('ID no proporcionado')
      return usuariosService.obtenerUsuarioPorId(id)
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Mutation: Crear nuevo usuario
 */
export function useCrearUsuarioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: CrearUsuarioData) => usuariosService.crearUsuario(datos),

    onSuccess: () => {
      // Invalidar queries de usuarios y estadísticas
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })

      console.log('✅ [MUTATION] Usuario creado, cache invalidado')
    },

    onError: error => {
      console.error('❌ [MUTATION] Error creando usuario:', error)
    },
  })
}

/**
 * Mutation: Actualizar usuario existente
 */
export function useActualizarUsuarioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: ActualizarUsuarioData }) =>
      usuariosService.actualizarUsuario(id, datos),

    onSuccess: (_, variables) => {
      // Invalidar queries de usuarios y el usuario específico
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['usuarios', variables.id] })

      console.log('✅ [MUTATION] Usuario actualizado, cache invalidado')
    },

    onError: error => {
      console.error('❌ [MUTATION] Error actualizando usuario:', error)
    },
  })
}

/**
 * Mutation: Cambiar rol de usuario
 */
export function useCambiarRolMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, nuevoRol }: { id: string; nuevoRol: Rol }) =>
      usuariosService.cambiarRol(id, nuevoRol),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['usuarios', variables.id] })

      console.log('✅ [MUTATION] Rol actualizado, cache invalidado')
    },

    onError: error => {
      console.error('❌ [MUTATION] Error cambiando rol:', error)
    },
  })
}

/**
 * Mutation: Cambiar estado de usuario
 */
export function useCambiarEstadoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, nuevoEstado }: { id: string; nuevoEstado: EstadoUsuario }) =>
      usuariosService.cambiarEstado(id, nuevoEstado),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['usuarios', variables.id] })

      console.log('✅ [MUTATION] Estado actualizado, cache invalidado')
    },

    onError: error => {
      console.error('❌ [MUTATION] Error cambiando estado:', error)
    },
  })
}

/**
 * Mutation: Resetear intentos fallidos
 */
export function useResetearIntentosMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usuariosService.resetearIntentosFallidos(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['usuarios', id] })

      console.log('✅ [MUTATION] Intentos reseteados, cache invalidado')
    },

    onError: error => {
      console.error('❌ [MUTATION] Error reseteando intentos:', error)
    },
  })
}

/**
 * Mutation: Eliminar usuario (soft delete)
 */
export function useEliminarUsuarioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usuariosService.eliminarUsuario(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })

      console.log('✅ [MUTATION] Usuario eliminado, cache invalidado')
    },

    onError: error => {
      console.error('❌ [MUTATION] Error eliminando usuario:', error)
    },
  })
}

/**
 * Hook combinado que devuelve queries y mutations
 * Interfaz compatible con useUsuarios antiguo
 */
export function useUsuariosConMutations(filtros?: FiltrosUsuarios) {
  const { data: usuarios = [], isLoading: cargando, error } = useUsuariosQuery(filtros)
  const { data: estadisticas } = useEstadisticasUsuariosQuery()

  const crearUsuarioMutation = useCrearUsuarioMutation()
  const actualizarUsuarioMutation = useActualizarUsuarioMutation()
  const cambiarRolMutation = useCambiarRolMutation()
  const cambiarEstadoMutation = useCambiarEstadoMutation()
  const resetearIntentosMutation = useResetearIntentosMutation()
  const eliminarUsuarioMutation = useEliminarUsuarioMutation()

  const queryClient = useQueryClient()

  return {
    // Estado
    usuarios,
    estadisticas: estadisticas || null,
    cargando,
    error: error ? (error as Error).message : null,

    // Operaciones CRUD (con mutations)
    crearUsuario: async (datos: CrearUsuarioData) => {
      const result = await crearUsuarioMutation.mutateAsync(datos)
      return result
    },

    actualizarUsuario: async (id: string, datos: ActualizarUsuarioData) => {
      await actualizarUsuarioMutation.mutateAsync({ id, datos })
    },

    cambiarRol: async (id: string, nuevoRol: Rol) => {
      await cambiarRolMutation.mutateAsync({ id, nuevoRol })
    },

    cambiarEstado: async (id: string, nuevoEstado: EstadoUsuario) => {
      await cambiarEstadoMutation.mutateAsync({ id, nuevoEstado })
    },

    resetearIntentos: async (id: string) => {
      await resetearIntentosMutation.mutateAsync(id)
    },

    eliminarUsuario: async (id: string) => {
      await eliminarUsuarioMutation.mutateAsync(id)
    },

    // Utilidades
    refrescar: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  }
}
