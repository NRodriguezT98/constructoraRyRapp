/**
 * 🔍 Filtros Premium de Clientes
 * Búsqueda, filtros por estado y origen con glassmorphism
 */

'use client'

import { Filter, Search, Tag, X } from 'lucide-react'

import { clientesListaStyles as styles } from '../styles/clientes-lista.styles'
import type { EstadoCliente, OrigenCliente } from '../types'

interface FiltrosClientesProps {
  busqueda: string
  estadoSeleccionado?: EstadoCliente | 'Todos'
  origenSeleccionado?: OrigenCliente | 'Todos'
  onBusquedaChange: (value: string) => void
  onEstadoChange: (estado: EstadoCliente | 'Todos') => void
  onOrigenChange: (origen: OrigenCliente | 'Todos') => void
  totalResultados: number
  totalClientes: number
}

const ESTADOS: Array<{ value: EstadoCliente | 'Todos'; label: string }> = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Interesado', label: 'Interesados' },
  { value: 'Activo', label: 'Activos' },
  { value: 'Inactivo', label: 'Inactivos' },
  { value: 'Propietario', label: 'Propietarios' }
]

const ORIGENES: Array<{ value: OrigenCliente | 'Todos'; label: string }> = [
  { value: 'Todos', label: 'Todos los orígenes' },
  { value: 'Referido', label: 'Referido' },
  { value: 'Página Web', label: 'Página Web' },
  { value: 'Redes Sociales', label: 'Redes Sociales' },
  { value: 'Llamada Directa', label: 'Llamada Directa' },
  { value: 'Visita Oficina', label: 'Visita Oficina' },
  { value: 'Feria/Evento', label: 'Feria/Evento' },
  { value: 'Publicidad', label: 'Publicidad' },
  { value: 'Otro', label: 'Otro' }
]

export function FiltrosClientes({
  busqueda,
  estadoSeleccionado = 'Todos',
  origenSeleccionado = 'Todos',
  onBusquedaChange,
  onEstadoChange,
  onOrigenChange,
  totalResultados,
  totalClientes
}: FiltrosClientesProps) {
  const handleClearSearch = () => {
    onBusquedaChange('')
  }

  const handleClearFilters = () => {
    onBusquedaChange('')
    onEstadoChange('Todos')
    onOrigenChange('Todos')
  }

  const hayBusqueda = busqueda.trim().length > 0
  const hayFiltrosActivos = estadoSeleccionado !== 'Todos' || origenSeleccionado !== 'Todos' || hayBusqueda

  return (
    <div className={styles.filtros.container}>
      {/* GRID: Búsqueda + Estado + Origen */}
      <div className={styles.filtros.grid}>
        {/* 🔍 BÚSQUEDA */}
        <div className="relative col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {hayBusqueda && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-10"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* 🎯 FILTRO POR ESTADO (Select) */}
        <div className="relative col-span-1">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
          <select
            value={estadoSeleccionado}
            onChange={(e) => onEstadoChange(e.target.value as EstadoCliente | 'Todos')}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all text-sm appearance-none cursor-pointer"
          >
            {ESTADOS.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* 🏷️ FILTRO POR ORIGEN (Select) */}
        <div className="relative col-span-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
          <select
            value={origenSeleccionado}
            onChange={(e) => onOrigenChange(e.target.value as OrigenCliente | 'Todos')}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all text-sm appearance-none cursor-pointer"
          >
            {ORIGENES.map((origen) => (
              <option key={origen.value} value={origen.value}>
                {origen.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* FOOTER: Contador + Limpiar */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>
            {totalResultados === totalClientes
              ? `${totalClientes} cliente${totalClientes !== 1 ? 's' : ''} registrado${totalClientes !== 1 ? 's' : ''}`
              : `${totalResultados} de ${totalClientes} cliente${totalClientes !== 1 ? 's' : ''}`}
          </span>
        </div>
        {hayFiltrosActivos && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
