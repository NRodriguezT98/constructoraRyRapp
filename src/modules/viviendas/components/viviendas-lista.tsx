'use client'

import { motion } from 'framer-motion'

import { Pagination } from '@/shared/components/ui/Pagination'
import { staggerContainer, staggerItem } from '../../../shared/styles/animations'
import { viviendasListStyles as styles } from '../styles/viviendasList.styles'
import type { Vivienda } from '../types'

import { ViviendaCard } from './vivienda-card'

interface ViviendasListaProps {
  viviendas: Vivienda[]
  onVerDetalle?: (vivienda: Vivienda) => void
  onAsignarCliente?: (vivienda: Vivienda) => void
  onVerAbonos?: (vivienda: Vivienda) => void
  onRegistrarPago?: (vivienda: Vivienda) => void
  onGenerarEscritura?: (vivienda: Vivienda) => void
  onEditar?: (vivienda: Vivienda) => void
  onEliminar?: (id: string) => void
  // Paginación
  paginaActual?: number
  totalPaginas?: number
  totalItems?: number
  itemsPorPagina?: number
  onCambiarPagina?: (pagina: number) => void
  onCambiarItemsPorPagina?: (items: number) => void
}

/**
 * Lista de viviendas en grid con paginación
 * Componente presentacional puro
 */
export function ViviendasLista({
  viviendas,
  onVerDetalle,
  onAsignarCliente,
  onVerAbonos,
  onRegistrarPago,
  onGenerarEscritura,
  onEditar,
  onEliminar,
  paginaActual = 1,
  totalPaginas = 1,
  totalItems = 0,
  itemsPorPagina = 9,
  onCambiarPagina,
  onCambiarItemsPorPagina,
}: ViviendasListaProps) {
  return (
    <div className="space-y-6">
      <motion.div
        key={`page-${paginaActual}`}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={styles.grid.container}
      >
        {viviendas.map(vivienda => (
          <motion.div key={vivienda.id} variants={staggerItem}>
            <ViviendaCard
              vivienda={vivienda}
              onVerDetalle={() => onVerDetalle?.(vivienda)}
              onAsignarCliente={() => onAsignarCliente?.(vivienda)}
              onVerAbonos={() => onVerAbonos?.(vivienda)}
              onRegistrarPago={() => onRegistrarPago?.(vivienda)}
              onGenerarEscritura={() => onGenerarEscritura?.(vivienda)}
              onEditar={() => onEditar?.(vivienda)}
              onEliminar={() => onEliminar?.(vivienda.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Paginación - Mostrar siempre */}
      {onCambiarPagina && (
        <Pagination
          currentPage={paginaActual}
          totalPages={totalPaginas}
          totalItems={totalItems}
          itemsPerPage={itemsPorPagina}
          onPageChange={onCambiarPagina}
          onItemsPerPageChange={onCambiarItemsPorPagina}
        />
      )}
    </div>
  )
}
