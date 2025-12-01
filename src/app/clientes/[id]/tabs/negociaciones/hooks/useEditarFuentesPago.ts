/**
 * ============================================
 * HOOK: useEditarFuentesPago
 * ============================================
 *
 * ✅ LÓGICA DE NEGOCIO PARA EDITAR FUENTES
 * Maneja el estado del modal y la actualización de fuentes en DB.
 *
 * Features:
 * - State management del modal
 * - Transformación de datos para API
 * - Manejo de errores
 * - Invalidación de cache React Query
 *
 * @version 1.0.0 - 2025-11-28
 */

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { negociacionesQueryKeys } from '@/modules/clientes/hooks/useNegociacionesQuery'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import type { FuentePagoEditable } from '../EditarFuentesPagoModal'

// ============================================
// TYPES
// ============================================

interface UseEditarFuentesPagoProps {
  negociacionId: string
}

// ============================================
// HOOK
// ============================================

export function useEditarFuentesPago({ negociacionId }: UseEditarFuentesPagoProps) {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // =====================================================
  // HANDLERS
  // =====================================================

  const abrirModal = () => {
    setIsModalOpen(true)
  }

  const cerrarModal = () => {
    setIsModalOpen(false)
  }

  const guardarFuentes = async (fuentes: FuentePagoEditable[]) => {
    try {
      // Transformar datos para API
      const fuentesParaGuardar = fuentes.map((f) => ({
        id: f.id, // undefined si es nueva
        tipo: f.tipo,
        monto_aprobado: f.monto, // ✅ Mapear monto → monto_aprobado
        entidad: f.entidad || null,
        numero_referencia: f.numero_referencia || null,
        detalles: f.detalles || null,
      }))

      // Llamar al service
      await negociacionesService.actualizarFuentesPago(negociacionId, fuentesParaGuardar)

      // Invalidar cache para refrescar datos inmediatamente
      await queryClient.invalidateQueries({
        queryKey: negociacionesQueryKeys.fuentesPago(negociacionId),
      })

      // También invalidar el detalle de la negociación (por si acaso)
      await queryClient.invalidateQueries({
        queryKey: negociacionesQueryKeys.detalle(negociacionId),
      })

      toast.success('✅ Fuentes de pago actualizadas correctamente')
    } catch (error) {
      console.error('Error al actualizar fuentes:', error)
      toast.error('❌ Error al guardar las fuentes de pago')
      throw error
    }
  }

  // =====================================================
  // RETURN
  // =====================================================

  return {
    isModalOpen,
    abrirModal,
    cerrarModal,
    guardarFuentes,
  }
}
