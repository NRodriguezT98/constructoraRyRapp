/**
 * Hook personalizado para gestionar acciones CRUD de proyectos
 * Centraliza la lógica de crear, actualizar, eliminar, archivar y restaurar
 */

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { toast } from 'sonner'

import { construirURLProyecto } from '@/lib/utils/slug.utils'
import type { ProyectoFormData } from '../types'
import { proyectosKeys, useProyectosQuery } from './useProyectosQuery'

interface UseProyectosActionsReturn {
  crearProyecto: (data: ProyectoFormData) => Promise<void>
  actualizarProyecto: (proyectoId: string, data: ProyectoFormData) => Promise<void>
  eliminarProyecto: (proyectoId: string) => Promise<void>
  archivarProyecto: (proyectoId: string, motivo?: string) => Promise<void>
  restaurarProyecto: (proyectoId: string) => Promise<void>
}

/**
 * Hook para gestionar acciones CRUD de proyectos
 * @returns Funciones para crear, actualizar, eliminar, archivar y restaurar proyectos
 * @example
 * ```tsx
 * const actions = useProyectosActions()
 *
 * // Crear proyecto
 * await actions.crearProyecto(formData)
 *
 * // Actualizar proyecto
 * await actions.actualizarProyecto('uuid-123', formData)
 * ```
 */
export function useProyectosActions(): UseProyectosActionsReturn {
  const queryClient = useQueryClient()
  const router = useRouter()
  const {
    crearProyecto: mutateCrear,
    actualizarProyecto: mutateActualizar,
    eliminarProyecto: mutateEliminar,
    archivarProyecto: mutateArchivar,
    restaurarProyecto: mutateRestaurar,
  } = useProyectosQuery()

  // ==================== CREAR PROYECTO ====================
  const crearProyecto = useCallback(
    async (data: ProyectoFormData) => {
      try {
        const proyecto = await mutateCrear(data)
        const url = construirURLProyecto(proyecto)
        router.push(url)
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        }
        throw error
      }
    },
    [mutateCrear, router]
  )

  // ==================== ACTUALIZAR PROYECTO ====================
  const actualizarProyecto = useCallback(
    async (proyectoId: string, data: ProyectoFormData) => {
      try {
        await mutateActualizar(proyectoId, data)

        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: proyectosKeys.detail(proyectoId) })
        queryClient.invalidateQueries({ queryKey: proyectosKeys.lists() })
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        }
        throw error
      }
    },
    [mutateActualizar, queryClient]
  )

  // ==================== ELIMINAR PROYECTO ====================
  const eliminarProyecto = useCallback(
    async (proyectoId: string) => {
      try {
        await mutateEliminar(proyectoId)
        router.push('/proyectos')
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        }
        throw error
      }
    },
    [mutateEliminar, router]
  )

  // ==================== ARCHIVAR PROYECTO ====================
  const archivarProyecto = useCallback(
    async (proyectoId: string, motivo?: string) => {
      try {
        await mutateArchivar(proyectoId, motivo)
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        }
        throw error
      }
    },
    [mutateArchivar]
  )

  // ==================== RESTAURAR PROYECTO ====================
  const restaurarProyecto = useCallback(
    async (proyectoId: string) => {
      try {
        await mutateRestaurar(proyectoId)
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        }
        throw error
      }
    },
    [mutateRestaurar]
  )

  // ==================== RETURN ====================
  return {
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto,
    archivarProyecto,
    restaurarProyecto,
  }
}
