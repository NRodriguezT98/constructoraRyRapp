/**
 * Componente principal del módulo de Clientes
 * Orquesta la lógica con el hook y presenta los componentes
 *
 * ✅ PROTEGIDO POR MIDDLEWARE
 * - Recibe permisos como props desde Server Component
 * - No necesita validar autenticación (ya validada)
 * - Solo maneja UI y lógica de negocio
 *
 * ✅ MIGRADO A REACT QUERY
 * - Usa useClientesList() para gestión de estado
 * - Cache automático y refetch inteligente
 * - Eliminado Zustand store (deprecado)
 */

'use client'

import { construirURLCliente } from '@/lib/utils/slug.utils'
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
import { useClientesList } from '../hooks'
import type { ClienteResumen, EstadoCliente, OrigenCliente } from '../types'

/**
 * Permisos del usuario (pasados desde Server Component)
 */
interface ClientesPageMainProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

export function ClientesPageMain({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView = true,
  isAdmin = false,
}: ClientesPageMainProps = {}) {
  console.log('👥 [CLIENTES MAIN] Client Component montado con permisos:', {
    canCreate,
    canEdit,
    canDelete,
    canView,
    isAdmin,
  })

  const router = useRouter()

  // ✅ REACT QUERY: Hook de lista con gestión de estado
  const {
    clientes,
    isLoading,
    estadisticas,
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
    filtros,
    actualizarFiltros,
  } = useClientesList()

  // Estados para filtros locales (compatibilidad UI)
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
    abrirModalCrear()
  }, [abrirModalCrear])

  const handleVerCliente = useCallback(
    (cliente: ClienteResumen) => {
      // Navegar a la página de detalle con URL amigable
      const url = construirURLCliente({
        id: cliente.id,
        nombre_completo: cliente.nombre_completo,
      })
      router.push(url)
    },
    [router]
  )

  const handleEditarCliente = useCallback(
    (cliente: ClienteResumen) => {
      abrirModalEditar(cliente)
    },
    [abrirModalEditar]
  )

  const handleEliminarCliente = useCallback(
    (cliente: ClienteResumen) => {
      abrirModalEliminar(cliente.id)
    },
    [abrirModalEliminar]
  )

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Hero + FAB */}
        <ClientesHeader
          onNuevoCliente={canCreate ? handleNuevoCliente : undefined}
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

        {/* Lista de Clientes */}
        <ListaClientes
          clientes={clientesFiltrados}
          isLoading={isLoading}
          onVerCliente={handleVerCliente}
          onEditarCliente={canEdit ? handleEditarCliente : undefined}
          onEliminarCliente={canDelete ? handleEliminarCliente : undefined}
          onNuevoCliente={canCreate ? handleNuevoCliente : undefined}
        />

        {/* Formulario Modal */}
        <FormularioClienteContainer clienteSeleccionado={clienteEditar || null} />

        {/* Modal de Confirmación de Eliminación */}
        <ModalConfirmacion
          isOpen={modalEliminar}
          onClose={cancelarEliminar}
          onConfirm={confirmarEliminar}
          title="Eliminar Cliente"
          message={
            clienteEliminar ? (
              <div className="space-y-4">
                {/* Pregunta principal */}
                <p className="text-base">
                  ¿Estás seguro de eliminar al cliente{' '}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {clientes.find((c) => c.id === clienteEliminar)?.nombre_completo}
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
