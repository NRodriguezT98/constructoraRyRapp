/**
 * Hook: useEntidadesPorTipoFuente
 *
 * Hook optimizado para obtener entidades financieras aplicables a un tipo de fuente específico.
 * Reemplaza filtrado hardcoded por tipo (Banco/Caja) con configuración flexible por entidad.
 *
 * @example
 * ```typescript
 * // En formulario de fuentes de pago
 * const tipoFuenteSeleccionado = watch('tipo_fuente_pago_id')
 * const { data: entidades, isLoading } = useEntidadesPorTipoFuente(tipoFuenteSeleccionado)
 *
 * <select disabled={isLoading}>
 *   {entidades?.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
 * </select>
 * ```
 */

'use client'

import { useMemo } from 'react'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import type { EntidadFinanciera } from '@/modules/configuracion/types/entidades-financieras.types'


// =====================================================
// QUERY KEYS
// =====================================================

export const entidadesPorTipoFuenteKeys = {
  all: ['entidades-por-tipo-fuente'] as const,
  byTipo: (tipoFuenteId: string) => [...entidadesPorTipoFuenteKeys.all, tipoFuenteId] as const,
}

// =====================================================
// TYPES
// =====================================================

export interface EntidadFinancieraOption {
  id: string
  nombre: string
  codigo: string
  tipo: string
  color: string
  orden: number
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

/**
 * Obtener entidades financieras aplicables a un tipo de fuente específico
 *
 * Filtra entidades donde `tipos_fuentes_aplicables` contenga el ID del tipo de fuente.
 * Solo retorna entidades activas.
 *
 * @param tipoFuenteId - UUID del tipo de fuente de pago
 * @param options - Opciones de React Query
 */
export function useEntidadesPorTipoFuente(
  tipoFuenteId: string | null | undefined,
  options?: Omit<UseQueryOptions<EntidadFinanciera[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: entidadesPorTipoFuenteKeys.byTipo(tipoFuenteId || ''),
    queryFn: async () => {
      if (!tipoFuenteId) return []

      // Query con filtro GIN optimizado
      const { data, error } = await supabase
        .from('entidades_financieras')
        .select('*')
        .contains('tipos_fuentes_aplicables', [tipoFuenteId]) // ✅ Usa índice GIN
        .eq('activo', true)
        .order('orden', { ascending: true })
        .order('nombre', { ascending: true })

      if (error) {
        logger.error('[useEntidadesPorTipoFuente] Error:', error)
        throw new Error(`Error al cargar entidades: ${error.message}`)
      }

      return (data || []) as EntidadFinanciera[]
    },
    enabled: !!tipoFuenteId, // Solo ejecutar si hay ID
    staleTime: 5 * 60 * 1000, // 5 minutos (datos relativamente estables)
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
    ...options,
  })
}

/**
 * Hook para obtener opciones formateadas (útil en selects)
 *
 * @example
 * ```typescript
 * const { data: opciones = [], isLoading } = useEntidadesOptions(tipoFuenteId)
 *
 * <select>
 *   {opciones.map(opt => (
 *     <option key={opt.id} value={opt.id}>{opt.nombre}</option>
 *   ))}
 * </select>
 * ```
 */
export function useEntidadesOptions(tipoFuenteId: string | null | undefined) {
  const { data: entidades, isLoading, isError, error } = useEntidadesPorTipoFuente(tipoFuenteId)

  const opciones = useMemo<EntidadFinancieraOption[]>(() => {
    if (!entidades) return []

    return entidades.map((entidad) => ({
      id: entidad.id,
      nombre: entidad.nombre,
      codigo: entidad.codigo,
      tipo: entidad.tipo,
      color: entidad.color,
      orden: entidad.orden,
    }))
  }, [entidades])

  return {
    opciones,
    isLoading,
    isError,
    error,
  }
}

/**
 * Helper: Verificar si una entidad aplica para un tipo de fuente
 *
 * @example
 * ```typescript
 * const aplica = useVerificarEntidadAplica('uuid-bancolombia', 'uuid-credito-hipotecario')
 * // true si Bancolombia tiene "Crédito Hipotecario" en tipos_fuentes_aplicables
 * ```
 */
export function useVerificarEntidadAplica(
  entidadId: string | null | undefined,
  tipoFuenteId: string | null | undefined
) {
  return useQuery({
    queryKey: ['entidad-aplica', entidadId, tipoFuenteId] as const,
    queryFn: async () => {
      if (!entidadId || !tipoFuenteId) return false

      const { data, error } = await supabase
        .from('entidades_financieras')
        .select('tipos_fuentes_aplicables')
        .eq('id', entidadId)
        .single()

      if (error || !data) return false

      return (data.tipos_fuentes_aplicables || []).includes(tipoFuenteId)
    },
    enabled: !!entidadId && !!tipoFuenteId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}
