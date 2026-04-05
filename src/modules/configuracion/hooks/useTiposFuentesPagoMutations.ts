/**
 * useTiposFuentesPagoMutations — Mutations para Tipos de Fuentes de Pago
 * Extraído de useTiposFuentesPago.ts para separar responsabilidades
 */

'use client'

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { TiposFuentesPagoService } from '../services'
import type {
  ActualizarTipoFuentePagoDTO,
  CrearTipoFuentePagoDTO,
  TipoFuentePago,
} from '../types'

import { tiposFuentesPagoKeys } from './useTiposFuentesPago'

export function useCrearTipoFuentePago(
  options?: Omit<
    UseMutationOptions<TipoFuentePago, Error, CrearTipoFuentePagoDTO>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return useMutation({
    mutationFn: async (dto: CrearTipoFuentePagoDTO) => {
      const result = await service.create(dto)
      if (!result.success) throw new Error(result.error.mensaje)
      return result.data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: tiposFuentesPagoKeys.options(),
      })
      toast.success('Tipo de fuente creado', {
        description: `"${data.nombre}" se ha creado correctamente`,
      })
    },
    onError: error => {
      toast.error('Error al crear tipo de fuente', {
        description: error.message,
      })
    },
    ...options,
  })
}

export function useActualizarTipoFuentePago(
  options?: Omit<
    UseMutationOptions<
      TipoFuentePago,
      Error,
      { id: string; dto: ActualizarTipoFuentePagoDTO }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return useMutation({
    mutationFn: async ({ id, dto }) => {
      const result = await service.update(id, dto)
      if (!result.success) throw new Error(result.error.mensaje)
      return result.data
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: tiposFuentesPagoKeys.options(),
      })
      queryClient.invalidateQueries({
        queryKey: tiposFuentesPagoKeys.detail(id),
      })
      queryClient.setQueryData(tiposFuentesPagoKeys.detail(id), data)
      toast.success('Tipo de fuente actualizado', {
        description: `"${data.nombre}" se ha actualizado correctamente`,
      })
    },
    onError: error => {
      toast.error('Error al actualizar tipo de fuente', {
        description: error.message,
      })
    },
    ...options,
  })
}

export function useEliminarTipoFuentePago(
  options?: Omit<
    UseMutationOptions<TipoFuentePago, Error, string>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await service.softDelete(id)
      if (!result.success) throw new Error(result.error.mensaje)
      return result.data
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: tiposFuentesPagoKeys.options(),
      })
      queryClient.invalidateQueries({
        queryKey: tiposFuentesPagoKeys.detail(id),
      })
      toast.success('Tipo de fuente eliminado', {
        description: `"${data.nombre}" se ha desactivado correctamente`,
      })
    },
    onError: error => {
      toast.error('Error al eliminar tipo de fuente', {
        description: error.message,
      })
    },
    ...options,
  })
}

export function useReactivarTipoFuentePago(
  options?: Omit<
    UseMutationOptions<TipoFuentePago, Error, string>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await service.reactivar(id)
      if (!result.success) throw new Error(result.error.mensaje)
      return result.data
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: tiposFuentesPagoKeys.options(),
      })
      queryClient.invalidateQueries({
        queryKey: tiposFuentesPagoKeys.detail(id),
      })
      toast.success('Tipo de fuente reactivado', {
        description: `"${data.nombre}" se ha activado correctamente`,
      })
    },
    onError: error => {
      toast.error('Error al reactivar tipo de fuente', {
        description: error.message,
      })
    },
    ...options,
  })
}

export function useReordenarTiposFuentesPago(
  options?: Omit<
    UseMutationOptions<void, Error, Array<{ id: string; orden: number }>>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient()
  const service = new TiposFuentesPagoService()

  return useMutation({
    mutationFn: async reordenamientos => {
      const result = await service.reordenar(reordenamientos)
      if (!result.success) throw new Error(result.error.mensaje)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposFuentesPagoKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: tiposFuentesPagoKeys.options(),
      })
      toast.success('Orden actualizado', {
        description: 'El orden de las fuentes de pago se ha actualizado',
      })
    },
    onError: error => {
      toast.error('Error al reordenar', { description: error.message })
    },
    ...options,
  })
}
