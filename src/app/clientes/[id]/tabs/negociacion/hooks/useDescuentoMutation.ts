'use client'

/**
 * HOOK: useDescuentoMutation
 *
 * Mutación para aplicar/modificar descuento en una negociación.
 * El trigger `calcular_valor_total_pagar()` recalcula automáticamente
 * el valor_total_pagar después del UPDATE.
 */

import { useCallback, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'
import { negociacionesQueryKeys } from '@/modules/clientes/hooks/useNegociacionesQuery'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'

// ============================================
// TYPES
// ============================================

export const TIPOS_DESCUENTO = [
  'comercial',
  'pronto_pago',
  'referido',
  'promocional',
  'forma_pago',
  'otro',
] as const

export type TipoDescuento = (typeof TIPOS_DESCUENTO)[number]

export const LABELS_TIPO_DESCUENTO: Record<TipoDescuento, string> = {
  comercial: 'Descuento Comercial',
  pronto_pago: 'Descuento por Pronto Pago',
  referido: 'Descuento por Referido',
  promocional: 'Descuento Promocional',
  forma_pago: 'Descuento por Forma de Pago',
  otro: 'Otro',
}

export interface DatosDescuento {
  descuento_aplicado: number
  tipo_descuento: TipoDescuento
  motivo_descuento: string
}

// ============================================
// HOOK
// ============================================

interface UseDescuentoMutationProps {
  negociacionId?: string
  clienteId: string
}

export function useDescuentoMutation({
  negociacionId,
  clienteId,
}: UseDescuentoMutationProps) {
  const queryClient = useQueryClient()
  const [modalDescuentoOpen, setModalDescuentoOpen] = useState(false)

  const openDescuento = useCallback(() => setModalDescuentoOpen(true), [])
  const closeDescuento = useCallback(() => setModalDescuentoOpen(false), [])

  const descuentoMutation = useMutation({
    mutationFn: async (datos: DatosDescuento) => {
      if (!negociacionId) throw new Error('No hay negociación activa')

      return negociacionesService.actualizarNegociacion(negociacionId, {
        descuento_aplicado: datos.descuento_aplicado,
        tipo_descuento: datos.tipo_descuento,
        motivo_descuento: datos.motivo_descuento,
      })
    },
    onSuccess: () => {
      // Invalidar negociaciones del cliente (para que valor_total_pagar se actualice)
      queryClient.invalidateQueries({
        queryKey: negociacionesQueryKeys.byCliente(clienteId),
      })
      // Invalidar fuentes de pago (para recalcular balance)
      queryClient.invalidateQueries({
        queryKey: ['fuentes-pago-neg-tab', negociacionId],
      })
      toast.success('Descuento aplicado correctamente')
      closeDescuento()
    },
    onError: (error: Error) => {
      logger.error('Error aplicando descuento:', error)
      toast.error(
        error.message || 'Error al aplicar descuento. Intenta nuevamente.'
      )
    },
  })

  return {
    modalDescuentoOpen,
    openDescuento,
    closeDescuento,
    isAplicandoDescuento: descuentoMutation.isPending,
    handleAplicarDescuento: descuentoMutation.mutate,
  }
}
