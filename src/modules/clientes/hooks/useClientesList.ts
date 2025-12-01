/**
 * ============================================
 * HOOK: Lista de Clientes (UI Logic)
 * ============================================
 *
 * Gestión de la lista de clientes con React Query.
 * Responsabilidades:
 * - Gestionar filtros y búsqueda
 * - Control de modales (crear, editar, eliminar)
 * - Selección de clientes
 * - Estadísticas computadas
 */

import { useCallback, useMemo, useState } from 'react'

import type { ClienteResumen, FiltrosClientes } from '../types'

import {
    useClientesQuery,
    useEliminarClienteMutation,
    useEstadisticasClientesQuery,
} from './useClientesQuery'

export function useClientesList() {
  // =====================================================
  // ESTADO LOCAL (UI)
  // =====================================================

  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [clienteEditar, setClienteEditar] = useState<ClienteResumen | null>(null)
  const [clienteEliminar, setClienteEliminar] = useState<string | null>(null)

  const [filtros, setFiltros] = useState<FiltrosClientes>({
    estado: [],
    busqueda: '',
  })

  // =====================================================
  // PAGINACIÓN (para vista cards)
  // =====================================================

  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(12)

  // =====================================================
  // REACT QUERY
  // =====================================================

  const {
    data: clientes = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useClientesQuery(filtros)

  const { data: estadisticas } = useEstadisticasClientesQuery()

  const eliminarMutation = useEliminarClienteMutation()

  // =====================================================
  // CLIENTES FILTRADOS (búsqueda local adicional)
  // =====================================================

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes]

    // Búsqueda local adicional (por si no está en filtros del servidor)
    if (filtros.busqueda) {
      const terminoBusqueda = filtros.busqueda.toLowerCase().trim()
      resultado = resultado.filter(
        (cliente) => {
          // Búsqueda en campos básicos
          const matchBasico =
            cliente.nombre_completo.toLowerCase().includes(terminoBusqueda) ||
            cliente.numero_documento.toLowerCase().includes(terminoBusqueda) ||
            cliente.telefono?.toLowerCase().includes(terminoBusqueda) ||
            cliente.email?.toLowerCase().includes(terminoBusqueda)

          // Búsqueda en vivienda (A-1, A-2, etc.)
          const matchVivienda = cliente.vivienda
            ? `${cliente.vivienda.nombre_manzana}-${cliente.vivienda.numero_vivienda}`.toLowerCase().includes(terminoBusqueda)
            : false

          // Búsqueda en interés (A-1, A-2, etc.)
          const matchInteres = cliente.interes
            ? `${cliente.interes.nombre_manzana}-${cliente.interes.numero_vivienda}`.toLowerCase().includes(terminoBusqueda)
            : false

          // Búsqueda en proyecto
          const matchProyecto =
            cliente.vivienda?.nombre_proyecto?.toLowerCase().includes(terminoBusqueda) ||
            cliente.interes?.nombre_proyecto?.toLowerCase().includes(terminoBusqueda)

          return matchBasico || matchVivienda || matchInteres || matchProyecto
        }
      )
    }

    return resultado
  }, [clientes, filtros.busqueda])

  // =====================================================
  // PAGINACIÓN DE CLIENTES (solo para vista cards)
  // =====================================================

  const clientesPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina
    const fin = inicio + itemsPorPagina
    return clientesFiltrados.slice(inicio, fin)
  }, [clientesFiltrados, paginaActual, itemsPorPagina])

  const totalPaginas = useMemo(() => {
    return Math.ceil(clientesFiltrados.length / itemsPorPagina)
  }, [clientesFiltrados.length, itemsPorPagina])

  const cambiarPagina = useCallback((nuevaPagina: number) => {
    setPaginaActual(nuevaPagina)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const cambiarItemsPorPagina = useCallback((nuevoItems: number) => {
    setItemsPorPagina(nuevoItems)
    setPaginaActual(1) // Reset a primera página
  }, [])

  // =====================================================
  // ESTADÍSTICAS COMPUTADAS
  // =====================================================

  const estadisticasComputadas = useMemo(() => {
    if (estadisticas) return estadisticas

    // Fallback: calcular desde clientes cargados
    return {
      total: clientes.length,
      interesados: clientes.filter((c) => c.estado === 'Interesado').length,
      activos: clientes.filter((c) => c.estado === 'Activo').length,
      inactivos: clientes.filter((c) => c.estado === 'Inactivo').length,
    }
  }, [clientes, estadisticas])

  // =====================================================
  // ACCIONES DE MODALES
  // =====================================================

  const abrirModalCrear = useCallback(() => {
    setModalCrear(true)
    setModalEditar(false)
    setClienteEditar(null)
  }, [])

  const abrirModalEditar = useCallback((cliente: ClienteResumen) => {
    setClienteEditar(cliente)
    setModalEditar(true)
    setModalCrear(false)
  }, [])

  const cerrarModal = useCallback(() => {
    setModalCrear(false)
    setModalEditar(false)
    setClienteEditar(null)
  }, [])

  const abrirModalEliminar = useCallback((id: string) => {
    setClienteEliminar(id)
    setModalEliminar(true)
  }, [])

  const confirmarEliminar = useCallback(async () => {
    if (!clienteEliminar) return

    try {
      await eliminarMutation.mutateAsync(clienteEliminar)
      setModalEliminar(false)
      setClienteEliminar(null)
    } catch (error) {
      // Error ya manejado por mutation
      console.error('Error eliminando cliente:', error)
    }
  }, [clienteEliminar, eliminarMutation])

  const cancelarEliminar = useCallback(() => {
    setModalEliminar(false)
    setClienteEliminar(null)
  }, [])

  // =====================================================
  // ACCIONES DE FILTROS
  // =====================================================

  const actualizarFiltros = useCallback((nuevosFiltros: Partial<FiltrosClientes>) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      estado: [],
      busqueda: '',
    })
  }, [])

  const aplicarBusqueda = useCallback((termino: string) => {
    setFiltros((prev) => ({ ...prev, busqueda: termino }))
  }, [])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Datos
    clientes: clientesPaginados, // Para vista cards (paginados)
    clientesFiltrados, // Para vista tabla (todos filtrados)
    todosLosClientes: clientes,
    isLoading,
    isFetching, // ⭐ NUEVO: indica si está recargando datos
    error: error?.message || null,
    estadisticas: estadisticasComputadas,

    // Modales
    modalCrear,
    modalEditar,
    modalEliminar,
    clienteEditar,
    clienteEliminar,
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
    aplicarBusqueda,

    // Paginación (para vista cards)
    paginaActual,
    totalPaginas,
    itemsPorPagina,
    cambiarPagina,
    cambiarItemsPorPagina,

    // Acciones
    refrescar: refetch,

    // Contadores
    totalFiltrados: clientesFiltrados.length,
  }
}
