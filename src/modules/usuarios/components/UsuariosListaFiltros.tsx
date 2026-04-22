/**
 * UsuariosListaFiltros — Barra de filtros sticky del módulo de usuarios
 * ✅ Búsqueda + filtro rol + filtro estado
 * ✅ Sticky con glassmorphism
 * ✅ Labels sr-only (accesibilidad)
 * ✅ Contador de resultados y limpiar filtros
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

import { usuariosPageStyles as styles } from '../styles/usuarios-page.styles'
import type { EstadoUsuario, Rol } from '../types'
import { ESTADOS_USUARIO_UI, ROLES_UI } from '../types'

interface UsuariosListaFiltrosProps {
  busqueda: string
  onBusquedaChange: (v: string) => void
  rolFiltro: Rol | ''
  onRolFiltroChange: (v: Rol | '') => void
  estadoFiltro: EstadoUsuario | ''
  onEstadoFiltroChange: (v: EstadoUsuario | '') => void
  totalResultados: number
  hayFiltrosActivos: boolean
  onLimpiarFiltros: () => void
}

export function UsuariosListaFiltros({
  busqueda,
  onBusquedaChange,
  rolFiltro,
  onRolFiltroChange,
  estadoFiltro,
  onEstadoFiltroChange,
  totalResultados,
  hayFiltrosActivos,
  onLimpiarFiltros,
}: UsuariosListaFiltrosProps) {
  return (
    <motion.div
      {...styles.animations.filtros}
      className={styles.filtros.container}
    >
      <div className={styles.filtros.bar}>
        {/* Búsqueda */}
        <div className={styles.filtros.searchWrapper}>
          <label htmlFor='usuarios-busqueda' className='sr-only'>
            Buscar usuarios
          </label>
          <Search className={styles.filtros.searchIcon} />
          <input
            id='usuarios-busqueda'
            type='text'
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder='Buscar por nombre, email...'
            className={styles.filtros.searchInput}
          />
          <AnimatePresence>
            {busqueda && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onBusquedaChange('')}
                className={styles.filtros.searchClear}
                aria-label='Limpiar búsqueda'
              >
                <X className='h-3.5 w-3.5' />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filtro Rol */}
        <div>
          <label htmlFor='usuarios-rol' className='sr-only'>
            Filtrar por rol
          </label>
          <select
            id='usuarios-rol'
            value={rolFiltro}
            onChange={e => onRolFiltroChange(e.target.value as Rol | '')}
            className={styles.filtros.select}
          >
            <option value=''>Todos los roles</option>
            {ROLES_UI.map(r => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Estado */}
        <div>
          <label htmlFor='usuarios-estado' className='sr-only'>
            Filtrar por estado
          </label>
          <select
            id='usuarios-estado'
            value={estadoFiltro}
            onChange={e =>
              onEstadoFiltroChange(e.target.value as EstadoUsuario | '')
            }
            className={styles.filtros.select}
          >
            <option value=''>Todos los estados</option>
            {ESTADOS_USUARIO_UI.map(e => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.filtros.footer}>
        <p className={styles.filtros.resultCount}>
          {totalResultados} {totalResultados === 1 ? 'usuario' : 'usuarios'}
        </p>

        <AnimatePresence>
          {hayFiltrosActivos && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={onLimpiarFiltros}
              className={styles.filtros.clearButton}
            >
              <X className='h-3.5 w-3.5' />
              Limpiar filtros
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
