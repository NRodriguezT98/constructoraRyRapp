/**
 * Hook para gestionar historial de versiones de negociaciones
 * ✅ ACTUALIZADO: Usa tabla negociaciones_historial (nuevo sistema)
 */

import { supabase } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { NegociacionesVersionesService } from '../services/negociaciones-versiones.service'

export interface SnapshotVersion {
  id: string
  version: number
  tipo_cambio: string
  razon_cambio: string
  fecha_cambio: string
  campos_modificados: string[]
  datos_anteriores?: any
  datos_nuevos?: any
  fuentes_pago_snapshot?: any[]
  usuario_id?: string
  usuario_email?: string
  usuario_nombre?: string
}

export function useHistorialVersiones(negociacionId: string) {
  // Query: Obtener historial completo desde negociaciones_historial
  const {
    data: versiones,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['negociaciones-historial-v2', negociacionId], // v2 para forzar refresh
    queryFn: async (): Promise<SnapshotVersion[]> => {

      const { data, error } = await supabase
        .from('negociaciones_historial')
        .select('*')
        .eq('negociacion_id', negociacionId)
        .order('version', { ascending: false })

      if (error) {
        console.error('❌ [useHistorialVersiones] Error:', error)
        throw error
      }

      return (data || []) as SnapshotVersion[]
    },
    enabled: !!negociacionId,
    staleTime: 0, // Sin caché para debugging
    gcTime: 0, // Sin caché para debugging
  })

  // Query: Versión actual de la negociación
  const { data: versionActual } = useQuery({
    queryKey: ['negociacion-info', negociacionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('negociaciones')
        .select('version_actual, version_lock')
        .eq('id', negociacionId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!negociacionId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })

  return {
    // Data
    versiones: versiones || [],
    versionActual: versionActual?.version_actual,
    versionLock: versionActual?.version_lock,
    totalVersiones: versiones?.length || 0,

    // Estado
    isLoading,
    error,

    // Acciones
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
