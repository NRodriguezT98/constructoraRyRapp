/**
 * ============================================
 * HOOK: useRequisitos (React Query + Lógica)
 * ============================================
 *
 * RESPONSABILIDADES:
 * - Gestionar estado con React Query
 * - Proveer datos y funciones al componente
 * - Integrar con service para llamadas API
 */

'use client'

import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import { requisitosService } from '../services/requisitos.service'
import type { ActualizarRequisitoDTO, CrearRequisitoDTO } from '../types'

export function useRequisitos(tipoFuenteSeleccionado: string) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])

  // Query: Obtener requisitos por tipo
  const {
    data: requisitos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['requisitos-fuentes', tipoFuenteSeleccionado],
    queryFn: () => requisitosService.obtenerRequisitosPorTipo(supabase, tipoFuenteSeleccionado),
    enabled: !!tipoFuenteSeleccionado,
  })

  // Mutation: Crear requisito (ahora con soporte para múltiples fuentes)
  const crearMutation = useMutation({
    mutationFn: async (datos: CrearRequisitoDTO) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // ✅ Si tipo_fuente es array, crear uno para cada fuente
      const fuentesArray = Array.isArray(datos.tipo_fuente) ? datos.tipo_fuente : [datos.tipo_fuente]

      // Crear requisitos en paralelo para todas las fuentes seleccionadas
      const promesas = fuentesArray.map(fuente =>
        requisitosService.crearRequisito(
          supabase,
          { ...datos, tipo_fuente: fuente },
          user.id
        )
      )

      return Promise.all(promesas)
    },
    onSuccess: (resultados) => {
      queryClient.invalidateQueries({ queryKey: ['requisitos-fuentes'] })
      const plural = resultados.length > 1
      toast.success(`${resultados.length} requisito${plural ? 's' : ''} creado${plural ? 's' : ''} exitosamente`)
    },
    onError: (error: Error) => {
      logger.error('Error al crear requisito:', error)
      toast.error('Error al crear requisito')
    },
  })

  // Mutation: Actualizar requisito
  const actualizarMutation = useMutation({
    mutationFn: async ({ id, datos }: { id: string; datos: ActualizarRequisitoDTO }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')
      return requisitosService.actualizarRequisito(supabase, id, datos, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitos-fuentes'] })
      toast.success('Requisito actualizado')
    },
    onError: (error: Error) => {
      logger.error('Error al actualizar requisito:', error)
      toast.error('Error al actualizar requisito')
    },
  })

  // Mutation: Desactivar requisito
  const desactivarMutation = useMutation({
    mutationFn: (id: string) => requisitosService.desactivarRequisito(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitos-fuentes'] })
      toast.success('Requisito eliminado')
    },
    onError: (error: Error) => {
      logger.error('Error al eliminar requisito:', error)
      toast.error('Error al eliminar requisito')
    },
  })

  // Mutation: Reordenar requisitos
  const reordenarMutation = useMutation({
    mutationFn: (requisitosOrdenados: { id: string; orden: number }[]) =>
      requisitosService.reordenarRequisitos(supabase, tipoFuenteSeleccionado, requisitosOrdenados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitos-fuentes'] })
      toast.success('Orden actualizado')
    },
    onError: (error: Error) => {
      logger.error('Error al reordenar:', error)
      toast.error('Error al reordenar requisitos')
    },
  })

  return {
    // Data
    requisitos,
    isLoading,
    error,

    // Mutations
    crearRequisito: crearMutation.mutate,
    actualizarRequisito: actualizarMutation.mutate,
    desactivarRequisito: desactivarMutation.mutate,
    reordenarRequisitos: reordenarMutation.mutate,

    // Loading states
    isCreating: crearMutation.isPending,
    isUpdating: actualizarMutation.isPending,
    isDeleting: desactivarMutation.isPending,
    isReordering: reordenarMutation.isPending,
  }
}

/**
 * ============================================
 * HOOK: useRequisitosCompartidos (React Query)
 * ============================================
 *
 * Hook para requisitos con alcance COMPARTIDO_CLIENTE.
 * Estos requisitos aplican a todos los clientes con fuentes activas
 * y se solicitan UNA sola vez (no por fuente individual).
 */
export function useRequisitosCompartidos() {
  const supabase = useMemo(() => createClient(), [])
  const queryClient = useQueryClient()

  const {
    data: requisitos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['requisitos-compartidos'],
    queryFn: () => requisitosService.obtenerRequisitosCompartidos(supabase),
  })

  const crearMutation = useMutation({
    mutationFn: async (datos: CrearRequisitoDTO) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // ✅ COMPARTIDO_CLIENTE → siempre UNA sola fila con tipo_fuente = 'COMPARTIDO'
      // fuentes_aplicables guarda cuáles fuentes aplican (null = todas)
      const fuentesSeleccionadas = Array.isArray(datos.tipo_fuente) ? datos.tipo_fuente : [datos.tipo_fuente]
      const todasLasFuentes = fuentesSeleccionadas.length === 0
      const fuentes_aplicables = todasLasFuentes ? null : fuentesSeleccionadas

      const datosSanitizados = {
        ...datos,
        tipo_fuente: 'COMPARTIDO',
        alcance: 'COMPARTIDO_CLIENTE' as const,
        fuentes_aplicables,
      }
      const resultado = await requisitosService.crearRequisito(supabase, datosSanitizados, user.id)
      return [resultado]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitos-compartidos'] })
      queryClient.invalidateQueries({ queryKey: ['requisitos-fuentes'] })
      toast.success('Requisito compartido creado exitosamente')
    },
    onError: () => toast.error('Error al crear requisito compartido'),
  })

  const actualizarMutation = useMutation({
    mutationFn: async ({ id, datos }: { id: string; datos: ActualizarRequisitoDTO }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')
      return requisitosService.actualizarRequisito(supabase, id, datos, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitos-compartidos'] })
      toast.success('Requisito compartido actualizado')
    },
    onError: () => toast.error('Error al actualizar requisito compartido'),
  })

  const desactivarMutation = useMutation({
    mutationFn: (id: string) => requisitosService.desactivarRequisito(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitos-compartidos'] })
      queryClient.invalidateQueries({ queryKey: ['requisitos-fuentes'] })
      toast.success('Requisito compartido eliminado')
    },
    onError: () => toast.error('Error al eliminar requisito compartido'),
  })

  const reordenarMutation = useMutation({
    mutationFn: (requisitosOrdenados: { id: string; orden: number }[]) =>
      requisitosService.reordenarRequisitos(supabase, 'compartido', requisitosOrdenados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitos-compartidos'] })
      toast.success('Orden actualizado')
    },
    onError: () => toast.error('Error al reordenar'),
  })

  return {
    requisitos,
    isLoading,
    error,
    crearRequisito: crearMutation.mutate,
    actualizarRequisito: actualizarMutation.mutate,
    desactivarRequisito: desactivarMutation.mutate,
    reordenarRequisitos: reordenarMutation.mutate,
    isCreating: crearMutation.isPending,
    isUpdating: actualizarMutation.isPending,
    isDeleting: desactivarMutation.isPending,
  }
}

/**
 * ============================================
 * HOOK: useTiposFuente (React Query)
 * ============================================
 *
 * Hook para obtener tipos de fuente dinámicos desde BD
 */
export function useTiposFuente() {
  const supabase = useMemo(() => createClient(), [])

  const {
    data: tiposFuente = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tipos-fuente'],
    queryFn: () => requisitosService.obtenerTiposFuente(supabase),
    staleTime: 5 * 60 * 1000, // 5 minutos (tipos no cambian frecuentemente)
  })

  return {
    tiposFuente,
    isLoading,
    error,
  }
}
