/**
 * Componente: Card de Versión Individual
 * Tarjeta que muestra una versión con header colapsable y contenido expandible
 * ✅ Separación de responsabilidades: Orquestador, delega en sub-componentes
 */

'use client'

import { motion } from 'framer-motion'
import type { SnapshotVersion } from '../../../hooks/useHistorialVersiones'
import { VersionCardContent } from './VersionCardContent'
import { VersionCardHeader } from './VersionCardHeader'

interface VersionCardProps {
  version: SnapshotVersion
  versionAnterior: SnapshotVersion | null
  isLatest: boolean
  isExpanded: boolean
  onToggle: () => void
}

export function VersionCard({ version, versionAnterior, isLatest, isExpanded, onToggle }: VersionCardProps) {
  const fuentesPago = version.fuentes_pago_snapshot || []
  const fuentesPagoAnteriores = versionAnterior?.fuentes_pago_snapshot || []

  return (
    <motion.div
      layout
      className={`
        rounded-xl border-2 overflow-hidden transition-all
        ${
          isLatest
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
      `}
    >
      <VersionCardHeader version={version} isLatest={isLatest} isExpanded={isExpanded} onToggle={onToggle} />

      <VersionCardContent
        isExpanded={isExpanded}
        fuentesPago={fuentesPago}
        fuentesPagoAnteriores={fuentesPagoAnteriores}
      />
    </motion.div>
  )
}
