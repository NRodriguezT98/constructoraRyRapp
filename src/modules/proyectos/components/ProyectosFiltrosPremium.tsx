/**
 * ProyectosFiltrosPremium - Filtros premium con diseño de pills/chips
 * ✅ Diseño sticky con glassmorphism
 * ✅ Pills interactivas para estados
 * ✅ Búsqueda destacada
 * ✅ Animaciones suaves
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Filter, Search, X } from 'lucide-react'

import { ESTADOS_PROYECTO } from '../constants'
import { proyectosPageStyles as styles } from '../styles/proyectos-page.styles'
import type { FiltroProyecto } from '../types'

interface ProyectosFiltrosPremiumProps {
  totalResultados?: number
  // ✅ Props para sincronizar filtros con el componente padre
  filtros?: FiltroProyecto
  onActualizarFiltros?: (filtros: Partial<FiltroProyecto>) => void
  onLimpiarFiltros?: () => void
}

export function ProyectosFiltrosPremium({
  totalResultados = 0,
  filtros = { busqueda: '', estado: undefined },
  onActualizarFiltros = () => {},
  onLimpiarFiltros = () => {}
}: ProyectosFiltrosPremiumProps) {
  const hasFilters = Boolean(filtros.busqueda || filtros.estado)

  const handleLimpiarFiltros = () => {
    onLimpiarFiltros()
  }

  const handleToggleEstado = (estado: string | undefined) => {
    onActualizarFiltros({
      estado: estado as any,
    })
  }

  return (
    <motion.div {...styles.animations.filtros} className={styles.filtros.container}>
      {/* Barra principal de búsqueda */}
      <div className={styles.filtros.searchBar}>
        {/* Búsqueda mejorada */}
        <div className={styles.filtros.searchWrapper}>
          <label htmlFor="search-proyectos" className={styles.filtros.label}>
            Buscar
          </label>
          <Search className={styles.filtros.searchIcon} />
          <input
            id="search-proyectos"
            type="text"
            value={filtros.busqueda || ''}
            onChange={e => onActualizarFiltros({ busqueda: e.target.value })}
            placeholder="Buscar por nombre, ubicación..."
            className={styles.filtros.searchInput}
          />
          {filtros.busqueda && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onActualizarFiltros({ busqueda: '' })}
              className={styles.filtros.searchClearButton}
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Pills de Estado */}
      <div className={styles.filtros.pillsSection}>
        <div className={styles.filtros.pillsLabel}>
          <Filter className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Estado:
          </span>
        </div>
        <div className={styles.filtros.pillsContainer}>
          {ESTADOS_PROYECTO.map(estado => {
            const isActive = filtros.estado === estado.value
            const getIcon = () => {
              if (estado.value === undefined) return '📋' // Todos
              if (estado.value === 'en_proceso') return '🏗️'
              if (estado.value === 'completado') return '✅'
              return '📋'
            }

            return (
              <motion.button
                key={estado.label}
                onClick={() => handleToggleEstado(estado.value)}
                className={
                  isActive ? styles.filtros.pillActive : styles.filtros.pill
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={styles.filtros.pillIcon}>
                  {getIcon()}
                </span>
                <span className={styles.filtros.pillLabel}>{estado.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={styles.filtros.pillCheck}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Footer con contador y limpiar */}
      <div className={styles.filtros.footer}>
        <p className={styles.filtros.resultCount}>
          {totalResultados} {totalResultados === 1 ? 'resultado' : 'resultados'}
        </p>
        <AnimatePresence>
          {hasFilters && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              {...styles.animations.clearButton}
              onClick={handleLimpiarFiltros}
              className={styles.filtros.clearButton}
            >
              <X className={styles.filtros.clearIcon} />
              Limpiar filtros
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
