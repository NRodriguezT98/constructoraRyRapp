'use client'

import { motion } from 'framer-motion'

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
}

/**
 * Lista de viviendas en grid
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
  onEliminar
}: ViviendasListaProps) {
  return (
    <motion.div
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
  )
}
