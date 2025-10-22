import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { viviendasService } from '../services/viviendas.service'
import type { FiltrosViviendas, Vivienda } from '../types'

/**
 * Hook para gestión del listado de viviendas
 * Responsabilidades:
 * - Cargar y actualizar lista de viviendas
 * - Gestionar filtros y búsqueda
 * - Control del modal crear/editar
 * - Paginación (futura)
 * - Selección y eliminación
 */
export function useViviendasList() {
  // ============================================
  // ESTADO
  // ============================================
  const [viviendas, setViviendas] = useState<Vivienda[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [viviendaEditar, setViviendaEditar] = useState<Vivienda | null>(null)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [viviendaEliminar, setViviendaEliminar] = useState<string | null>(null)

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosViviendas>({
    busqueda: '',
    proyectoId: undefined,
    manzanaId: undefined,
    estado: undefined,
  })

  // ============================================
  // CARGAR VIVIENDAS
  // ============================================
  const cargarViviendas = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await viviendasService.listar(filtros)
      setViviendas(data)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar viviendas'
      setError(mensaje)
      toast.error(mensaje)
    } finally {
      setCargando(false)
    }
  }, [filtros])

  // Cargar al montar y cuando cambien filtros
  useEffect(() => {
    cargarViviendas()
  }, [cargarViviendas])

  // ============================================
  // VIVIENDAS FILTRADAS (MEMOIZADAS)
  // ============================================
  const viviendasFiltradas = useMemo(() => {
    let resultado = [...viviendas]

    // Filtro por búsqueda (matrícula, nomenclatura, número)
    if (filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(
        vivienda =>
          vivienda.matricula_inmobiliaria?.toLowerCase().includes(termino) ||
          vivienda.nomenclatura?.toLowerCase().includes(termino) ||
          vivienda.numero.toLowerCase().includes(termino)
      )
    }

    // Filtro por proyecto
    if (filtros.proyectoId) {
      resultado = resultado.filter(
        vivienda => vivienda.manzanas?.proyecto_id === filtros.proyectoId
      )
    }

    // Filtro por manzana
    if (filtros.manzanaId) {
      resultado = resultado.filter(
        vivienda => vivienda.manzana_id === filtros.manzanaId
      )
    }

    // Filtro por estado
    if (filtros.estado) {
      resultado = resultado.filter(
        vivienda => vivienda.estado === filtros.estado
      )
    }

    return resultado
  }, [viviendas, filtros])

  // ============================================
  // CONTROL DE MODAL
  // ============================================
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

  // ============================================
  // ELIMINAR VIVIENDA
  // ============================================
  const abrirModalEliminar = useCallback((id: string) => {
    setViviendaEliminar(id)
    setModalEliminar(true)
  }, [])

  const confirmarEliminar = useCallback(async () => {
    if (!viviendaEliminar) return

    try {
      await viviendasService.eliminar(viviendaEliminar)
      toast.success('Vivienda eliminada correctamente')
      setModalEliminar(false)
      setViviendaEliminar(null)
      cargarViviendas()
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al eliminar vivienda'
      toast.error(mensaje)
    }
  }, [viviendaEliminar, cargarViviendas])

  const cancelarEliminar = useCallback(() => {
    setModalEliminar(false)
    setViviendaEliminar(null)
  }, [])

  // ============================================
  // ACTUALIZAR FILTROS
  // ============================================
  const actualizarFiltros = useCallback((nuevosFiltros: Partial<FiltrosViviendas>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      busqueda: '',
      proyectoId: undefined,
      manzanaId: undefined,
      estado: undefined,
    })
  }, [])

  // ============================================
  // ESTADÍSTICAS
  // ============================================
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

  // ============================================
  // RETURN
  // ============================================
  return {
    // Estado
    viviendas: viviendasFiltradas,
    todasLasViviendas: viviendas,
    cargando,
    error,

    // Modal
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

    // Filtros
    filtros,
    actualizarFiltros,
    limpiarFiltros,

    // Acciones
    refrescar: cargarViviendas,

    // Estadísticas
    estadisticas,
    totalFiltradas: viviendasFiltradas.length,
  }
}
