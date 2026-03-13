/**
 * Hook: React Query para Tipos de Fuentes con Configuración de Campos
 *
 * Gestiona el estado y caché de tipos de fuentes con sus campos dinámicos.
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
    actualizarConfiguracionCampos,
    cargarTipoFuenteConCampos,
    cargarTiposFuentesConCampos,
} from '../services/tipos-fuentes-campos.service'
import type { ConfiguracionCampos } from '../types/campos-dinamicos.types'

// ============================================
// QUERY KEYS
// ============================================

export const TIPOS_FUENTES_CAMPOS_KEYS = {
  all: ['tipos-fuentes-campos'] as const,
  lists: () => [...TIPOS_FUENTES_CAMPOS_KEYS.all, 'list'] as const,
  list: (filters: string) => [...TIPOS_FUENTES_CAMPOS_KEYS.lists(), { filters }] as const,
  details: () => [...TIPOS_FUENTES_CAMPOS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TIPOS_FUENTES_CAMPOS_KEYS.details(), id] as const,
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook para cargar todos los tipos de fuentes con sus campos
 */
export function useTiposFuentesConCampos() {
  return useQuery({
    queryKey: TIPOS_FUENTES_CAMPOS_KEYS.lists(),
    queryFn: cargarTiposFuentesConCampos,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para cargar un tipo específico con sus campos
 */
export function useTipoFuenteConCampos(tipoId: string, enabled = true) {
  return useQuery({
    queryKey: TIPOS_FUENTES_CAMPOS_KEYS.detail(tipoId),
    queryFn: () => cargarTipoFuenteConCampos(tipoId),
    enabled: enabled && !!tipoId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para actualizar configuración de campos
 */
export function useActualizarConfiguracionCampos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tipoId, configuracion }: {
      tipoId: string
      configuracion: ConfiguracionCampos
    }) => actualizarConfiguracionCampos(tipoId, configuracion),

    onSuccess: (data) => {
      // Invalidar caché
      queryClient.invalidateQueries({
        queryKey: TIPOS_FUENTES_CAMPOS_KEYS.all,
      })

      toast.success('Configuración guardada', {
        description: 'Los campos se han actualizado correctamente',
      })
    },

    onError: (error: Error) => {
      toast.error('Error al guardar configuración', {
        description: error.message,
      })
    },
  })
}
