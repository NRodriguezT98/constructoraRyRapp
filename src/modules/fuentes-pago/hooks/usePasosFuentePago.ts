/**
 * ============================================
 * REACT QUERY HOOKS: Pasos de Validación de Fuentes de Pago
 * ============================================
 *
 * Hooks con TODA la lógica de negocio y estado.
 * Componentes solo consumen estos hooks.
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * ✅ Hooks: Lógica + Estado + Queries + Mutations
 * ✅ Servicios: Solo llamadas API
 * ✅ Componentes: Solo UI presentacional
 *
 * @version 1.0.0 - 2025-12-11
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
    calcularProgresoFuentePago,
    crearPasosFuentePago,
    editarPasoFuentePago,
    marcarPasoCompletado,
    obtenerPasosFuentePago,
    validarPreDesembolso
} from '../services/pasos-fuente-pago.service'
import type {
    CrearPasosDTO,
    MarcarPasoCompletadoDTO
} from '../types'
import { pasosFuentePagoKeys } from '../types'

// ============================================
// QUERIES (READ)
// ============================================

/**
 * Hook: Obtener pasos de validación de una fuente de pago
 *
 * @param fuenteId - ID de la fuente de pago
 * @param enabled - Si la query debe ejecutarse (opcional)
 */
export function usePasosFuentePagoQuery(fuenteId: string | null, enabled = true) {
  return useQuery({
    queryKey: pasosFuentePagoKeys.list(fuenteId || ''),
    queryFn: () => obtenerPasosFuentePago(fuenteId!),
    enabled: enabled && !!fuenteId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  })
}

/**
 * Hook: Calcular progreso de validación de una fuente
 *
 * @param fuenteId - ID de la fuente de pago
 * @param enabled - Si la query debe ejecutarse (opcional)
 */
export function useProgresoFuentePagoQuery(fuenteId: string | null, enabled = true) {
  return useQuery({
    queryKey: pasosFuentePagoKeys.progreso(fuenteId || ''),
    queryFn: () => calcularProgresoFuentePago(fuenteId!),
    enabled: enabled && !!fuenteId,
    staleTime: 1000 * 60 * 2, // 2 minutos (más frecuente)
    gcTime: 1000 * 60 * 5,
  })
}

/**
 * Hook: Validar si una fuente puede desembolsar
 *
 * @param fuenteId - ID de la fuente de pago
 * @param enabled - Si la query debe ejecutarse (opcional)
 */
export function useValidacionPreDesembolsoQuery(fuenteId: string | null, enabled = true) {
  return useQuery({
    queryKey: pasosFuentePagoKeys.validacion(fuenteId || ''),
    queryFn: () => validarPreDesembolso(fuenteId!),
    enabled: enabled && !!fuenteId,
    staleTime: 1000 * 30, // 30 segundos (validación en tiempo real)
    gcTime: 1000 * 60 * 2,
  })
}

// ============================================
// MUTATIONS (WRITE)
// ============================================

/**
 * Hook: Crear pasos de validación para una fuente
 */
export function useCrearPasosFuentePagoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: CrearPasosDTO) => crearPasosFuentePago(datos),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: pasosFuentePagoKeys.list(variables.fuente_pago_id),
      })
      queryClient.invalidateQueries({
        queryKey: pasosFuentePagoKeys.progreso(variables.fuente_pago_id),
      })
      queryClient.invalidateQueries({
        queryKey: pasosFuentePagoKeys.validacion(variables.fuente_pago_id),
      })
    },
  })
}

/**
 * Hook: Marcar paso como completado
 */
export function useMarcarPasoCompletadoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: MarcarPasoCompletadoDTO) => marcarPasoCompletado(datos),
    onSuccess: (pasoActualizado) => {
      // Obtener fuente_pago_id del paso actualizado
      const fuenteId = pasoActualizado.fuente_pago_id

      // Invalidar todas las queries relacionadas con esta fuente
      queryClient.invalidateQueries({
        queryKey: pasosFuentePagoKeys.list(fuenteId),
      })
      queryClient.invalidateQueries({
        queryKey: pasosFuentePagoKeys.progreso(fuenteId),
      })
      queryClient.invalidateQueries({
        queryKey: pasosFuentePagoKeys.validacion(fuenteId),
      })
    },
  })
}

/**
 * Hook: Editar/reabrir un paso
 */
export function useEditarPasoFuentePagoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pasoId, datos }: {
      pasoId: string
      datos: Parameters<typeof editarPasoFuentePago>[1]
    }) => editarPasoFuentePago(pasoId, datos),
    onSuccess: (pasoActualizado) => {
      const fuenteId = pasoActualizado.fuente_pago_id

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: pasosFuentePagoKeys.list(fuenteId),
      })
      queryClient.invalidateQueries({
        queryKey: pasosFuentePagoKeys.progreso(fuenteId),
      })
      queryClient.invalidateQueries({
        queryKey: pasosFuentePagoKeys.validacion(fuenteId),
      })
    },
  })
}

// ============================================
// HOOKS COMPUESTOS (Lógica de Negocio)
// ============================================

/**
 * Hook compuesto: Gestión completa de pasos de una fuente
 *
 * Combina queries y mutations en un solo hook con toda la lógica.
 * Componentes solo usan este hook.
 */
export function usePasosFuentePago(fuenteId: string | null) {
  // Queries
  const {
    data: pasos = [],
    isLoading: isLoadingPasos,
    error: errorPasos,
  } = usePasosFuentePagoQuery(fuenteId)

  const {
    data: progreso,
    isLoading: isLoadingProgreso,
  } = useProgresoFuentePagoQuery(fuenteId)

  const {
    data: validacion,
    isLoading: isLoadingValidacion,
  } = useValidacionPreDesembolsoQuery(fuenteId)

  // Mutations
  const marcarCompletadoMutation = useMarcarPasoCompletadoMutation()
  const editarPasoMutation = useEditarPasoFuentePagoMutation()

  // ==========================================
  // Lógica de negocio
  // ==========================================

  // ✅ Mapear pasos con información correcta de documentos
  const pasosMapeados = pasos.map(paso => ({
    ...paso,
    tiene_documento: !!paso.documento_id || !!paso.documento,
    documento_id: paso.documento_id || paso.documento?.id || undefined,
  }))

  const pasosCompletados = pasosMapeados.filter(p => p.completado)
  const pasosPendientes = pasosMapeados.filter(p => !p.completado)
  const todoCompletado = progreso?.porcentaje === 100

  // Calcular si puede desembolsar
  const puedeDesembolsar = validacion?.valido || false

  // ==========================================
  // Handlers
  // ==========================================

  const marcarCompletado = async (datos: MarcarPasoCompletadoDTO) => {
    try {
      await marcarCompletadoMutation.mutateAsync(datos)
      return { success: true }
    } catch (error) {
      console.error('❌ Error marcando paso:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  const reabrirPaso = async (pasoId: string, observaciones?: string) => {
    try {
      await editarPasoMutation.mutateAsync({
        pasoId,
        datos: {
          completado: false,
          observaciones: observaciones || 'Paso reabierto manualmente',
        },
      })
      return { success: true }
    } catch (error) {
      console.error('❌ Error reabriendo paso:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  // ==========================================
  // Return
  // ==========================================

  return {
    // Datos
    pasos: pasosMapeados,
    pasosCompletados,
    pasosPendientes,
    progreso: progreso || {
      total_pasos: pasos.length,
      completados: pasosCompletados.length,
      pendientes: pasosPendientes.length,
      porcentaje: pasos.length > 0 ? Math.round((pasosCompletados.length / pasos.length) * 100) : 0,
    },
    validacion,
    todoCompletado,
    puedeDesembolsar,

    // Estados de carga
    isLoading: isLoadingPasos || isLoadingProgreso || isLoadingValidacion,
    isLoadingPasos,
    isLoadingProgreso,
    isLoadingValidacion,

    // Errores
    error: errorPasos,

    // Mutations
    marcarCompletado,
    reabrirPaso,
    isMarking: marcarCompletadoMutation.isPending,
    isEditing: editarPasoMutation.isPending,
  }
}

/**
 * Hook simplificado: Solo progreso (para cards/badges)
 */
export function useProgresoFuentePago(fuenteId: string | null) {
  const { data: progreso, isLoading } = useProgresoFuentePagoQuery(fuenteId)

  return {
    progreso: progreso || {
      total_pasos: 0,
      completados: 0,
      pendientes: 0,
      porcentaje: 0,
    },
    isLoading,
  }
}

/**
 * Hook simplificado: Solo validación (para botón de desembolso)
 */
export function useValidacionDesembolso(fuenteId: string | null) {
  const { data: validacion, isLoading } = useValidacionPreDesembolsoQuery(fuenteId)

  return {
    puedeDesembolsar: validacion?.valido || false,
    errores: validacion?.errores || [],
    pasosPendientes: validacion?.pasos_pendientes || [],
    isLoading,
  }
}
