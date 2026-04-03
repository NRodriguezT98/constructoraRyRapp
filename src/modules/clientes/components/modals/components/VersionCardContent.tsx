/**
 * Componente: Contenido Expandible de Card de Versión
 * Muestra el diff detallado de los cambios
 * ✅ Separación de responsabilidades: Solo UI, usa DiffFuentesPago
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'

import type { FuentePago } from '@/modules/clientes/types/fuentes-pago'

import { DiffFuentesPago } from './DiffFuentesPago'

interface VersionCardContentProps {
  isExpanded: boolean
  fuentesPago: FuentePago[]
  fuentesPagoAnteriores: FuentePago[]
}

export function VersionCardContent({
  isExpanded,
  fuentesPago,
  fuentesPagoAnteriores,
}: VersionCardContentProps) {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className='border-t border-gray-200 dark:border-gray-700'
        >
          <div className='bg-gray-50 p-4 dark:bg-gray-900/50'>
            <DiffFuentesPago
              fuentesActuales={fuentesPago}
              fuentesAnteriores={fuentesPagoAnteriores}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
