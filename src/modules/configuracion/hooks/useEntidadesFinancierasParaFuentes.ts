/**
 * Hook: useEntidadesFinancierasParaFuentes
 *
 * Hook optimizado para obtener bancos y cajas en formularios de fuentes de pago.
 * Filtra entidades por tipo de fuente de pago aplicable usando función SQL.
 */

'use client'

import { supabase } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { TipoEntidadFinanciera } from '../types/entidades-financieras.types'
import { useEntidadesFinancierasActivas } from './useEntidadesFinancieras'

interface EntidadOption {
  value: string // ID para guardar en BD
  label: string // Nombre para mostrar
  codigo: string
}

/**
 * 🔥 Obtener solo bancos activos MARCADOS para Crédito Hipotecario
 * Usa función SQL get_entidades_por_tipo_fuente() con índice GIN optimizado
 */
export function useBancos() {
  // 1. Obtener ID de "Crédito Hipotecario" desde tipos_fuentes_pago
  const { data: tipoFuente, isLoading: cargandoTipo } = useQuery({
    queryKey: ['tipo-fuente-credito-hipotecario'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_fuentes_pago')
        .select('id, nombre')
        .eq('nombre', 'Crédito Hipotecario')
        .eq('activo', true)
        .single()

      if (error) throw error
      return data
    },
    staleTime: 30 * 60 * 1000, // Cache 30 minutos (dato estable)
  })

  // 2. Obtener entidades filtradas por tipo de fuente aplicable
  const { data: entidades, isLoading: cargandoEntidades, isError } = useQuery({
    queryKey: ['entidades-bancos-credito-hipotecario', tipoFuente?.id],
    queryFn: async () => {
      if (!tipoFuente?.id) return []

      const { data, error } = await supabase
        .rpc('get_entidades_por_tipo_fuente', {
          p_tipo_fuente_id: tipoFuente.id,
          p_solo_activas: true
        })

      if (error) throw error

      // Filtrar solo Bancos
      return (data || []).filter((e: any) => e.tipo === 'Banco')
    },
    enabled: !!tipoFuente?.id,
    staleTime: 10 * 60 * 1000,
  })

  const bancos = useMemo<EntidadOption[]>(() => {
    if (!entidades) return []

    return entidades.map((entidad: any) => ({
      value: entidad.id,
      label: entidad.nombre,
      codigo: entidad.codigo,
    }))
  }, [entidades])

  return {
    bancos,
    isLoading: cargandoTipo || cargandoEntidades,
    isError
  }
}

/**
 * 🔥 Obtener solo cajas activas MARCADAS para Subsidio Caja Compensación
 * Usa función SQL get_entidades_por_tipo_fuente() con índice GIN optimizado
 */
export function useCajas() {
  // 1. Obtener ID de "Subsidio Caja Compensación" desde tipos_fuentes_pago
  const { data: tipoFuente, isLoading: cargandoTipo } = useQuery({
    queryKey: ['tipo-fuente-subsidio-caja'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_fuentes_pago')
        .select('id, nombre')
        .eq('nombre', 'Subsidio Caja Compensación')
        .eq('activo', true)
        .single()

      if (error) throw error
      return data
    },
    staleTime: 30 * 60 * 1000, // Cache 30 minutos (dato estable)
  })

  // 2. Obtener entidades filtradas por tipo de fuente aplicable
  const { data: entidades, isLoading: cargandoEntidades, isError } = useQuery({
    queryKey: ['entidades-cajas-subsidio', tipoFuente?.id],
    queryFn: async () => {
      if (!tipoFuente?.id) return []

      const { data, error } = await supabase
        .rpc('get_entidades_por_tipo_fuente', {
          p_tipo_fuente_id: tipoFuente.id,
          p_solo_activas: true
        })

      if (error) throw error

      // Filtrar solo Cajas de Compensación
      return (data || []).filter((e: any) => e.tipo === 'Caja de Compensación')
    },
    enabled: !!tipoFuente?.id,
    staleTime: 10 * 60 * 1000,
  })

  const cajas = useMemo<EntidadOption[]>(() => {
    if (!entidades) return []

    return entidades.map((entidad: any) => ({
      value: entidad.id,
      label: entidad.nombre,
      codigo: entidad.codigo,
    }))
  }, [entidades])

  return {
    cajas,
    isLoading: cargandoTipo || cargandoEntidades,
    isError
  }
}

/**
 * Obtener bancos + cajas (para formularios generales)
 */
export function useEntidadesFinancierasCombinadas() {
  const { bancos, isLoading: loadingBancos, isError: errorBancos } = useBancos()
  const { cajas, isLoading: loadingCajas, isError: errorCajas } = useCajas()

  const entidades = useMemo<EntidadOption[]>(() => {
    return [...bancos, ...cajas]
  }, [bancos, cajas])

  return {
    bancos,
    cajas,
    entidades,
    isLoading: loadingBancos || loadingCajas,
    isError: errorBancos || errorCajas,
  }
}

/**
 * Obtener entidades por tipo dinámicamente
 */
export function useEntidadesPorTipo(tipo: TipoEntidadFinanciera) {
  const { data: entidades, isLoading, isError } = useEntidadesFinancierasActivas(tipo)

  const opciones = useMemo<EntidadOption[]>(() => {
    if (!entidades) return []

    return entidades.map((entidad) => ({
      value: entidad.id,
      label: entidad.nombre,
      codigo: entidad.codigo,
    }))
  }, [entidades])

  return { opciones, isLoading, isError }
}

/**
 * Helper: Obtener nombre de entidad por ID
 */
export function useEntidadNombre(entidadId: string | null | undefined) {
  const { entidades } = useEntidadesFinancierasCombinadas()

  const nombre = useMemo(() => {
    if (!entidadId || !entidades.length) return null

    const entidad = entidades.find((e) => e.value === entidadId)
    return entidad?.label || null
  }, [entidadId, entidades])

  return nombre
}
