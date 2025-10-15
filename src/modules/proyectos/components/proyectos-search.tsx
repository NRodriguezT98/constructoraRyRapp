'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { staggerItem } from '../../../shared/styles/animations'
import { SearchBar, ViewToggle, FilterButton, FilterPanel } from '../../../shared/components/ui'
import { useProyectosStore } from '../store/proyectos.store'
import { ESTADOS_PROYECTO } from '../constants'

export function ProyectosSearch() {
  const { filtros, setFiltros, vista, setVista } = useProyectosStore()
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  return (
    <motion.div variants={staggerItem} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador compartido */}
        <SearchBar
          value={filtros.busqueda}
          onChange={(value) => setFiltros({ busqueda: value })}
          placeholder="Buscar proyectos por nombre, ubicación..."
          className="flex-1"
        />

        {/* Botones de acción */}
        <div className="flex gap-2">
          <FilterButton
            active={mostrarFiltros}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          />

          <ViewToggle
            value={vista}
            onChange={setVista}
          />
        </div>
      </div>

      {/* Panel de filtros compartido */}
      <FilterPanel
        show={mostrarFiltros}
        title="Filtrar por estado:"
        options={ESTADOS_PROYECTO}
        value={filtros.estado}
        onChange={(value) => setFiltros({ estado: value })}
      />
    </motion.div>
  )
}
