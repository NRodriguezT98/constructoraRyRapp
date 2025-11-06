/**
 * Hook principal para la gestión de clientes
 * Contiene toda la lógica de negocio del módulo
 */

import { useCallback, useEffect, useMemo } from 'react'
import { clientesService } from '../services/clientes.service'
import { useClientesStore } from '../store/clientes.store'
import type { ActualizarClienteDTO, CrearClienteDTO, FiltrosClientes } from '../types'

export function useClientes() {
  const {
    clientes,
    clienteSeleccionado,
    isLoading,
    error,
    filtros,
    busqueda,
    datosInicializados,
    setClientes,
    setClienteSeleccionado,
    setIsLoading,
    setError,
    setFiltros,
    setBusqueda,
    setDatosInicializados,
    agregarCliente,
    actualizarCliente: actualizarClienteStore,
    eliminarCliente: eliminarClienteStore,
  } = useClientesStore()

  // =====================================================
  // CARGAR CLIENTES
  // =====================================================

  const cargarClientes = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const clientesCargados = await clientesService.obtenerClientes(filtros)
      setClientes(clientesCargados)
      setDatosInicializados(true) // Marcar datos como inicializados
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar clientes'
      setError(mensaje)
      console.error('Error cargando clientes:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filtros, setClientes, setIsLoading, setError, setDatosInicializados])

  // =====================================================
  // CARGAR CLIENTE POR ID
  // =====================================================

  const cargarCliente = useCallback(
    async (id: string) => {
      // NO usar setIsLoading aquí - es para la lista completa
      // Esta función se usa en background para cargar detalles
      setError(null)

      try {
        const cliente = await clientesService.obtenerCliente(id)
        setClienteSeleccionado(cliente)
        return cliente
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al cargar cliente'
        setError(mensaje)
        console.error('Error cargando cliente:', err)
        return null
      }
    },
    [setClienteSeleccionado, setError]
  )

  // =====================================================
  // CREAR CLIENTE
  // =====================================================

  const crearCliente = useCallback(
    async (datos: CrearClienteDTO) => {
      setIsLoading(true)
      setError(null)

      try {
        const nuevoCliente = await clientesService.crearCliente(datos)
        agregarCliente({
          ...nuevoCliente,
          estadisticas: {
            total_negociaciones: 0,
            negociaciones_activas: 0,
            negociaciones_completadas: 0,
          },
        })
        return nuevoCliente
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al crear cliente'
        setError(mensaje)
        console.error('Error creando cliente:', err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [agregarCliente, setIsLoading, setError]
  )

  // =====================================================
  // ACTUALIZAR CLIENTE
  // =====================================================

  const actualizarCliente = useCallback(
    async (id: string, datos: ActualizarClienteDTO) => {
      setIsLoading(true)
      setError(null)

      try {
        const clienteActualizado = await clientesService.actualizarCliente(id, datos)
        actualizarClienteStore(id, clienteActualizado)

        // Si es el cliente seleccionado, actualizarlo también
        if (clienteSeleccionado?.id === id) {
          setClienteSeleccionado({ ...clienteSeleccionado, ...clienteActualizado })
        }

        return clienteActualizado
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al actualizar cliente'
        setError(mensaje)
        console.error('Error actualizando cliente:', err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [
      actualizarClienteStore,
      clienteSeleccionado,
      setClienteSeleccionado,
      setIsLoading,
      setError,
    ]
  )

  // =====================================================
  // ELIMINAR CLIENTE
  // =====================================================

  const eliminarCliente = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        await clientesService.eliminarCliente(id)
        eliminarClienteStore(id)
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al eliminar cliente'
        setError(mensaje)
        console.error('Error eliminando cliente:', err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [eliminarClienteStore, setIsLoading, setError]
  )

  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  const cambiarEstado = useCallback(
    async (id: string, nuevoEstado: 'Interesado' | 'Activo' | 'Inactivo') => {
      return actualizarCliente(id, { estado: nuevoEstado })
    },
    [actualizarCliente]
  )

  // =====================================================
  // SUBIR DOCUMENTO
  // =====================================================

  const subirDocumentoIdentidad = useCallback(
    async (clienteId: string, archivo: File) => {
      setIsLoading(true)
      setError(null)

      try {
        const url = await clientesService.subirDocumentoIdentidad(clienteId, archivo)
        actualizarClienteStore(clienteId, { documento_identidad_url: url })
        return url
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al subir documento'
        setError(mensaje)
        console.error('Error subiendo documento:', err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [actualizarClienteStore, setIsLoading, setError]
  )

  // =====================================================
  // FILTROS Y BÚSQUEDA
  // =====================================================

  const aplicarFiltros = useCallback(
    (nuevosFiltros: FiltrosClientes) => {
      setFiltros(nuevosFiltros)
    },
    [setFiltros]
  )

  const aplicarBusqueda = useCallback(
    (termino: string) => {
      setBusqueda(termino)
      setFiltros({ ...filtros, busqueda: termino })
    },
    [filtros, setBusqueda, setFiltros]
  )

  // =====================================================
  // CLIENTES FILTRADOS (computado)
  // =====================================================

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes]

    // Búsqueda local adicional (por si no está en filtros del servidor)
    if (busqueda) {
      const terminoBusqueda = busqueda.toLowerCase()
      resultado = resultado.filter(
        (cliente) =>
          cliente.nombre_completo.toLowerCase().includes(terminoBusqueda) ||
          cliente.numero_documento.toLowerCase().includes(terminoBusqueda) ||
          cliente.telefono?.toLowerCase().includes(terminoBusqueda) ||
          cliente.email?.toLowerCase().includes(terminoBusqueda)
      )
    }

    return resultado
  }, [clientes, busqueda])

  // =====================================================
  // ESTADÍSTICAS (computado)
  // =====================================================

  const estadisticas = useMemo(() => {
    return {
      total: clientes.length,
      interesados: clientes.filter((c) => c.estado === 'Interesado').length,
      activos: clientes.filter((c) => c.estado === 'Activo').length,
      inactivos: clientes.filter((c) => c.estado === 'Inactivo').length,
    }
  }, [clientes])

  // =====================================================
  // CARGAR DATOS AL MONTAR (solo si no están inicializados)
  // =====================================================

  useEffect(() => {
    let cancelado = false

    if (!datosInicializados) {
      console.log('👥 [CLIENTES HOOK] Cargando datos iniciales...')
      cargarClientes().catch(error => {
        if (!cancelado) {
          console.error('👥 [CLIENTES HOOK] Error en carga inicial:', error)
        }
      })
    }

    return () => {
      cancelado = true
    }
  }, [datosInicializados, cargarClientes])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    clientes: clientesFiltrados,
    clienteSeleccionado,
    isLoading,
    error,
    estadisticas,

    // Filtros
    filtros,
    busqueda,

    // Acciones
    cargarClientes,
    cargarCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    cambiarEstado,
    subirDocumentoIdentidad,
    aplicarFiltros,
    aplicarBusqueda,
  }
}
