import { useCallback, useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabase/client'
import type { FiltrosViviendas } from '../types'

import { useEliminarViviendaMutation, useViviendasQuery } from './useViviendasQuery'

/**
 * Hook para gestión del listado de viviendas
 * Refactorizado con React Query
 * Responsabilidades:
 * - Gestionar filtros y búsqueda
 * - Selección y eliminación
 * - Cargar proyectos para filtros
 */
export function useViviendasList() {
  const [modalEliminar, setModalEliminar] = useState(false)
  const [viviendaEliminar, setViviendaEliminar] = useState<string | null>(null)
  const [proyectos, setProyectos] = useState<Array<{ id: string; nombre: string }>>([])

  const [filtros, setFiltros] = useState<FiltrosViviendas>({
    search: '',
    proyecto_id: '',
    manzana_id: undefined,
    estado: '',
  })

  // ✅ React Query hooks
  const { data: viviendas = [], isLoading: cargando, error, refetch } = useViviendasQuery(filtros)
  const eliminarMutation = useEliminarViviendaMutation()

  // ✅ Cargar proyectos al montar (useEffect, NO useMemo)
  useEffect(() => {
    const cargarProyectos = async () => {
      const { data } = await supabase.from('proyectos').select('id, nombre').order('nombre')
      if (data) setProyectos(data)
    }
    cargarProyectos()
  }, [])

  const viviendasFiltradas = useMemo(() => {
    let resultado = [...viviendas]

    if (filtros.search) {
      const termino = filtros.search.toLowerCase()
      resultado = resultado.filter(
        vivienda =>
          vivienda.matricula_inmobiliaria?.toLowerCase().includes(termino) ||
          vivienda.nomenclatura?.toLowerCase().includes(termino) ||
          vivienda.numero.toLowerCase().includes(termino)
      )
    }

    if (filtros.proyecto_id) {
      resultado = resultado.filter(
        vivienda => vivienda.manzanas?.proyecto_id === filtros.proyecto_id
      )
    }

    if (filtros.manzana_id) {
      resultado = resultado.filter(
        vivienda => vivienda.manzana_id === filtros.manzana_id
      )
    }

    if (filtros.estado) {
      resultado = resultado.filter(
        vivienda => vivienda.estado === filtros.estado
      )
    }

    return resultado
  }, [viviendas, filtros])

  const abrirModalEliminar = useCallback((id: string) => {
    setViviendaEliminar(id)
    setModalEliminar(true)
  }, [])

  const confirmarEliminar = useCallback(async () => {
    if (!viviendaEliminar) return

    await eliminarMutation.mutateAsync(viviendaEliminar)
    setModalEliminar(false)
    setViviendaEliminar(null)
  }, [viviendaEliminar, eliminarMutation])

  const cancelarEliminar = useCallback(() => {
    setModalEliminar(false)
    setViviendaEliminar(null)
  }, [])

  const actualizarFiltros = useCallback((nuevosFiltros: Partial<FiltrosViviendas>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      search: '',
      proyecto_id: '',
      manzana_id: undefined,
      estado: '',
    })
  }, [])

  const estadisticas = useMemo(() => {
    const total = viviendas.length
    const disponibles = viviendas.filter(v => v.estado === 'Disponible').length
    const asignadas = viviendas.filter(v => v.estado === 'Asignada').length
    const entregadas = viviendas.filter(v => v.estado === 'Entregada').length

    const valorTotal = viviendas.reduce((sum, v) => sum + (v.valor_total || 0), 0)

    return {
      total,
      disponibles,
      asignadas,
      entregadas,
      valorTotal,
    }
  }, [viviendas])

  return {
    viviendas: viviendasFiltradas,
    todasLasViviendas: viviendas,
    cargando,
    error: error?.message || null,

    modalEliminar,
    viviendaEliminar,
    abrirModalEliminar,
    confirmarEliminar,
    cancelarEliminar,

    filtros,
    actualizarFiltros,
    limpiarFiltros,

    refrescar: refetch,

    estadisticas,
    totalFiltradas: viviendasFiltradas.length,
    proyectos, // ✅ Exportar proyectos para filtros
  }
}
