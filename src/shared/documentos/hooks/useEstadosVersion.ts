/**
 * ✅ GENÉRICO: Hook para gestión de estados de versión de documentos
 * Soporta todos los tipos de entidad (proyecto, vivienda, cliente)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'

import { DocumentosEstadosService } from '../services/documentos-estados.service'
import type { TipoEntidad } from '../types/entidad.types'

// ============================================================================
// TYPES
// ============================================================================

export interface MarcarVersionErroneaParams {
  documentoId: string
  documentoPadreId?: string
  motivo: string
  versionCorrectaId?: string
}

export interface MarcarVersionObsoletaParams {
  documentoId: string
  documentoPadreId?: string
  motivo: string
}

export interface RestaurarEstadoParams {
  documentoId: string
  documentoPadreId?: string
}

// Query key prefixes por tipo de entidad
const QUERY_KEY_MAP: Record<TipoEntidad, string> = {
  proyecto: 'documentos-proyecto',
  vivienda: 'documentos-vivienda',
  cliente: 'documentos-cliente',
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useEstadosVersion(
  entidadId?: string,
  tipoEntidad: TipoEntidad = 'proyecto'
) {
  const queryClient = useQueryClient()
  const queryKeyPrefix = QUERY_KEY_MAP[tipoEntidad]

  const invalidarQueries = (documentoPadreId?: string) => {
    if (entidadId) {
      queryClient.invalidateQueries({
        queryKey: [queryKeyPrefix, entidadId],
      })
    }

    if (documentoPadreId) {
      queryClient.invalidateQueries({
        queryKey: ['documento-versiones', documentoPadreId],
      })
    }

    queryClient.invalidateQueries({
      queryKey: ['documento-versiones'],
    })
  }

  const marcarComoErronea = useMutation({
    mutationFn: async ({
      documentoId,
      motivo,
      versionCorrectaId,
    }: MarcarVersionErroneaParams) => {
      await DocumentosEstadosService.marcarVersionComoErronea(
        documentoId,
        motivo,
        versionCorrectaId,
        tipoEntidad
      )
    },
    onSuccess: (_, variables) => {
      invalidarQueries(variables.documentoPadreId)
      toast.success('Versión marcada como errónea', {
        description: 'El documento ha sido marcado correctamente',
      })
    },
    onError: (error: Error) => {
      logger.error('❌ Error al marcar versión como errónea:', error)
      toast.error('Error al marcar versión', {
        description: error.message,
      })
    },
  })

  const marcarComoObsoleta = useMutation({
    mutationFn: async ({
      documentoId,
      motivo,
    }: MarcarVersionObsoletaParams) => {
      await DocumentosEstadosService.marcarVersionComoObsoleta(
        documentoId,
        motivo,
        tipoEntidad
      )
    },
    onSuccess: (_, variables) => {
      invalidarQueries(variables.documentoPadreId)
      toast.success('Versión marcada como obsoleta', {
        description: 'El documento ha sido marcado correctamente',
      })
    },
    onError: (error: Error) => {
      logger.error('❌ Error al marcar versión como obsoleta:', error)
      toast.error('Error al marcar versión', {
        description: error.message,
      })
    },
  })

  const restaurarEstado = useMutation({
    mutationFn: async ({ documentoId }: RestaurarEstadoParams) => {
      await DocumentosEstadosService.restaurarEstadoVersion(
        documentoId,
        tipoEntidad
      )
    },
    onSuccess: (_, variables) => {
      invalidarQueries(variables.documentoPadreId)
      toast.success('Estado restaurado a válido', {
        description: 'La versión ha sido restaurada correctamente',
      })
    },
    onError: (error: Error) => {
      logger.error('❌ Error al restaurar estado de versión:', error)
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
