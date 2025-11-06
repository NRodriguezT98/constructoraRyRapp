/**
 * ============================================
 * USE PROYECTOS QUERY (REACT QUERY)
 * ============================================
 *
 * Hook principal para proyectos usando React Query
 * Reemplaza Zustand store con cache inteligente
 *
 * BENEFICIOS vs Zustand:
 * - ✅ Cache automático (stale-while-revalidate)
 * - ✅ Sin race conditions (una sola fuente de verdad)
 * - ✅ Invalidación automática después de mutations
 * - ✅ Background refetching inteligente
 * - ✅ Optimistic updates built-in
 * - ✅ Sin conflictos con localStorage
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { proyectosService } from '../services/proyectos.service'
import type { FiltroProyecto, ProyectoFormData } from '../types'

// ============================================
// QUERY KEYS (Constantes para cache)
// ============================================
export const proyectosKeys = {
  all: ['proyectos'] as const,
  lists: () => [...proyectosKeys.all, 'list'] as const,
  list: (filtros?: FiltroProyecto) => [...proyectosKeys.lists(), { filtros }] as const,
  details: () => [...proyectosKeys.all, 'detail'] as const,
  detail: (id: string) => [...proyectosKeys.details(), id] as const,
}

// ============================================
// 1. HOOK PRINCIPAL: useProyectosQuery
// ============================================
export function useProyectosQuery() {
  const queryClient = useQueryClient()

  // ✅ QUERY: Obtener todos los proyectos
  const {
    data: proyectos = [],
    isLoading: cargando,
    error,
    refetch: refrescar,
  } = useQuery({
    queryKey: proyectosKeys.lists(),
    queryFn: () => proyectosService.obtenerProyectos(),
    staleTime: 5 * 60 * 1000, // 5 minutos - datos frescos
    gcTime: 10 * 60 * 1000, // 10 minutos - retención en cache
  })

  // ✅ MUTATION: Crear proyecto
  const crearProyectoMutation = useMutation({
    mutationFn: (data: ProyectoFormData) => proyectosService.crearProyecto(data),
    onSuccess: (nuevoProyecto) => {
      queryClient.invalidateQueries({ queryKey: proyectosKeys.lists() })
      toast.success('Proyecto creado correctamente', {
        description: `${nuevoProyecto.nombre} ha sido creado exitosamente`,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear proyecto', {
        description: error.message,
      })
    },
  })

  // ✅ MUTATION: Actualizar proyecto
  const actualizarProyectoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProyectoFormData> }) => {
      return proyectosService.actualizarProyecto(id, data)
    },
    onSuccess: (proyectoActualizado) => {
      // Invalidar cache de lista Y detalle
      queryClient.invalidateQueries({ queryKey: proyectosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: proyectosKeys.detail(proyectoActualizado.id) })

      toast.success('Proyecto actualizado', {
        description: `${proyectoActualizado.nombre} ha sido actualizado`,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar proyecto', {
        description: error.message,
      })
    },
  })

  // ✅ MUTATION: Eliminar proyecto
  const eliminarProyectoMutation = useMutation({
    mutationFn: (id: string) => proyectosService.eliminarProyecto(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: proyectosKeys.lists() })
      queryClient.removeQueries({ queryKey: proyectosKeys.detail(id) })
      toast.success('Proyecto eliminado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar proyecto', {
        description: error.message,
      })
    },
  })

  return {
    proyectos,
    cargando,
    error: error as Error | null,
    crearProyecto: crearProyectoMutation.mutateAsync,
    actualizarProyecto: (id: string, data: Partial<ProyectoFormData>) => {
      return actualizarProyectoMutation.mutateAsync({ id, data })
    },
    eliminarProyecto: eliminarProyectoMutation.mutateAsync,
    refrescar,
    // Estados de mutations
    creando: crearProyectoMutation.isPending,
    actualizando: actualizarProyectoMutation.isPending,
    eliminando: eliminarProyectoMutation.isPending,
  }
}

// ============================================
// 2. HOOK: useProyectoQuery (detalle individual)
// ============================================
export function useProyectoQuery(id?: string) {
  const {
    data: proyecto,
    isLoading: cargando,
    error,
  } = useQuery({
    queryKey: proyectosKeys.detail(id!),
    queryFn: () => proyectosService.obtenerProyecto(id!),
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 3 * 60 * 1000, // 3 minutos para detalles
    retry: 2, // Reintentar 2 veces si falla
    retryDelay: 1000, // Esperar 1s entre reintentos
  })

  return {
    proyecto,
    cargando,
    error: error as Error | null,
  }
}

// ============================================
// 3. HOOK: useProyectosFiltrados
// ============================================
export function useProyectosFiltrados() {
  const [filtros, setFiltrosState] = useState<FiltroProyecto>({
    busqueda: '',
    estado: undefined,
    fechaDesde: undefined,
    fechaHasta: undefined,
  })

  const { proyectos, cargando } = useProyectosQuery()

  // Filtrado local (muy rápido, no requiere query nueva)
  const proyectosFiltrados = useMemo(() => {
    let resultado = [...proyectos]

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(
        proyecto =>
          proyecto.nombre.toLowerCase().includes(termino) ||
          proyecto.ubicacion.toLowerCase().includes(termino) ||
          proyecto.descripcion.toLowerCase().includes(termino) ||
          proyecto.responsable.toLowerCase().includes(termino)
      )
    }

    // Filtro por estado (con compatibilidad para estados antiguos)
    if (filtros.estado) {
      if (filtros.estado === 'en_proceso') {
        resultado = resultado.filter(
          proyecto =>
            proyecto.estado === 'en_proceso' ||
            proyecto.estado === 'en_planificacion' ||
            proyecto.estado === 'en_construccion' ||
            proyecto.estado === 'pausado'
        )
      } else if (filtros.estado === 'completado') {
        resultado = resultado.filter(proyecto => proyecto.estado === 'completado')
      } else {
        resultado = resultado.filter(proyecto => proyecto.estado === filtros.estado)
      }
    }

    // Filtro por fechas
    if (filtros.fechaDesde) {
      resultado = resultado.filter(
        proyecto => new Date(proyecto.fechaInicio) >= new Date(filtros.fechaDesde!)
      )
    }

    if (filtros.fechaHasta) {
      resultado = resultado.filter(
        proyecto => new Date(proyecto.fechaInicio) <= new Date(filtros.fechaHasta!)
      )
    }

    return resultado
  }, [proyectos, filtros])

  const actualizarFiltros = (nuevosFiltros: Partial<FiltroProyecto>) => {
    setFiltrosState(prev => ({ ...prev, ...nuevosFiltros }))
  }

  const limpiarFiltros = () => {
    setFiltrosState({
      busqueda: '',
      estado: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined,
    })
  }

  return {
    proyectos: proyectosFiltrados,
    filtros,
    cargando,
    actualizarFiltros,
    limpiarFiltros,
    totalProyectos: proyectos.length,
    proyectosFiltrados: proyectosFiltrados.length,
  }
}

// ============================================
// 4. HOOK: useVistaProyectos (UI state - NO usar React Query)
// ============================================
export function useVistaProyectos() {
  const [vista, setVista] = useState<'grid' | 'lista'>('grid')

  const cambiarVista = () => {
    setVista(prev => (prev === 'grid' ? 'lista' : 'grid'))
  }

  return {
    vista,
    esGrid: vista === 'grid',
    esLista: vista === 'lista',
    setVista,
    cambiarVista,
  }
}

// ============================================
// 5. HOOK: useEstadisticasProyectos
// ============================================
export function useEstadisticasProyectos() {
  const { proyectos } = useProyectosQuery()

  const estadisticas = useMemo(() => {
    const total = proyectos.length

    const enProceso = proyectos.filter(
      p =>
        p.estado === 'en_proceso' ||
        p.estado === 'en_planificacion' ||
        p.estado === 'en_construccion' ||
        p.estado === 'pausado'
    ).length

    const completados = proyectos.filter(p => p.estado === 'completado').length

    const presupuestoTotal = proyectos.reduce((sum, p) => sum + p.presupuesto, 0)

    const progresoPromedio =
      proyectos.length > 0
        ? proyectos.reduce((sum, p) => sum + (p.progreso || 0), 0) / proyectos.length
        : 0

    return {
      total,
      enProceso,
      completados,
      presupuestoTotal,
      progresoPromedio: Math.round(progresoPromedio),
    }
  }, [proyectos])

  return estadisticas
}
