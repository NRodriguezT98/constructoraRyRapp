/**
 * Hook para gestión de estados de versión de documentos de vivienda
 * Implementa sistema de aprobación, rechazo y marcado de estados de versiones
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DocumentosViviendaService } from '../../services/documentos'

// ============================================================================
// TYPES
// ============================================================================

export interface AprobarVersionParams {
  documentoId: string
  motivo: string
}

export interface RechazarVersionParams {
  documentoId: string
  motivo: string
}

export interface MarcarEstadoVersionParams {
  documentoId: string
  nuevoEstado: 'valida' | 'rechazada' | 'aprobada' | 'corregida'
  motivo: string
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useEstadosVersionVivienda(viviendaId?: string) {
  const queryClient = useQueryClient()

  // ============================================================================
  // APROBAR VERSIÓN
  // ============================================================================

  const aprobarVersion = useMutation({
    mutationFn: async ({ documentoId, motivo }: AprobarVersionParams) => {
      await DocumentosViviendaService.aprobarVersion(documentoId, motivo)
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      if (viviendaId) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', viviendaId],
        })
      }

      queryClient.invalidateQueries({
        queryKey: ['documento-versiones-vivienda'],
      })

      toast.success('Versión aprobada', {
        description: 'El documento ha sido aprobado correctamente',
      })
    },
    onError: (error: Error) => {
      console.error('❌ Error al aprobar versión:', error)
      toast.error('Error al aprobar versión', {
        description: error.message,
      })
    },
  })

  // ============================================================================
  // RECHAZAR VERSIÓN
  // ============================================================================

  const rechazarVersion = useMutation({
    mutationFn: async ({ documentoId, motivo }: RechazarVersionParams) => {
      await DocumentosViviendaService.rechazarVersion(documentoId, motivo)
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      if (viviendaId) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', viviendaId],
        })
      }

      queryClient.invalidateQueries({
        queryKey: ['documento-versiones-vivienda'],
      })

      toast.success('Versión rechazada', {
        description: 'El documento ha sido rechazado',
      })
    },
    onError: (error: Error) => {
      console.error('❌ Error al rechazar versión:', error)
      toast.error('Error al rechazar versión', {
        description: error.message,
      })
    },
  })

  // ============================================================================
  // MARCAR ESTADO DE VERSIÓN
  // ============================================================================

  const marcarEstadoVersion = useMutation({
    mutationFn: async ({ documentoId, nuevoEstado, motivo }: MarcarEstadoVersionParams) => {
      await DocumentosViviendaService.marcarEstadoVersion(documentoId, nuevoEstado, motivo)
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      if (viviendaId) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', viviendaId],
        })
      }

      queryClient.invalidateQueries({
        queryKey: ['documento-versiones-vivienda'],
      })

      toast.success('Estado actualizado', {
        description: 'El estado de la versión ha sido actualizado',
      })
    },
    onError: (error: Error) => {
      console.error('❌ Error al marcar estado:', error)
      toast.error('Error al actualizar estado', {
        description: error.message,
      })
    },
  })

  return {
    aprobarVersion,
    rechazarVersion,
    marcarEstadoVersion,
  }
}
