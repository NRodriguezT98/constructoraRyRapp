/**
 * Hook para gestionar Notas Manuales del Historial
 * Mutations de React Query con invalidación automática de cache
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { notasHistorialService } from '../services/notas-historial.service'
import type { ActualizarNotaDTO, CrearNotaDTO } from '../types/notas-historial.types'

export function useNotasHistorial(clienteId: string) {
  const queryClient = useQueryClient()

  /**
   * Mutation: Crear nota
   */
  const crearNotaMutation = useMutation({
    mutationFn: (datos: CrearNotaDTO) => notasHistorialService.crearNota(datos),
    onSuccess: async (result) => {
      if (result.success) {
        // Refetch INMEDIATO (no esperar invalidación)
        await queryClient.refetchQueries({
          queryKey: ['notas-historial-cliente', clienteId],
          type: 'active'
        })

        toast.success('Nota agregada al historial')
      } else {
        toast.error(result.error || 'Error al crear nota')
      }
    },
    onError: (error: Error) => {
      console.error('Error creando nota:', error)
      toast.error('Error al crear nota')
    },
  })

  /**
   * Mutation: Actualizar nota
   */
  const actualizarNotaMutation = useMutation({
    mutationFn: ({ notaId, datos }: { notaId: string; datos: ActualizarNotaDTO }) =>
      notasHistorialService.actualizarNota(notaId, datos),
    onSuccess: async (result) => {
      if (result.success) {
        // Refetch INMEDIATO
        await queryClient.refetchQueries({
          queryKey: ['notas-historial-cliente', clienteId],
          type: 'active'
        })

        toast.success('Nota actualizada')
      } else {
        toast.error(result.error || 'Error al actualizar nota')
      }
    },
    onError: (error: Error) => {
      console.error('Error actualizando nota:', error)
      toast.error('Error al actualizar nota')
    },
  })

  /**
   * Mutation: Eliminar nota
   */
  const eliminarNotaMutation = useMutation({
    mutationFn: (notaId: string) => notasHistorialService.eliminarNota(notaId),
    onSuccess: async (result) => {
      if (result.success) {
        // Refetch INMEDIATO
        await queryClient.refetchQueries({
          queryKey: ['notas-historial-cliente', clienteId],
          type: 'active'
        })

        toast.success('Nota eliminada')
      } else {
        toast.error(result.error || 'Error al eliminar nota')
      }
    },
    onError: (error: Error) => {
      console.error('Error eliminando nota:', error)
      toast.error('Error al eliminar nota')
    },
  })

  return {
    // Mutations (usar mutateAsync para soporte de await en componentes)
    crearNota: crearNotaMutation.mutateAsync,
    actualizarNota: actualizarNotaMutation.mutateAsync,
    eliminarNota: eliminarNotaMutation.mutateAsync,

    // Estados de carga
    isCreando: crearNotaMutation.isPending,
    isActualizando: actualizarNotaMutation.isPending,
    isEliminando: eliminarNotaMutation.isPending,
  }
}
