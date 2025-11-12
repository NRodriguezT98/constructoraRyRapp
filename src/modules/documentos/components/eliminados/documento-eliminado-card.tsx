/**
 * Card individual de documento eliminado (REFACTORIZADO)
 * Componente orquestador que usa sub-componentes especializados
 */

'use client'

import type { DocumentoProyecto } from '@/modules/documentos/types/documento.types'
import { ConfirmacionModal } from '@/shared/components/modals'
import { AnimatePresence, motion } from 'framer-motion'
import { useVersionesEliminadasCard } from '../../hooks/useVersionesEliminadasCard'
import {
    DocumentoEliminadoActions,
    DocumentoEliminadoHeader,
    VersionesList,
} from './components'

// Tipo extendido con relación usuario (FK join)
type DocumentoConUsuario = DocumentoProyecto & {
  usuario?: {
    nombres: string
    apellidos: string
    email: string
  }
}

interface DocumentoEliminadoCardProps {
  documento: DocumentoConUsuario
  onRestaurarTodo: (id: string, titulo: string) => void
  onEliminarDefinitivo: (id: string, titulo: string) => void
  restaurando: boolean
  eliminando: boolean
}

/**
 * Card orquestador: Delega UI a sub-componentes, maneja lógica con hook
 * - DocumentoEliminadoHeader: Título + metadata + botón expandir
 * - VersionesList: Lista expandible con selección múltiple
 * - DocumentoEliminadoActions: Botones restaurar/eliminar
 */
export function DocumentoEliminadoCard({
  documento,
  onRestaurarTodo,
  onEliminarDefinitivo,
  restaurando,
  eliminando,
}: DocumentoEliminadoCardProps) {
  const {
    isExpanded,
    versiones,
    versionesSeleccionadas,
    isLoading,
    stats,
    toggleExpansion,
    toggleVersion,
    seleccionarTodas,
    limpiarSeleccion,
    restaurarSeleccionadas,
    confirmarRestaurar,
    isRestaurando,
    modalRestaurar,
    setModalRestaurar,
  } = useVersionesEliminadasCard({
    documentoId: documento.id,
    documentoTitulo: documento.titulo,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <DocumentoEliminadoHeader
        documento={documento}
        isExpanded={isExpanded}
        onToggle={toggleExpansion}
      />

      {/* Lista de versiones expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <VersionesList
              versiones={versiones}
              isLoading={isLoading}
              seleccionadas={versionesSeleccionadas}
              onVersionToggle={toggleVersion}
              onSelectAll={seleccionarTodas}
              onDeselectAll={limpiarSeleccion}
              onRestoreSelected={restaurarSeleccionadas}
              totalVersiones={stats.totalVersiones}
              isRestoring={isRestaurando}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botones de acción */}
      <DocumentoEliminadoActions
        onRestore={() => onRestaurarTodo(documento.id, documento.titulo)}
        onDelete={() => onEliminarDefinitivo(documento.id, documento.titulo)}
        isRestoring={restaurando}
        isDeleting={eliminando}
      />

      {/* 🆕 Modal: Confirmar restaurar versiones seleccionadas */}
      <ConfirmacionModal
        isOpen={modalRestaurar.isOpen}
        onClose={() => setModalRestaurar({ isOpen: false, cantidad: 0, mensaje: '' })}
        onConfirm={confirmarRestaurar}
        variant="success"
        title="¿Restaurar versiones seleccionadas?"
        message={
          <>
            <p className="mb-2">{modalRestaurar.mensaje}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Las versiones restauradas volverán a estar disponibles.
            </p>
          </>
        }
        confirmText={`Restaurar ${modalRestaurar.cantidad} versión${modalRestaurar.cantidad !== 1 ? 'es' : ''}`}
        isLoading={isRestaurando}
        loadingText="Restaurando..."
      />
    </motion.div>
  )
}
