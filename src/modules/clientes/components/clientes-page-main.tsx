/**
 * Componente principal del módulo de Clientes
 * Orquesta la lógica con el hook y presenta los componentes
 */

'use client'

import { ModalConfirmacion } from '@/shared'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import {
    ClientesHeader,
    EstadisticasClientes,
    FormularioClienteContainer,
    ListaClientes,
} from '../components'
import { useClientes } from '../hooks'
import { useClientesStore } from '../store/clientes.store'
import { clientesStyles } from '../styles'
import type { ClienteResumen } from '../types'

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
    <div className={clientesStyles.pageContainer}>
      <div className={clientesStyles.contentContainer}>
        {/* Header */}
        <ClientesHeader onNuevoCliente={handleNuevoCliente} />

        {/* Estadísticas */}
        <EstadisticasClientes
          total={estadisticas.total}
          interesados={estadisticas.interesados}
          activos={estadisticas.activos}
          inactivos={estadisticas.inactivos}
        />

        {/* Lista de Clientes */}
        <ListaClientes
          clientes={clientes}
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
