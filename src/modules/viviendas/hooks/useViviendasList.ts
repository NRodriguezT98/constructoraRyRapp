import { useCallback, useMemo, useState } from 'react'
import type { FiltrosViviendas, Vivienda } from '../types'
import { useEliminarViviendaMutation, useViviendasQuery } from './useViviendasQuery'

/**
 * Hook para gestión del listado de viviendas
 * Refactorizado con React Query
 * Responsabilidades:
 * - Gestionar filtros y búsqueda
 * - Control del modal crear/editar
 * - Selección y eliminación
 */
export function useViviendasList() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [viviendaEditar, setViviendaEditar] = useState<Vivienda | null>(null)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [viviendaEliminar, setViviendaEliminar] = useState<string | null>(null)

  const [filtros, setFiltros] = useState<FiltrosViviendas>({
    search: '',
    proyecto_id: '',
    manzana_id: undefined,
    estado: '',
  })

  const { data: viviendas = [], isLoading: cargando, error, refetch } = useViviendasQuery(filtros)
  const eliminarMutation = useEliminarViviendaMutation()

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

  const abrirModalCrear = useCallback(() => {
    setModalAbierto(true)
    setModalEditar(false)
    setViviendaEditar(null)
  }, [])

  const abrirModalEditar = useCallback((vivienda: Vivienda) => {
    setViviendaEditar(vivienda)
    setModalEditar(true)
    setModalAbierto(false)
  }, [])

  const cerrarModal = useCallback(() => {
    setModalAbierto(false)
    setModalEditar(false)
    setViviendaEditar(null)
  }, [])

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

    modalAbierto,
    modalEditar,
    viviendaEditar,
    modalEliminar,
    viviendaEliminar,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    abrirModalEliminar,
    confirmarEliminar,
    cancelarEliminar,

    filtros,
    actualizarFiltros,
    limpiarFiltros,

    refrescar: refetch,

    estadisticas,
    totalFiltradas: viviendasFiltradas.length,
  }
}
