/**
 * ViviendasFiltrosPremium - Filtros premium con diseño compacto
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ Diseño sticky con glassmorphism
 * ✅ Layout horizontal (flex)
 * ✅ Labels sr-only (accesibilidad)
 * ✅ Toggle de vista cards/tabla
 * ✅ Basado en patrón de Proyectos
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { LayoutGrid, Search, Table, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { TipoVista } from '@/shared/hooks/useVistaPreference'
import { cn } from '@/shared/utils/helpers'
import type { FiltrosViviendas } from '../types'
import { viviendasFiltrosStyles as styles } from './ViviendasFiltrosPremium.styles'

interface ViviendasFiltrosPremiumProps {
  filtros: FiltrosViviendas
  onActualizarFiltros: (filtros: Partial<FiltrosViviendas>) => void
  onLimpiarFiltros: () => void
  totalResultados: number
  proyectos?: Array<{ id: string; nombre: string }>
  // Toggle de vista
  vista?: TipoVista
  onCambiarVista?: (vista: TipoVista) => void
}

export function ViviendasFiltrosPremium({
  filtros,
  onActualizarFiltros,
  onLimpiarFiltros,
  totalResultados,
  proyectos = [],
  vista = 'cards',
  onCambiarVista = () => {},
}: ViviendasFiltrosPremiumProps) {
  // ✅ FIX HYDRATION: Evitar mismatch entre servidor y cliente
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const hayFiltros = Boolean(filtros.search || filtros.proyecto_id || filtros.estado)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={styles.container}
    >
      {/* Barra principal de búsqueda y filtros */}
      <div className={styles.searchBar}>
        {/* Búsqueda */}
        <div className={styles.searchWrapper}>
          <label htmlFor="search-viviendas" className={styles.label}>
            Buscar
          </label>
          <Search className={styles.searchIcon} />
          <input
            id="search-viviendas"
            type="text"
            value={filtros.search}
            onChange={(e) => onActualizarFiltros({ search: e.target.value })}
            placeholder="Buscar número, manzana, matrícula..."
            className={styles.searchInput}
          />
          {filtros.search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onActualizarFiltros({ search: '' })}
              className={styles.searchClearButton}
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Select Proyecto */}
        <div className="relative">
          <label htmlFor="filter-proyecto" className={styles.label}>
            Proyecto
          </label>
          <select
            id="filter-proyecto"
            value={filtros.proyecto_id}
            onChange={(e) => onActualizarFiltros({ proyecto_id: e.target.value })}
            className={styles.select}
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Select Estado */}
        <div className="relative">
          <label htmlFor="filter-estado" className={styles.label}>
            Estado
          </label>
          <select
            id="filter-estado"
            value={filtros.estado}
            onChange={(e) => onActualizarFiltros({ estado: e.target.value })}
            className={styles.select}
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">🟢 Disponible</option>
            <option value="Asignada">🔵 Asignada</option>
            <option value="Entregada">🟣 Entregada</option>
          </select>
        </div>
      </div>

      {/* Footer con toggle de vista, contador y limpiar */}
      <div className={styles.footer}>
        {/* Toggle Cards/Tabla - Solo renderizar después de montar */}
        {mounted && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => onCambiarVista('cards')}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
                vista === 'cards'
                  ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
              title="Vista de cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => onCambiarVista('tabla')}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
                vista === 'tabla'
                  ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
              title="Vista de tabla"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>
        )}

        <p className={styles.resultCount}>
          {totalResultados} {totalResultados === 1 ? 'resultado' : 'resultados'}
        </p>

        <AnimatePresence>
          {hayFiltros && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={onLimpiarFiltros}
              className={styles.clearButton}
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
