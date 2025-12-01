/**
 * 🔍 Filtros Premium de Clientes
 * Búsqueda y filtros por estado con glassmorphism
 * ✅ Toggle vista cards/tabla
 */

'use client'

import { Filter, LayoutGrid, Search, Table, X } from 'lucide-react'

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

const ESTADOS: Array<{ value: EstadoCliente | 'Todos'; label: string }> = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Interesado', label: 'Interesados' },
  { value: 'Activo', label: 'Activos' },
  { value: 'Inactivo', label: 'Inactivos' },
  { value: 'Propietario', label: 'Propietarios' }
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
      {/* GRID COMPACTO: Búsqueda + Estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* 🔍 BÚSQUEDA */}
        <div className="relative col-span-1">
          <label htmlFor="search-clientes" className="sr-only">Buscar</label>
          <Search className={styles.filtros.searchIconLeft} />
          <input
            id="search-clientes"
            type="text"
            placeholder="Buscar cliente..."
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

        {/* 🎯 FILTRO POR ESTADO (Select) */}
        <div className="relative col-span-1">
          <label htmlFor="filter-estado" className="sr-only">Filtrar por estado</label>
          <Filter className={styles.filtros.selectIconLeft} />
          <select
            id="filter-estado"
            value={estadoSeleccionado}
            onChange={(e) => onEstadoChange(e.target.value as EstadoCliente | 'Todos')}
            className={`${styles.filtros.select} [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-white`}
          >
            {ESTADOS.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
          <svg
            className={styles.filtros.selectIconRight}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* FOOTER: Contador + Toggle Vista + Limpiar */}
      <div className={styles.filtros.footer}>
        <div className={styles.filtros.resultCount}>
          <Filter className={styles.filtros.resultCountIcon} />
          <span>
            {totalResultados === totalClientes
              ? `${totalClientes} cliente${totalClientes !== 1 ? 's' : ''}`
              : `${totalResultados} de ${totalClientes}`}
          </span>
        </div>

        {/* Toggle Vista Cards/Tabla */}
        {onCambiarVista && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => onCambiarVista('cards')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                vista === 'cards'
                  ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Vista de cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => onCambiarVista('tabla')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                vista === 'tabla'
                  ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Vista de tabla"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>
        )}

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
