'use client'

import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

import { renunciasStyles as styles } from '../styles/renuncias.styles'
import type { EstadoRenuncia, FiltrosRenuncias } from '../types'

interface Proyecto {
  id: string
  nombre: string
}

interface RenunciasFiltrosPremiumProps {
  filtros: FiltrosRenuncias
  onFiltrosChange: (filtros: FiltrosRenuncias) => void
  onLimpiar: () => void
  totalResultados: number
  proyectos: Proyecto[]
}

export function RenunciasFiltrosPremium({
  filtros,
  onFiltrosChange,
  onLimpiar,
  totalResultados,
  proyectos,
}: RenunciasFiltrosPremiumProps) {
  const hayFiltrosActivos =
    (filtros.busqueda && filtros.busqueda.length > 0) ||
    (filtros.estado && filtros.estado !== 'todos') ||
    (filtros.proyecto_id && filtros.proyecto_id.length > 0)

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={styles.filtros.container}
    >
      <div className={styles.filtros.grid}>
        {/* Búsqueda */}
        <div className={styles.filtros.searchWrapper}>
          <label className={styles.filtros.label} htmlFor="renuncias-search">
            Buscar
          </label>
          <Search className={styles.filtros.searchIcon} />
          <input
            id="renuncias-search"
            type="text"
            placeholder="Buscar por cliente, documento, vivienda..."
            value={filtros.busqueda ?? ''}
            onChange={(e) => onFiltrosChange({ ...filtros, busqueda: e.target.value })}
            className={styles.filtros.searchInput}
          />
        </div>

        {/* Estado */}
        <div>
          <label className={styles.filtros.label} htmlFor="renuncias-estado">
            Estado
          </label>
          <select
            id="renuncias-estado"
            value={filtros.estado ?? 'todos'}
            onChange={(e) =>
              onFiltrosChange({
                ...filtros,
                estado: e.target.value as EstadoRenuncia | 'todos',
              })
            }
            className={styles.filtros.select}
          >
            <option value="todos">Todos los estados</option>
            <option value="Pendiente Devolución">Pendiente Devolución</option>
            <option value="Cerrada">Cerrada</option>
          </select>
        </div>

        {/* Proyecto */}
        <div>
          <label className={styles.filtros.label} htmlFor="renuncias-proyecto">
            Proyecto
          </label>
          <select
            id="renuncias-proyecto"
            value={filtros.proyecto_id ?? ''}
            onChange={(e) => onFiltrosChange({ ...filtros, proyecto_id: e.target.value })}
            className={styles.filtros.select}
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.filtros.footer}>
        <p className={styles.filtros.resultCount}>
          {totalResultados} renuncia{totalResultados !== 1 ? 's' : ''} encontrada
          {totalResultados !== 1 ? 's' : ''}
        </p>
        {hayFiltrosActivos ? (
          <button type="button" onClick={onLimpiar} className={styles.filtros.clearButton}>
            <X className="w-3 h-3" />
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}
