'use client'

import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { viviendasStyles as styles } from '../styles/viviendas.styles'

export interface FiltrosViviendas {
  search: string
  proyecto_id: string
  estado: string
}

interface ViviendasFiltersProps {
  filtros: FiltrosViviendas
  onFiltrosChange: (filtros: Partial<FiltrosViviendas>) => void
  onLimpiarFiltros: () => void
  resultadosCount: number
}

export function ViviendasFilters({
  filtros,
  onFiltrosChange,
  onLimpiarFiltros,
  resultadosCount
}: ViviendasFiltersProps) {
  const [proyectos, setProyectos] = useState<Array<{ id: string; nombre: string }>>([])

  useEffect(() => {
    const cargarProyectos = async () => {
      const { data } = await supabase.from('proyectos').select('id, nombre').order('nombre')
      if (data) setProyectos(data)
    }
    cargarProyectos()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={styles.filtros.container}
    >
      <div className={styles.filtros.grid}>
        <div className={styles.filtros.searchWrapper}>
          <label className={styles.filtros.label}>Buscar vivienda</label>
          <Search className={styles.filtros.searchIcon} />
          <input
            type="text"
            value={filtros.search}
            onChange={(e) => onFiltrosChange({ search: e.target.value })}
            placeholder="Buscar número, manzana, lote..."
            className={styles.filtros.searchInput}
          />
        </div>

        <div className={styles.filtros.selectWrapper}>
          <label className={styles.filtros.label}>Proyecto</label>
          <select
            value={filtros.proyecto_id}
            onChange={(e) => onFiltrosChange({ proyecto_id: e.target.value })}
            className={styles.filtros.select}
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filtros.selectWrapper}>
          <label className={styles.filtros.label}>Estado</label>
          <select
            value={filtros.estado}
            onChange={(e) => onFiltrosChange({ estado: e.target.value })}
            className={styles.filtros.select}
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Asignada">Asignada</option>
            <option value="Entregada">Entregada</option>
            <option value="Pagada">Pagada</option>
          </select>
        </div>
      </div>

      <div className={styles.filtros.footer}>
        <p className={styles.filtros.resultCount}>
          {resultadosCount} {resultadosCount === 1 ? 'resultado' : 'resultados'}
        </p>
        {(filtros.search || filtros.proyecto_id || filtros.estado) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLimpiarFiltros}
            className={styles.filtros.clearButton}
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
