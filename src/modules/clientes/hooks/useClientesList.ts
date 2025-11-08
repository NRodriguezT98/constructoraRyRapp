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
    origen: [],
    busqueda: '',
  })

  // =====================================================
  // REACT QUERY
  // =====================================================

  const {
    data: clientes = [],
    isLoading,
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
      const terminoBusqueda = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(
        (cliente) =>
          cliente.nombre_completo.toLowerCase().includes(terminoBusqueda) ||
          cliente.numero_documento.toLowerCase().includes(terminoBusqueda) ||
          cliente.telefono?.toLowerCase().includes(terminoBusqueda) ||
          cliente.email?.toLowerCase().includes(terminoBusqueda)
      )
    }

    return resultado
  }, [clientes, filtros.busqueda])

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
      origen: [],
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
    clientes: clientesFiltrados,
    todosLosClientes: clientes,
    isLoading,
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

    // Acciones
    refrescar: refetch,

    // Contadores
    totalFiltrados: clientesFiltrados.length,
  }
}
