/**
 * ============================================
 * REACT QUERY: Renuncias
 * ============================================
 *
 * Query keys, hooks de query y mutations standalone.
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'

import {
    obtenerMetricas,
    obtenerRenuncia,
    obtenerRenuncias,
    procesarDevolucion,
    registrarRenuncia,
    subirComprobante,
    subirFormularioRenuncia,
    validarPuedeRenunciar,
} from '../services/renuncias.service'
import type { ProcesarDevolucionDTO, RegistrarRenunciaDTO } from '../types'
import { transformarRenunciaRow } from '../utils/renuncias.utils'

// ============================================
// QUERY KEYS
// ============================================

export const renunciasKeys = {
  all: ['renuncias'] as const,
  lists: () => [...renunciasKeys.all, 'list'] as const,
  list: (filtros?: Record<string, unknown>) => [...renunciasKeys.lists(), { filtros }] as const,
  details: () => [...renunciasKeys.all, 'detail'] as const,
  detail: (id: string) => [...renunciasKeys.details(), id] as const,
  metricas: () => [...renunciasKeys.all, 'metricas'] as const,
  validacion: (negociacionId: string) => [...renunciasKeys.all, 'validacion', negociacionId] as const,
}

// ============================================
// QUERIES
// ============================================

/** Hook para obtener todas las renuncias */
export function useRenunciasQuery() {
  return useQuery({
    queryKey: renunciasKeys.lists(),
    queryFn: async () => {
      const rows = await obtenerRenuncias()
      return rows.map(transformarRenunciaRow)
    },
  })
}

/** Hook para obtener una renuncia por ID */
export function useRenunciaDetailQuery(id: string | null) {
  return useQuery({
    queryKey: renunciasKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('ID requerido')
      const row = await obtenerRenuncia(id)
      return transformarRenunciaRow(row)
    },
    enabled: !!id,
  })
}

/** Hook para obtener métricas */
export function useRenunciasMetricas() {
  return useQuery({
    queryKey: renunciasKeys.metricas(),
    queryFn: obtenerMetricas,
  })
}

/** Hook para validar si una negociación puede renunciar */
export function useValidarRenuncia(negociacionId: string | null) {
  return useQuery({
    queryKey: renunciasKeys.validacion(negociacionId ?? ''),
    queryFn: () => validarPuedeRenunciar(negociacionId!),
    enabled: !!negociacionId,
  })
}

// ============================================
// MUTATIONS
// ============================================

/** Mutation standalone: registrar renuncia */
export function useRegistrarRenuncia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      dto,
      formularioRenuncia,
    }: {
      dto: RegistrarRenunciaDTO
      formularioRenuncia?: File
    }) => {
      // 1. Registrar renuncia (RPC atómica)
      const result = await registrarRenuncia(dto)
      const rpcResult = result as Record<string, unknown> | null

      // 2. Si hay formulario, subirlo post-RPC
      const renunciaId = rpcResult?.renuncia_id as string | undefined
      if (formularioRenuncia && renunciaId) {
        try {
          await subirFormularioRenuncia(formularioRenuncia, renunciaId)
        } catch (err) {
          logger.warn('⚠️ Formulario no se pudo subir, renuncia ya registrada:', err)
          toast.warning('Renuncia registrada, pero el formulario no se pudo adjuntar. Intente subirlo nuevamente.')
        }
      } else if (formularioRenuncia && !renunciaId) {
        logger.warn('⚠️ No se pudo extraer renuncia_id del RPC para subir formulario. Result:', result)
        toast.warning('Renuncia registrada, pero el formulario no se pudo adjuntar.')
      }

      return result
    },
    onSuccess: () => {
      toast.success('Renuncia registrada exitosamente')
      queryClient.invalidateQueries({ queryKey: renunciasKeys.all })
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['viviendas'] })
      queryClient.invalidateQueries({ queryKey: ['negociaciones'] })
      queryClient.invalidateQueries({ queryKey: ['abonos'] })
    },
    onError: (error: Error) => {
      logger.error('❌ Error registrando renuncia:', error)
      toast.error(error.message || 'Error al registrar renuncia')
    },
  })
}

/** Mutation standalone: procesar devolución */
export function useProcesarDevolucion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      renunciaId,
      dto,
      comprobante,
    }: {
      renunciaId: string
      dto: ProcesarDevolucionDTO
      comprobante?: File
    }) => {
      let comprobanteUrl: string | undefined

      if (comprobante) {
        comprobanteUrl = await subirComprobante(comprobante, renunciaId)
      }

      return procesarDevolucion(renunciaId, {
        ...dto,
        comprobante_devolucion_url: comprobanteUrl ?? dto.comprobante_devolucion_url,
      })
    },
    onSuccess: () => {
      toast.success('Devolución procesada exitosamente')
      queryClient.invalidateQueries({ queryKey: renunciasKeys.all })
    },
    onError: (error: Error) => {
      logger.error('❌ Error procesando devolución:', error)
      toast.error(error.message || 'Error al procesar devolución')
    },
  })
}
