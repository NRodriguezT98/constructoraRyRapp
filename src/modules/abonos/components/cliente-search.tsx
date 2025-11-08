'use client'

import { Filter, Search, X } from 'lucide-react'

import { seleccionClienteStyles as styles } from '../styles/seleccion-cliente.styles'

interface ClienteSearchProps {
  busqueda: string
  onBusquedaChange: (value: string) => void
  totalResultados: number
  totalClientes: number
}

/**
 * 🔍 Barra de búsqueda premium con glassmorphism
 * Sticky, backdrop-blur y contador de resultados
 */
export function ClienteSearch({
  busqueda,
  onBusquedaChange,
  totalResultados,
  totalClientes
}: ClienteSearchProps) {
  const handleClear = () => {
    onBusquedaChange('')
  }

  const hayFiltro = busqueda.trim().length > 0

  return (
    <div className={styles.search.container}>
      {/* Input de búsqueda */}
      <div className={styles.search.inputWrapper}>
        <Search className={styles.search.iconLeft} />
        <input
          type="text"
          placeholder="Buscar por nombre, documento, proyecto o vivienda..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className={styles.search.input}
        />
        {hayFiltro && (
          <button
            onClick={handleClear}
            className={styles.search.clearButton}
            aria-label="Limpiar búsqueda"
          >
            <X className={styles.search.clearIcon} />
          </button>
        )}
      </div>

      {/* Footer con contador */}
      <div className={styles.search.footer}>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          <span className={styles.search.resultCount}>
            {totalResultados === totalClientes
              ? `${totalClientes} cliente${totalClientes !== 1 ? 's' : ''} disponible${totalClientes !== 1 ? 's' : ''}`
              : `${totalResultados} de ${totalClientes} cliente${totalClientes !== 1 ? 's' : ''}`}
          </span>
        </div>
        {hayFiltro && (
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            Filtro activo
          </span>
        )}
      </div>
    </div>
  )
}
