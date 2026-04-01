/**
 * ============================================
 * HOOK: useValidacionDesembolso
 * ============================================
 *
 * Verifica si se puede registrar desembolso antes de abrir modal.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'

import { validacionDesembolsoService } from '../services/validacion-desembolso.service'

export function useValidacionDesembolso(fuentePagoId: string | null) {

  const { data: validacion, isLoading } = useQuery({
    queryKey: ['validacion-desembolso', fuentePagoId],
    queryFn: () => {
      if (!fuentePagoId) throw new Error('fuentePagoId es requerido')
      return validacionDesembolsoService.puedeRegistrarDesembolso(supabase, fuentePagoId)
    },
    enabled: !!fuentePagoId,
    refetchInterval: 5000, // Actualizar cada 5 segundos
  })

  /**
   * Verificar antes de abrir modal de desembolso
   * Retorna true si puede continuar, false si está bloqueado
   */
  const verificarAntesDeDesembolsar = (): boolean => {
    if (!validacion) {
      toast.error('No se pudo verificar el estado de validación')
      return false
    }

    if (!validacion.puede_desembolsar) {
      // Mostrar toast con documentos faltantes
      const faltantes = validacion.pasos_faltantes
        .map((p) => p.titulo)
        .join(', ')

      toast.error('Desembolso Bloqueado', {
        description: `Faltan documentos obligatorios: ${faltantes}`,
        duration: 6000,
      })
      return false
    }

    return true
  }

  return {
    validacion,
    isLoading,
    puede_desembolsar: validacion?.puede_desembolsar ?? false,
    razon: validacion?.razon ?? '',
    pasos_faltantes: validacion?.pasos_faltantes ?? [],
    verificarAntesDeDesembolsar,
  }
}
