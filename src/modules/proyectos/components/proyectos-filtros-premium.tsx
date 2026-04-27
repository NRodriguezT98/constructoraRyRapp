/**
 * ProyectosFiltrosPremium - Filtros premium con diseño de pills/chips
 * ✅ Diseño sticky con glassmorphism
 * ✅ Pills interactivas para estados
 * ✅ Búsqueda destacada
 * ✅ Animaciones suaves
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Archive,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Search,
  Wrench,
  X,
} from 'lucide-react'

import { ESTADOS_PROYECTO } from '../constants'
import { proyectosPageStyles as styles } from '../styles/proyectos-page.styles'
import type { EstadoProyecto, FiltroProyecto } from '../types'

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
  onActualizarFiltros = (_filtros: Partial<FiltroProyecto>) => {
    /* noop: prop opcional sin handler */
  },
  onLimpiarFiltros = () => {
    /* noop: prop opcional sin handler */
  },
}: ProyectosFiltrosPremiumProps) {
  const hasFilters = Boolean(
    filtros.busqueda || filtros.estado || filtros.verArchivados
  )

  const handleLimpiarFiltros = () => {
    onLimpiarFiltros()
  }

  const handleToggleEstado = (estado: string | undefined) => {
    onActualizarFiltros({
      estado: estado as EstadoProyecto | undefined,
    })
  }

  return (
    <motion.div
      {...styles.animations.filtros}
      className={styles.filtros.container}
    >
      {/* Fila principal híbrida */}
      <div className={styles.filtros.mainRow}>
        {/* Barra principal de búsqueda */}
        <div className={styles.filtros.searchBar}>
          {/* Búsqueda mejorada */}
          <div className={styles.filtros.searchWrapper}>
            <label htmlFor='search-proyectos' className={styles.filtros.label}>
              Buscar
            </label>
            <Search className={styles.filtros.searchIcon} />
            <input
              id='search-proyectos'
              type='text'
              value={filtros.busqueda || ''}
              onChange={e => onActualizarFiltros({ busqueda: e.target.value })}
              placeholder='Buscar por nombre, ubicación...'
              className={styles.filtros.searchInput}
            />
            {filtros.busqueda && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onActualizarFiltros({ busqueda: '' })}
                className={styles.filtros.searchClearButton}
                aria-label='Limpiar búsqueda'
              >
                <X className='h-4 w-4' />
              </motion.button>
            )}
          </div>
        </div>

        {/* Pills de Estado */}
        <div className={styles.filtros.pillsSection}>
          <div className={styles.filtros.pillsLabel}>
            <Filter className='h-3.5 w-3.5 text-gray-500 dark:text-gray-400' />
            <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
              Estado:
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <div className={styles.filtros.pillsContainer}>
              {ESTADOS_PROYECTO.map(estado => {
                const isActive = filtros.estado === estado.value
                const getIcon = () => {
                  if (estado.value === undefined)
                    return <Layers className='h-3.5 w-3.5' />
                  if (estado.value === 'en_proceso')
                    return <Clock className='h-3.5 w-3.5' />
                  if (estado.value === 'en_construccion')
                    return <Wrench className='h-3.5 w-3.5' />
                  if (estado.value === 'completado')
                    return <CheckCircle2 className='h-3.5 w-3.5' />
                  return <Layers className='h-3.5 w-3.5' />
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
                    <span className={styles.filtros.pillIcon}>{getIcon()}</span>
                    <span className={styles.filtros.pillLabel}>
                      {estado.label}
                    </span>
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
            {/* Toggle Ver Archivados como pill */}
            <motion.button
              onClick={() =>
                onActualizarFiltros({ verArchivados: !filtros.verArchivados })
              }
              className={
                filtros.verArchivados
                  ? 'group relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-amber-400 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-amber-500/30 dark:border-amber-600'
                  : styles.filtros.pill
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Archive className='h-3.5 w-3.5' />
              <span className={styles.filtros.pillLabel}>Ver archivados</span>
              {filtros.verArchivados && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={styles.filtros.pillCheck}
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer con contador y limpiar */}
      <div className={styles.filtros.footer}>
        {/* Toggle Cards/Tabla - eliminado: solo vista tabla */}

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
