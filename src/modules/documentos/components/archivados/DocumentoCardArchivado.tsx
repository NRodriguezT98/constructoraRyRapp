'use client'

/**
 * 📦 COMPONENTE: Card de Documento Archivado
 *
 * Card compacto para documentos archivados con información completa
 * - Motivo de archivado + observaciones
 * - Usuario que archivó + fecha
 * - Acciones: Ver, Restaurar
 */

import { motion } from 'framer-motion'
import { Calendar, Eye, FileText, HardDrive, RefreshCw } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import type { DocumentoProyecto } from '@/types/documento.types'
import { formatFileSize, getFileExtension, getFileIcon } from '@/types/documento.types'

interface DocumentoCardArchivadoProps {
  documento: DocumentoProyecto
  onRestaurar: () => void
  onView?: (documento: DocumentoProyecto) => void
  moduleName?: ModuleName
}

export function DocumentoCardArchivado({
  documento,
  onRestaurar,
  onView,
  moduleName = 'proyectos',
}: DocumentoCardArchivadoProps) {
  const theme = moduleThemes[moduleName]
  const extension = getFileExtension(documento.nombre_original)
  const FileIcon = getFileIcon(extension)

  // Extraer datos del documento
  const motivoCategoria = documento.motivo_categoria
  const motivoDetalle = documento.motivo_detalle
  const fechaActualizacion = documento.fecha_actualizacion // Fecha cuando se archivó

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="space-y-3">
        {/* Header: Icono + Título + Botones */}
        <div className="flex items-start justify-between gap-4">
          {/* Icono del archivo */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${theme.classes.bg.light} flex items-center justify-center`}>
            <FileIcon className={`w-6 h-6 ${theme.classes.text.primary}`} />
          </div>

          {/* Título y metadata básica */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {documento.titulo}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {formatFileSize(documento.tamano_bytes)}
              </span>
              <span className="font-medium uppercase">{extension}</span>
              {documento.version > 1 && (
                <span className="text-purple-600 dark:text-purple-400 font-medium">v{documento.version}</span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                Archivado
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Botón Ver */}
            {onView && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onView(documento)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200"
                title="Ver documento"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Ver</span>
              </motion.button>
            )}

            {/* Botón Restaurar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestaurar}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${theme.classes.button.primary} text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <RefreshCw className="w-4 h-4" />
              Restaurar
            </motion.button>
          </div>
        </div>

        {/* Motivo de archivado */}
        {motivoCategoria && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  Motivo de archivado:
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  {motivoCategoria}
                </p>
                {motivoDetalle && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 italic">
                    "{motivoDetalle}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer: Fecha archivado */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Archivado: {formatDateCompact(fechaActualizacion)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
