/**
 * 🔍 Filtros Premium de Clientes
 * Búsqueda y filtros por estado con pill buttons visibles
 * ✅ Toggle vista cards/tabla integrado en fila de búsqueda
 */

'use client'

import { LayoutGrid, Search, Table, X } from 'lucide-react'

import type { TipoVista } from '@/shared/hooks/useVistaPreference'

import { clientesListaStyles as styles } from '../styles/clientes-lista.styles'
import type { EstadoCliente } from '../types'

interface FiltrosClientesProps {
  busqueda: string
  estadoSeleccionado?: EstadoCliente | 'Todos'
  onBusquedaChange: (value: string) => void
  onEstadoChange: (estado: EstadoCliente | 'Todos') => void
  totalResultados: number
  totalClientes: number
  // Toggle de vista
  vista?: TipoVista
  onCambiarVista?: (vista: TipoVista) => void
}

const ESTADOS: Array<{ value: EstadoCliente | 'Todos'; label: string; color: string; activeColor: string }> = [
  { value: 'Todos',      label: 'Todos',        color: 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-cyan-400 dark:hover:border-cyan-600',        activeColor: 'border-cyan-500 bg-cyan-500 text-white shadow-sm shadow-cyan-500/30' },
  { value: 'Interesado', label: 'Interesados',  color: 'border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-600',        activeColor: 'border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/30' },
  { value: 'Activo',     label: 'Activos',      color: 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400',                    activeColor: 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' },
  { value: 'Renunció',   label: 'Renunciaron',  color: 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:border-red-400 dark:hover:border-red-600',              activeColor: 'border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/30' },
  { value: 'Inactivo',   label: 'Inactivos',    color: 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-500 hover:border-gray-400 dark:hover:border-gray-500',        activeColor: 'border-gray-500 bg-gray-500 text-white shadow-sm shadow-gray-500/30' },
  { value: 'Propietario',label: 'Propietarios', color: 'border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:border-purple-400 dark:hover:border-purple-600', activeColor: 'border-purple-500 bg-purple-500 text-white shadow-sm shadow-purple-500/30' },
]

export function FiltrosClientes({
  busqueda,
  estadoSeleccionado = 'Todos',
  onBusquedaChange,
  onEstadoChange,
  totalResultados,
  totalClientes,
  vista = 'cards',
  onCambiarVista = () => {},
}: FiltrosClientesProps) {
  const handleClearSearch = () => {
    onBusquedaChange('')
  }

  const handleClearFilters = () => {
    onBusquedaChange('')
    onEstadoChange('Todos')
  }

  const hayBusqueda = busqueda.trim().length > 0
  const hayFiltrosActivos = estadoSeleccionado !== 'Todos' || hayBusqueda

  return (
    <div className={styles.filtros.container}>
      {/* FILA 1: Búsqueda + Toggle Vista */}
      <div className="flex items-center gap-2">
        {/* 🔍 BÚSQUEDA */}
        <div className="relative flex-1">
          <label htmlFor="search-clientes" className="sr-only">Buscar</label>
          <Search className={styles.filtros.searchIconLeft} />
          <input
            id="search-clientes"
            type="text"
            placeholder="Buscar cliente por nombre, cédula o teléfono..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className={styles.filtros.searchInput}
          />
          {hayBusqueda && (
            <button
              onClick={handleClearSearch}
              className={styles.filtros.clearButton}
              aria-label="Limpiar búsqueda"
            >
              <X className={styles.filtros.clearIcon} />
            </button>
          )}
        </div>

        {/* Toggle Vista Cards/Tabla — visible en primer plano */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-lg flex-shrink-0">
          <button
            onClick={() => onCambiarVista('cards')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              vista === 'cards'
                ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            title="Vista de cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => onCambiarVista('tabla')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              vista === 'tabla'
                ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            title="Vista de tabla"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tabla</span>
          </button>
        </div>
      </div>

      {/* FILA 2: Pill buttons de estado — siempre visibles */}
      <div className="flex items-center gap-1.5 flex-wrap pt-2">
        {ESTADOS.map((estado) => {
          const isActive = estadoSeleccionado === estado.value
          return (
            <button
              key={estado.value}
              onClick={() => onEstadoChange(estado.value)}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive ? estado.activeColor : `bg-white dark:bg-gray-900/30 ${estado.color}`
              }`}
            >
              {estado.label}
            </button>
          )
        })}
      </div>

      {/* FOOTER: Contador + Limpiar */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-200 dark:border-gray-700">
        <p className={styles.filtros.resultCount}>
          <span>
            {totalResultados === totalClientes
              ? `${totalClientes} cliente${totalClientes !== 1 ? 's' : ''}`
              : `${totalResultados} de ${totalClientes} clientes`}
          </span>
        </p>

        {hayFiltrosActivos && (
          <button
            onClick={handleClearFilters}
            className={styles.filtros.clearFiltersButton}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
