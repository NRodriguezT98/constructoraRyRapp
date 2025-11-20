/**
 * Hook para gestión de estados de versión de documentos de vivienda
 * Implementa sistema de marcado de versiones erróneas, obsoletas y restauración
 *
 * ✅ ALINEADO CON MÓDULO DE PROYECTOS
 */

import { documentosViviendaService } from '@/modules/viviendas/services/documentos-vivienda.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

export interface MarcarVersionErroneaParams {
  documentoId: string
  documentoPadreId?: string // ✅ ID del documento padre (para invalidar query correcta)
  motivo: string
  versionCorrectaId?: string
}

export interface MarcarVersionObsoletaParams {
  documentoId: string
  documentoPadreId?: string // ✅ ID del documento padre
  motivo: string
}

export interface RestaurarEstadoParams {
  documentoId: string
  documentoPadreId?: string // ✅ ID del documento padre
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useEstadosVersionVivienda(viviendaId?: string) {
  const queryClient = useQueryClient()

  // ============================================================================
  // MARCAR VERSIÓN COMO ERRÓNEA
  // ============================================================================

  const marcarComoErronea = useMutation({
    mutationFn: async ({
      documentoId,
      motivo,
      versionCorrectaId,
    }: MarcarVersionErroneaParams) => {
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
      }

      // ✅ Invalidar query específica del documento padre
      if (variables.documentoPadreId) {
        queryClient.invalidateQueries({
          queryKey: ['documento-versiones-vivienda', variables.documentoPadreId],
        })
      }

      // Invalidar TODAS las queries de versiones como fallback
      queryClient.invalidateQueries({
        queryKey: ['documento-versiones-vivienda'],
      })

      toast.success('Versión marcada como errónea', {
        description: 'El documento ha sido marcado correctamente',
      })
    },
    onError: (error: Error) => {
      // eslint-disable-next-line no-console
      console.error('❌ Error al marcar versión como errónea:', error)
      toast.error('Error al marcar versión', {
        description: error.message,
      })
    },
  })

  // ============================================================================
  // MARCAR VERSIÓN COMO OBSOLETA
  // ============================================================================

  const marcarComoObsoleta = useMutation({
    mutationFn: async ({ documentoId, motivo }: MarcarVersionObsoletaParams) => {
      await documentosViviendaService.marcarVersionComoObsoleta(documentoId, motivo)
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      if (viviendaId) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', viviendaId],
        })
      }

      // ✅ Invalidar query específica del documento padre
      if (variables.documentoPadreId) {
        queryClient.invalidateQueries({
          queryKey: ['documento-versiones-vivienda', variables.documentoPadreId],
        })
      }

      // Invalidar TODAS las queries de versiones como fallback
      queryClient.invalidateQueries({
        queryKey: ['documento-versiones-vivienda'],
      })

      toast.success('Versión marcada como obsoleta', {
        description: 'El documento ha sido marcado correctamente',
      })
    },
    onError: (error: Error) => {
      // eslint-disable-next-line no-console
      console.error('❌ Error al marcar versión como obsoleta:', error)
      toast.error('Error al marcar versión', {
        description: error.message,
      })
    },
  })

  // ============================================================================
  // RESTAURAR ESTADO DE VERSIÓN
  // ============================================================================

  const restaurarEstado = useMutation({
    mutationFn: async ({ documentoId }: RestaurarEstadoParams) => {
      await documentosViviendaService.restaurarEstadoVersion(documentoId)
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      if (viviendaId) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', viviendaId],
        })
      }

      // ✅ Invalidar query específica del documento padre
      if (variables.documentoPadreId) {
        queryClient.invalidateQueries({
          queryKey: ['documento-versiones-vivienda', variables.documentoPadreId],
        })
      }

      // Invalidar TODAS las queries de versiones como fallback
      queryClient.invalidateQueries({
        queryKey: ['documento-versiones-vivienda'],
      })

      toast.success('Estado restaurado', {
        description: 'La versión ha sido restaurada a estado válido',
      })
    },
    onError: (error: Error) => {
      // eslint-disable-next-line no-console
      console.error('❌ Error al restaurar estado:', error)
      toast.error('Error al restaurar estado', {
        description: error.message,
      })
    },
  })

  return {
    marcarComoErronea,
    marcarComoObsoleta,
    restaurarEstado,
  }
}
