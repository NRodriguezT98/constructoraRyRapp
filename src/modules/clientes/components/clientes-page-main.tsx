/**
 * Componente principal del módulo de Clientes
 * Orquesta la lógica con el hook y presenta los componentes
 */

'use client'

import { ModalConfirmacion } from '@/shared'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import {
    ClientesHeader,
    EstadisticasClientes,
    FiltrosClientes,
    FormularioClienteContainer,
    ListaClientes,
} from '../components'
import { useClientes } from '../hooks'
import { useClientesStore } from '../store/clientes.store'
import type { ClienteResumen, EstadoCliente, OrigenCliente } from '../types'

export function ClientesPageMain() {
  const router = useRouter()
  const {
    clientes,
    isLoading,
    estadisticas,
    cargarCliente,
    eliminarCliente,
  } = useClientes()

  const {
    clienteSeleccionado,
    abrirModalFormulario,
    setClienteSeleccionado,
  } = useClientesStore()

  // Estado para modal de confirmación de eliminación
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
  const [clienteAEliminar, setClienteAEliminar] = useState<ClienteResumen | null>(null)

  // Estados para filtros locales
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCliente | 'Todos'>('Todos')
  const [origenFiltro, setOrigenFiltro] = useState<OrigenCliente | 'Todos'>('Todos')

  // Filtrar clientes localmente
  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes]

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase().trim()
      resultado = resultado.filter(
        (cliente) =>
          cliente.nombre_completo.toLowerCase().includes(termino) ||
          cliente.numero_documento.toLowerCase().includes(termino) ||
          cliente.telefono?.toLowerCase().includes(termino) ||
          cliente.email?.toLowerCase().includes(termino)
      )
    }

    // Filtro por estado
    if (estadoFiltro !== 'Todos') {
      resultado = resultado.filter((cliente) => cliente.estado === estadoFiltro)
    }

    // Filtro por origen
    if (origenFiltro !== 'Todos') {
      resultado = resultado.filter((cliente) => cliente.origen === origenFiltro)
    }

    return resultado
  }, [clientes, busqueda, estadoFiltro, origenFiltro])

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleNuevoCliente = useCallback(() => {
    setClienteSeleccionado(null)
    abrirModalFormulario()
  }, [setClienteSeleccionado, abrirModalFormulario])

  const handleVerCliente = useCallback(
    (cliente: ClienteResumen) => {
      // Navegar a la página de detalle en lugar de abrir modal
      router.push(`/clientes/${cliente.id}`)
    },
    [router]
  )

  const handleEditarCliente = useCallback(
    async (cliente: ClienteResumen) => {
      // Abrir modal inmediatamente con datos básicos
      setClienteSeleccionado(cliente as any)
      abrirModalFormulario()

      // Cargar datos completos en background
      const clienteCompleto = await cargarCliente(cliente.id)
      if (clienteCompleto) {
        setClienteSeleccionado(clienteCompleto as any)
      }
    },
    [cargarCliente, setClienteSeleccionado, abrirModalFormulario]
  )

  const handleEliminarCliente = useCallback(
    async (cliente: ClienteResumen) => {
      setClienteAEliminar(cliente)
      setModalEliminarAbierto(true)
    },
    []
  )

  const confirmarEliminacion = useCallback(async () => {
    if (!clienteAEliminar) return

    try {
      await eliminarCliente(clienteAEliminar.id)
      setModalEliminarAbierto(false)
      setClienteAEliminar(null)
    } catch (error) {
      // Mostrar error al usuario
      const mensaje = error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar cliente'

      alert(`❌ Error al eliminar:\n\n${mensaje}`)

      console.error('Error eliminando cliente:', error)
    }
  }, [clienteAEliminar, eliminarCliente])

  const cancelarEliminacion = useCallback(() => {
    setModalEliminarAbierto(false)
    setClienteAEliminar(null)
  }, [])

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Hero + FAB */}
        <ClientesHeader
          onNuevoCliente={handleNuevoCliente}
          totalClientes={estadisticas.total}
        />

        {/* Estadísticas Premium */}
        <EstadisticasClientes
          total={estadisticas.total}
          interesados={estadisticas.interesados}
          activos={estadisticas.activos}
          inactivos={estadisticas.inactivos}
        />

        {/* 🔍 Filtros Premium */}
        <FiltrosClientes
          busqueda={busqueda}
          estadoSeleccionado={estadoFiltro}
          origenSeleccionado={origenFiltro}
          onBusquedaChange={setBusqueda}
          onEstadoChange={setEstadoFiltro}
          onOrigenChange={setOrigenFiltro}
          totalResultados={clientesFiltrados.length}
          totalClientes={clientes.length}
        />

        {/* Lista de Clientes (sin cambios en cards) */}
        <ListaClientes
          clientes={clientesFiltrados}
          isLoading={isLoading}
          onVerCliente={handleVerCliente}
          onEditarCliente={handleEditarCliente}
          onEliminarCliente={handleEliminarCliente}
          onNuevoCliente={handleNuevoCliente}
        />

        {/* Formulario Modal */}
        <FormularioClienteContainer clienteSeleccionado={clienteSeleccionado} />

        {/* Modal de Confirmación de Eliminación */}
        <ModalConfirmacion
          isOpen={modalEliminarAbierto}
          onClose={cancelarEliminacion}
          onConfirm={confirmarEliminacion}
          title="Eliminar Cliente"
          message={
            clienteAEliminar ? (
              <div className="space-y-4">
                {/* Pregunta principal */}
                <p className="text-base">
                  ¿Estás seguro de eliminar al cliente{' '}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {clienteAEliminar.nombre_completo}
                  </span>
                  ?
                </p>

                {/* Advertencia de restricciones */}
                <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">⚠️</span>
                    <h4 className="font-bold text-amber-900 dark:text-amber-100">
                      Restricciones
                    </h4>
                  </div>

                  <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">▸</span>
                      <span>Solo clientes en estado <strong>"Interesado"</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">▸</span>
                      <span>Sin viviendas asignadas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">▸</span>
                      <span>Sin historial de negociaciones</span>
                    </li>
                  </ul>
                </div>

                {/* Recomendación */}
                <div className="rounded-xl bg-blue-50 border-2 border-blue-200 p-3 dark:bg-blue-900/20 dark:border-blue-700">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Alternativa:</strong> Usa el estado <strong>"Inactivo"</strong> para
                      mantener la trazabilidad en lugar de eliminar.
                    </p>
                  </div>
                </div>
              </div>
            ) : ''
          }
          confirmText="Eliminar Cliente"
          cancelText="Cancelar"
          variant="danger"
        />
      </div>
    </div>
  )
}
