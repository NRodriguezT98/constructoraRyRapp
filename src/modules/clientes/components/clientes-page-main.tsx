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

import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { construirURLCliente } from '@/lib/utils/slug.utils'
import { ModalConfirmacion } from '@/shared'
import { useVistaPreference } from '@/shared/hooks/useVistaPreference'

import {
    ClientesHeader,
    EstadisticasClientes,
    FiltrosClientes,
    FormularioClienteContainer,
} from '../components'
import { ClientesTabla } from '../components/ClientesTabla'
import { useClientesList } from '../hooks'
import type { ClienteResumen, EstadoCliente, OrigenCliente } from '../types'
import { ClienteCardCompacta } from './cards/cliente-card-compacta'

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

  // ✅ REACT QUERY: Hook de lista con gestión de estado y paginación
  const {
    clientes, // Para cards (paginados)
    clientesFiltrados, // Para tabla (todos filtrados)
    isLoading,
    isFetching, // ⭐ Indica si está recargando (sin limpiar datos)
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
    // Paginación para vista cards
    paginaActual,
    totalPaginas,
    itemsPorPagina,
    cambiarPagina,
    cambiarItemsPorPagina,
    totalFiltrados,
  } = useClientesList()

  // Hook para preferencia de vista (cards vs tabla)
  const [vista, setVista] = useVistaPreference({ moduleName: 'clientes' })

  // Estados para filtros locales (compatibilidad UI) - Para los selects de la interfaz
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCliente | 'Todos'>('Todos')
  const [origenFiltro, setOrigenFiltro] = useState<OrigenCliente | 'Todos'>('Todos')

  // ⭐ SINCRONIZAR FILTROS LOCALES CON EL HOOK
  useEffect(() => {
    actualizarFiltros({
      busqueda: busqueda,
      estado: estadoFiltro === 'Todos' ? [] : [estadoFiltro],
    })
  }, [busqueda, estadoFiltro, actualizarFiltros])

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

  const handleIniciarAsignacion = useCallback(
    (cliente: ClienteResumen) => {
      // Redirigir al detalle del cliente para crear negociación
      const url = construirURLCliente(cliente.id, cliente.nombres, cliente.apellidos)
      router.push(`${url}?action=crear-negociacion`)
    },
    [router]
  )

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animación simplificada para navegación instantánea */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4"
      >
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

        {/* 🔍 Filtros Premium con Toggle Vista */}
        <FiltrosClientes
          busqueda={busqueda}
          estadoSeleccionado={estadoFiltro}
          origenSeleccionado={origenFiltro}
          onBusquedaChange={setBusqueda}
          onEstadoChange={setEstadoFiltro}
          onOrigenChange={setOrigenFiltro}
          totalResultados={totalFiltrados}
          totalClientes={estadisticas.total}
          vista={vista}
          onCambiarVista={setVista}
        />

        {/* Contenido Principal: Cards o Tabla */}
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : clientesFiltrados.length === 0 ? (
          // Empty state
          <div className="text-center py-16 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/10 to-violet-500/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No se encontraron clientes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {busqueda || estadoFiltro !== 'Todos' || origenFiltro !== 'Todos'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer cliente'}
            </p>
            {canCreate && (
              <button
                onClick={handleNuevoCliente}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Cliente
              </button>
            )}
          </div>
        ) : vista === 'cards' ? (
          // Vista de Cards con Paginación
          <div className="space-y-4">
            {isLoading && clientes.length === 0 ? (
              // Loading skeleton solo si NO HAY datos previos
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Indicador sutil de recarga */}
                {isFetching && clientes.length > 0 && (
                  <div className="flex items-center justify-center gap-2 py-2 backdrop-blur-xl bg-cyan-50/80 dark:bg-cyan-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-cyan-700 dark:text-cyan-400">Actualizando datos...</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientes.map((cliente) => (
                    <ClienteCardCompacta
                      key={cliente.id}
                      cliente={cliente}
                      vista="grid"
                      tieneCedula={cliente.tiene_cedula}
                      onVer={handleVerCliente}
                      onEditar={canEdit ? handleEditarCliente : undefined}
                      onEliminar={canDelete ? handleEliminarCliente : undefined}
                      onIniciarAsignacion={canCreate ? handleIniciarAsignacion : undefined}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Mostrando {(paginaActual - 1) * itemsPorPagina + 1} -{' '}
                    {Math.min(paginaActual * itemsPorPagina, totalFiltrados)} de {totalFiltrados}
                  </p>
                  <select
                    value={itemsPorPagina}
                    onChange={(e) => cambiarItemsPorPagina(Number(e.target.value))}
                    className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={12}>12 por página</option>
                    <option value={24}>24 por página</option>
                    <option value={48}>48 por página</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {paginaActual} / {totalPaginas}
                  </span>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Vista de Tabla (TanStack Table maneja paginación interna)
          <>
            {isLoading && clientesFiltrados.length === 0 ? (
              // Loading skeleton solo si NO HAY datos previos
              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
                <div className="h-12 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 animate-pulse" />
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Indicador sutil de recarga en tabla */}
                {isFetching && clientesFiltrados.length > 0 && (
                  <div className="absolute -top-10 left-0 right-0 flex items-center justify-center gap-2 py-2 backdrop-blur-xl bg-cyan-50/80 dark:bg-cyan-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800 z-10">
                    <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-cyan-700 dark:text-cyan-400">Actualizando datos...</span>
                  </div>
                )}

                <ClientesTabla
                  clientes={clientesFiltrados}
                  onView={handleVerCliente}
                  onEdit={canEdit ? handleEditarCliente : undefined}
                  onDelete={canDelete ? abrirModalEliminar : undefined}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Formulario Modal */}
      {(modalCrear || modalEditar) && (
        <FormularioClienteContainer
          clienteSeleccionado={clienteEditar || null}
          isOpen={modalCrear || modalEditar}
          onClose={cerrarModal}
        />
      )}

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
                  {clientesFiltrados.find((c) => c.id === clienteEliminar)?.nombre_completo}
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
  )
}
