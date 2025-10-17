/**
 * Zustand Store para el módulo de clientes
 * Estado global del módulo
 */

import { create } from 'zustand'
import type { Cliente, ClienteResumen, FiltrosClientes } from '../types'

interface ClientesState {
  // Estado
  clientes: ClienteResumen[]
  clienteSeleccionado: Cliente | null
  isLoading: boolean
  error: string | null

  // Filtros
  filtros: FiltrosClientes
  busqueda: string

  // UI
  modalFormularioAbierto: boolean
  modalDetalleAbierto: boolean
  vistaActual: 'grid' | 'table'

  // Acciones - Estado
  setClientes: (clientes: ClienteResumen[]) => void
  setClienteSeleccionado: (cliente: Cliente | null) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void

  // Acciones - Filtros
  setFiltros: (filtros: FiltrosClientes) => void
  setBusqueda: (busqueda: string) => void
  limpiarFiltros: () => void

  // Acciones - UI
  abrirModalFormulario: () => void
  cerrarModalFormulario: () => void
  abrirModalDetalle: (cliente: Cliente) => void
  cerrarModalDetalle: () => void
  cambiarVista: (vista: 'grid' | 'table') => void

  // Acciones - CRUD
  agregarCliente: (cliente: ClienteResumen) => void
  actualizarCliente: (id: string, cliente: Partial<ClienteResumen>) => void
  eliminarCliente: (id: string) => void

  // Utilidades
  reset: () => void
}

const estadoInicial = {
  clientes: [],
  clienteSeleccionado: null,
  isLoading: true, // Iniciar en true para mostrar skeletons en primera carga
  error: null,
  filtros: {},
  busqueda: '',
  modalFormularioAbierto: false,
  modalDetalleAbierto: false,
  vistaActual: 'grid' as const,
}

export const useClientesStore = create<ClientesState>((set) => ({
  ...estadoInicial,

  // Acciones - Estado
  setClientes: (clientes) => set({ clientes }),
  setClienteSeleccionado: (clienteSeleccionado) => set({ clienteSeleccionado }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Acciones - Filtros
  setFiltros: (filtros) => set({ filtros }),
  setBusqueda: (busqueda) => set({ busqueda }),
  limpiarFiltros: () => set({ filtros: {}, busqueda: '' }),

  // Acciones - UI
  abrirModalFormulario: () => set({ modalFormularioAbierto: true }),
  cerrarModalFormulario: () =>
    set({ modalFormularioAbierto: false, clienteSeleccionado: null }),
  abrirModalDetalle: (cliente) =>
    set({ modalDetalleAbierto: true, clienteSeleccionado: cliente }),
  cerrarModalDetalle: () =>
    set({ modalDetalleAbierto: false, clienteSeleccionado: null }),
  cambiarVista: (vistaActual) => set({ vistaActual }),

  // Acciones - CRUD
  agregarCliente: (cliente) =>
    set((state) => ({ clientes: [cliente, ...state.clientes] })),
  actualizarCliente: (id, clienteActualizado) =>
    set((state) => ({
      clientes: state.clientes.map((c) =>
        c.id === id ? { ...c, ...clienteActualizado } : c
      ),
    })),
  eliminarCliente: (id) =>
    set((state) => ({
      clientes: state.clientes.filter((c) => c.id !== id),
    })),

  // Utilidades
  reset: () => set(estadoInicial),
}))
