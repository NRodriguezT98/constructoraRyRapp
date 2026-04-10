'use client'

/**
 * HOOK: useRebalanceoMutation
 *
 * Mutación atómica para rebalancear el plan financiero de una negociación.
 * Usa la RPC `rebalancear_plan_financiero` de PostgreSQL para garantizar
 * que TODO se ejecuta o NADA se persiste.
 */

import { useCallback, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'
import { documentosPendientesKeys } from '@/modules/clientes/types/documentos-pendientes.types'

import type { DatosRebalanceo } from './useNegociacionTab'

interface UseRebalanceoMutationProps {
  negociacionId?: string
  clienteId: string
  valorVivienda: number
}

export function useRebalanceoMutation({
  negociacionId,
  clienteId,
  valorVivienda,
}: UseRebalanceoMutationProps) {
  const queryClient = useQueryClient()
  const [modalRebalancearOpen, setModalRebalancearOpen] = useState(false)

  const openRebalancear = useCallback(() => setModalRebalancearOpen(true), [])
  const closeRebalancear = useCallback(() => setModalRebalancearOpen(false), [])

  const rebalancearMutation = useMutation({
    mutationFn: async ({ ajustes, nuevas, motivo, notas }: DatosRebalanceo) => {
      // Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const payload = {
        negociacion_id: negociacionId,
        usuario_id: user?.id ?? null,
        motivo,
        notas: notas || null,
        valor_vivienda: valorVivienda,
        cliente_id: clienteId,
        ajustes: ajustes.map(a => ({
          id: a.id,
          tipo: a.tipo,
          montoOriginal: a.montoOriginal,
          montoEditable: a.montoEditable,
          entidad: a.entidad,
          entidadEditable: a.entidadEditable,
          paraEliminar: a.paraEliminar,
        })),
        nuevas: nuevas.map(n => ({
          tipo: n.tipo,
          monto: n.monto,
          entidad: n.entidad || '',
        })),
      }

      const { data, error } = await supabase.rpc(
        'rebalancear_plan_financiero',
        { p_payload: payload }
      )

      if (error) throw error

      const result = data as { success: boolean; error?: string } | null
      if (result && !result.success)
        throw new Error(result.error || 'Error en rebalanceo')

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['fuentes-pago-neg-tab', negociacionId],
      })
      queryClient.invalidateQueries({
        queryKey: documentosPendientesKeys.byCliente(clienteId),
      })
      queryClient.invalidateQueries({
        queryKey: ['docs-pendientes-neg-tab', clienteId],
      })
      toast.success('Plan financiero actualizado correctamente')
      closeRebalancear()
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          'Error al actualizar el plan financiero. Intenta nuevamente.'
      )
    },
  })

  return {
    modalRebalancearOpen,
    openRebalancear,
    closeRebalancear,
    isRebalanceando: rebalancearMutation.isPending,
    handleGuardarRebalanceo: rebalancearMutation.mutate,
  }
}
