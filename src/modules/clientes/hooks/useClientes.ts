/**
 * ============================================
 * HOOK: useClientes (REFACTORIZADO CON REACT QUERY)
 * ============================================
 *
 * Hook principal para la gestión de clientes.
 * Migrado desde Zustand store a React Query.
 *
 * DEPRECATION WARNING:
 * Este hook mantiene compatibilidad con código legacy.
 * Para nuevos componentes, usar directamente:
 * - useClientesList() - Para listas
 * - useClienteQuery(id) - Para detalles
 * - useCrearClienteMutation() - Para crear
 * - etc.
 */

import { useCallback, useState } from 'react'

import type { ActualizarClienteDTO, CrearClienteDTO, FiltrosClientes } from '../types'

import {
    useActualizarClienteMutation,
    useCambiarEstadoClienteMutation,
    useClienteQuery,
    useClientesQuery,
    useCrearClienteMutation,
    useEliminarClienteMutation,
    useSubirDocumentoIdentidadMutation,
} from './useClientesQuery'

export function useClientes(filtros?: FiltrosClientes) {
  // =====================================================
  // ESTADO LOCAL
  // =====================================================

  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string | null>(null)

  // =====================================================
  // REACT QUERY HOOKS
  // =====================================================

  const {
    data: clientes = [],
    isLoading,
    error,
    refetch: cargarClientes,
  } = useClientesQuery(filtros)

  const { data: clienteSeleccionado } = useClienteQuery(clienteSeleccionadoId)

  const crearMutation = useCrearClienteMutation()
  const actualizarMutation = useActualizarClienteMutation()
  const eliminarMutation = useEliminarClienteMutation()
  const cambiarEstadoMutation = useCambiarEstadoClienteMutation()
  const subirDocumentoMutation = useSubirDocumentoIdentidadMutation()

  // =====================================================
  // ACCIONES (Wrappers para mantener compatibilidad)
  // =====================================================

  /**
   * Cargar cliente por ID
   */
  const cargarCliente = useCallback(
    async (id: string) => {
      setClienteSeleccionadoId(id)
      // React Query se encarga de cargar automáticamente
      return clienteSeleccionado
    },
    [clienteSeleccionado]
  )

  /**
   * Crear cliente
   */
  const crearCliente = useCallback(
    async (datos: CrearClienteDTO) => {
      return crearMutation.mutateAsync(datos)
    },
    [crearMutation]
  )

  /**
   * Actualizar cliente
   */
  const actualizarCliente = useCallback(
    async (id: string, datos: ActualizarClienteDTO) => {
      return actualizarMutation.mutateAsync({ id, datos })
    },
    [actualizarMutation]
  )

  /**
   * Eliminar cliente
   */
  const eliminarCliente = useCallback(
    async (id: string) => {
      await eliminarMutation.mutateAsync(id)
    },
    [eliminarMutation]
  )

  /**
   * Cambiar estado
   */
  const cambiarEstado = useCallback(
    async (id: string, estado: 'Interesado' | 'Activo' | 'Inactivo') => {
      return cambiarEstadoMutation.mutateAsync({ id, estado })
    },
    [cambiarEstadoMutation]
  )

  /**
   * Subir documento de identidad
   */
  const subirDocumentoIdentidad = useCallback(
    async (clienteId: string, archivo: File) => {
      return subirDocumentoMutation.mutateAsync({ clienteId, archivo })
    },
    [subirDocumentoMutation]
  )

  // =====================================================
  // ESTADÍSTICAS COMPUTADAS
  // =====================================================

  const estadisticas = {
    total: clientes.length,
    interesados: clientes.filter((c) => c.estado === 'Interesado').length,
    activos: clientes.filter((c) => c.estado === 'Activo').length,
    inactivos: clientes.filter((c) => c.estado === 'Inactivo').length,
  }

  // =====================================================
  // RETURN (Compatibilidad con código legacy)
  // =====================================================

  return {
    // Estado
    clientes,
    clienteSeleccionado: clienteSeleccionado || null,
    isLoading:
      isLoading ||
      crearMutation.isPending ||
      actualizarMutation.isPending ||
      eliminarMutation.isPending,
    error: error?.message || null,
    estadisticas,

    // Acciones
    cargarClientes,
    cargarCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    cambiarEstado,
    subirDocumentoIdentidad,

    // Filtros (legacy - deprecado)
    filtros: filtros || {},
    busqueda: filtros?.busqueda || '',
    aplicarFiltros: () => {
      console.warn('useClientes.aplicarFiltros() está deprecado. Usar useClientesList()')
    },
    aplicarBusqueda: () => {
      console.warn('useClientes.aplicarBusqueda() está deprecado. Usar useClientesList()')
    },
  }
}
