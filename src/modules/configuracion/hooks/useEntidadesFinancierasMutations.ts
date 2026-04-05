/**
 * useEntidadesFinancierasMutations — Mutations para Entidades Financieras
 * Extraído de useEntidadesFinancieras.ts para separar responsabilidades
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { showEntitySuccessToast } from '@/components/toasts/custom-toasts'
import { logger } from '@/lib/utils/logger'

import { entidadesFinancierasService } from '../services/entidades-financieras.service'
import type {
  ActualizarEntidadFinancieraDTO,
  CrearEntidadFinancieraDTO,
  EntidadFinanciera,
} from '../types/entidades-financieras.types'

import { entidadesFinancierasKeys } from './useEntidadesFinancieras'

export function useCrearEntidadFinanciera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CrearEntidadFinancieraDTO) => {
      const result = await entidadesFinancierasService.create(dto)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: entidadesFinancierasKeys.all })
      showEntitySuccessToast({ entityName: data.nombre, action: 'created' })
    },
    onError: (error: Error) => {
      logger.error('Error al crear entidad financiera:', error)
      toast.error('Error al crear entidad', { description: error.message })
    },
  })
}

export function useActualizarEntidadFinanciera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string
      dto: ActualizarEntidadFinancieraDTO
    }) => {
      const result = await entidadesFinancierasService.update(id, dto)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({
        queryKey: entidadesFinancierasKeys.detail(id),
      })
      const previousData = queryClient.getQueryData<EntidadFinanciera>(
        entidadesFinancierasKeys.detail(id)
      )
      if (previousData) {
        queryClient.setQueryData<EntidadFinanciera>(
          entidadesFinancierasKeys.detail(id),
          {
            ...previousData,
            ...dto,
          }
        )
      }
      return { previousData }
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          entidadesFinancierasKeys.detail(variables.id),
          context.previousData
        )
      }
      logger.error('Error al actualizar entidad financiera:', error)
      toast.error('Error al actualizar entidad', { description: error.message })
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: entidadesFinancierasKeys.all })
      showEntitySuccessToast({ entityName: data.nombre, action: 'updated' })
    },
  })
}

export function useEliminarEntidadFinanciera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await entidadesFinancierasService.softDelete(id)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: entidadesFinancierasKeys.all })
      toast.success('✓ Entidad desactivada', {
        description: `${data.nombre} ya no aparecerá en las opciones de selección`,
      })
    },
    onError: (error: Error) => {
      logger.error('Error al desactivar entidad financiera:', error)
      toast.error('Error al desactivar entidad', { description: error.message })
    },
  })
}

export function useReactivarEntidadFinanciera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await entidadesFinancierasService.reactivate(id)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: entidadesFinancierasKeys.all })
      toast.success('✓ Entidad reactivada exitosamente', {
        description: `${data.nombre} vuelve a estar disponible para usar`,
      })
    },
    onError: (error: Error) => {
      logger.error('Error al reactivar entidad financiera:', error)
      toast.error('Error al reactivar entidad', { description: error.message })
    },
  })
}

export function useReordenarEntidadesFinancieras() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; orden: number }>) => {
      const result = await entidadesFinancierasService.reordenar(updates)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entidadesFinancierasKeys.all })
      toast.success('Orden actualizado', {
        description: 'El orden de las entidades se actualizó correctamente',
      })
    },
    onError: (error: Error) => {
      logger.error('Error al reordenar entidades:', error)
      toast.error('Error al reordenar', { description: error.message })
    },
  })
}
