/**
 * Card individual de documento eliminado (REFACTORIZADO)
 * Componente orquestador que usa sub-componentes especializados
 */

'use client'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { DocumentoProyecto } from '@/modules/documentos/types/documento.types'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, FileText, User } from 'lucide-react'
import { useVersionesEliminadasCard } from '../../hooks/useVersionesEliminadasCard'
import { DocumentoEliminadoActions, VersionesList } from './components'

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
  modulo: 'proyectos' | 'viviendas' | 'clientes'
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
  modulo,
  onRestaurarTodo,
  onEliminarDefinitivo,
  restaurando,
  eliminando,
}: DocumentoEliminadoCardProps) {
  const {
    isExpanded,
    versiones,
    isLoading,
    stats,
    toggleExpansion,
  } = useVersionesEliminadasCard({
    documentoId: documento.id,
    documentoTitulo: documento.titulo,
    modulo: modulo,
  })

  return (
    <>
      {/* Header interno (contenido del documento) */}
      <div className="p-4 flex items-start gap-3">
        {/* Icono */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <FileText className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                {documento.titulo}
              </h3>

              {/* Metadata organizada con labels explícitos */}
              <div className="space-y-1.5 mt-2">
                {/* Versión */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800">
                    Versión {documento.version}
                  </span>
                </div>

                {/* Fecha de creación del documento */}
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  <span className="font-semibold">Documento creado:</span>
                  <span>{formatDateCompact(documento.fecha_documento)}</span>
                </div>

                {/* Usuario que subió el documento */}
                {documento.usuario && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span className="font-semibold">Subido por:</span>
                    <span>{documento.usuario.nombres} {documento.usuario.apellidos}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón expandir versiones */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleExpansion}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              aria-label={isExpanded ? 'Contraer versiones' : 'Ver versiones'}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Lista de versiones expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
          >
            <VersionesList
              versiones={versiones}
              modulo={modulo}
              isLoading={isLoading}
              seleccionadas={new Set()}
              onVersionToggle={() => {}}
              onSelectAll={() => {}}
              onDeselectAll={() => {}}
              onRestoreSelected={() => {}}
              totalVersiones={stats.totalVersiones}
              isRestoring={false}
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
    </>
  )
}
