/**
 * @file useEstadosVersion.ts
 * @description Hook para gestionar estados de versiones de documentos
 * @module viviendas/hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { documentosViviendaService } from '../services/documentos-vivienda.service'

interface MarcarErrorParams {
  documentoId: string
  motivo: string
  versionCorrectaId?: string
}

interface MarcarObsoletaParams {
  documentoId: string
  motivo: string
}

/**
 * Hook para gestionar estados de versión de documentos
 * Incluye: marcar como errónea, obsoleta, y restaurar estado
 */
export function useEstadosVersion(viviendaId?: string) {
  const queryClient = useQueryClient()

  // ============================================================================
  // MARCAR VERSIÓN COMO ERRÓNEA
  // ============================================================================

  const marcarComoErronea = useMutation({
    mutationFn: async ({ documentoId, motivo, versionCorrectaId }: MarcarErrorParams) => {
      await documentosViviendaService.marcarVersionComoErronea(
        documentoId,
        motivo,
        versionCorrectaId
      )
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      if (viviendaId) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', viviendaId],
        })
        queryClient.invalidateQueries({
          queryKey: ['documento-versiones', variables.documentoId],
        })
      }

      toast.success('Versión marcada como errónea', {
        description: 'La versión se ha marcado correctamente como errónea',
        duration: 4000,
      })
    },
    onError: (error: Error) => {
      console.error('❌ Error al marcar versión como errónea:', error)
      toast.error('Error al marcar versión como errónea', {
        description: error.message || 'No se pudo actualizar el estado de la versión',
        duration: 5000,
      })
    },
  })

  // ============================================================================
  // MARCAR VERSIÓN COMO OBSOLETA
  // ============================================================================

  const marcarComoObsoleta = useMutation({
    mutationFn: async ({ documentoId, motivo }: MarcarObsoletaParams) => {
      await documentosViviendaService.marcarVersionComoObsoleta(documentoId, motivo)
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      if (viviendaId) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', viviendaId],
        })
        queryClient.invalidateQueries({
          queryKey: ['documento-versiones', variables.documentoId],
        })
      }

      toast.success('Versión marcada como obsoleta', {
        description: 'La versión se ha marcado correctamente como obsoleta',
        duration: 4000,
      })
    },
    onError: (error: Error) => {
      console.error('❌ Error al marcar versión como obsoleta:', error)
      toast.error('Error al marcar versión como obsoleta', {
        description: error.message || 'No se pudo actualizar el estado de la versión',
        duration: 5000,
      })
    },
  })

  // ============================================================================
  // RESTAURAR ESTADO DE VERSIÓN (VOLVER A "VALIDA")
  // ============================================================================

  const restaurarEstado = useMutation({
    mutationFn: async (documentoId: string) => {
      await documentosViviendaService.restaurarEstadoVersion(documentoId)
    },
    onSuccess: (_, documentoId) => {
      // Invalidar queries relacionadas
      if (viviendaId) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', viviendaId],
        })
        queryClient.invalidateQueries({
          queryKey: ['documento-versiones', documentoId],
        })
      }

      toast.success('Estado restaurado', {
        description: 'La versión se ha marcado nuevamente como válida',
        duration: 4000,
      })
    },
    onError: (error: Error) => {
      console.error('❌ Error al restaurar estado:', error)
      toast.error('Error al restaurar estado', {
        description: error.message || 'No se pudo restaurar el estado de la versión',
        duration: 5000,
      })
    },
  })

  return {
    // Mutations
    marcarComoErronea,
    marcarComoObsoleta,
    restaurarEstado,

    // Loading states
    isMarking:
      marcarComoErronea.isPending ||
      marcarComoObsoleta.isPending ||
      restaurarEstado.isPending,
  }
}
