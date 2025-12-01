/**
 * Hook para gestionar historial de versiones de negociaciones
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
    NegociacionesVersionesService,
    type CrearVersionParams
} from '../services/negociaciones-versiones.service'

export function useHistorialVersiones(negociacionId: string) {
  const queryClient = useQueryClient()

  // Query: Obtener historial completo
  const {
    data: versiones,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['negociaciones-versiones', negociacionId],
    queryFn: () => NegociacionesVersionesService.obtenerHistorial(negociacionId),
    enabled: !!negociacionId,
    staleTime: 1000 * 60 * 5, // 5 minutos (no cambia frecuentemente)
    gcTime: 1000 * 60 * 10, // 10 minutos
  })

  // Query: Versión activa
  const { data: versionActual } = useQuery({
    queryKey: ['negociacion-version-actual', negociacionId],
    queryFn: () => NegociacionesVersionesService.obtenerVersionActual(negociacionId),
    enabled: !!negociacionId,
    staleTime: 1000 * 60 * 2, // 2 minutos (puede cambiar más seguido)
    gcTime: 1000 * 60 * 5,
  })

  // Mutation: Crear nueva versión
  const crearVersionMutation = useMutation({
    mutationFn: (params: CrearVersionParams) =>
      NegociacionesVersionesService.crearNuevaVersion(params),
    onSuccess: () => {
      toast.success('Nueva versión creada exitosamente')

      // ✅ Invalidación específica y ordenada
      queryClient.invalidateQueries({ queryKey: ['negociaciones-versiones', negociacionId] })
      queryClient.invalidateQueries({ queryKey: ['negociacion-version-actual', negociacionId] })

      // Invalidar fuentes de pago relacionadas (pueden haber cambiado)
      queryClient.invalidateQueries({ queryKey: ['fuentesPago', negociacionId] })

      // Invalidar lista de negociaciones (totales pueden haber cambiado)
      queryClient.invalidateQueries({ queryKey: ['negociaciones'] })
    },
    onError: (error: Error) => {
      console.error('❌ Error al crear versión:', error)
      toast.error(error.message || 'Error al crear nueva versión')
    },
  })

  // Función helper para comparar versiones
  const compararVersiones = async (versionA: number, versionB: number) => {
    try {
      const resultado = await NegociacionesVersionesService.compararVersiones(
        negociacionId,
        versionA,
        versionB
      )
      return resultado
    } catch (error) {
      console.error('Error al comparar versiones:', error)
      toast.error('Error al comparar versiones')
      throw error
    }
  }

  return {
    // Data
    versiones: versiones || [],
    versionActual,
    totalVersiones: versiones?.length || 0,

    // Estado
    isLoading,
    error,

    // Acciones
    crearVersion: crearVersionMutation.mutate,
    creandoVersion: crearVersionMutation.isPending,
    compararVersiones,
    refetch,
  }
}

/**
 * Hook simplificado para solo obtener la versión actual
 */
export function useVersionActual(negociacionId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['negociacion-version-actual', negociacionId],
    queryFn: () => NegociacionesVersionesService.obtenerVersionActual(negociacionId),
    enabled: !!negociacionId,
  })

  return {
    versionActual: data,
    isLoading,
    error,
  }
}
