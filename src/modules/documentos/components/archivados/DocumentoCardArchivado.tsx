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
import type { DocumentoProyecto } from '@/modules/documentos/types/documento.types'
import {
  formatFileSize,
  getFileExtension,
  getFileIcon,
} from '@/modules/documentos/types/documento.types'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

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
      className='group relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 p-4 backdrop-blur-xl transition-all duration-300 hover:shadow-lg dark:border-gray-700/50 dark:bg-gray-800/80'
    >
      <div className='space-y-3'>
        {/* Header: Icono + Título + Botones */}
        <div className='flex items-start justify-between gap-4'>
          {/* Icono del archivo */}
          <div
            className={`h-12 w-12 flex-shrink-0 rounded-lg ${theme.classes.bg.light} flex items-center justify-center`}
          >
            <FileIcon className={`h-6 w-6 ${theme.classes.text.primary}`} />
          </div>

          {/* Título y metadata básica */}
          <div className='min-w-0 flex-1'>
            <h4 className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
              {documento.titulo}
            </h4>
            <div className='mt-1 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400'>
              <span className='flex items-center gap-1'>
                <HardDrive className='h-3 w-3' />
                {formatFileSize(documento.tamano_bytes)}
              </span>
              <span className='font-medium uppercase'>{extension}</span>
              {documento.version > 1 && (
                <span className='font-medium text-purple-600 dark:text-purple-400'>
                  v{documento.version}
                </span>
              )}
              <span className='rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>
                Archivado
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className='flex flex-shrink-0 items-center gap-2'>
            {/* Botón Ver */}
            {onView && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onView(documento)}
                className='inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                title='Ver documento'
              >
                <Eye className='h-4 w-4' />
                <span className='hidden sm:inline'>Ver</span>
              </motion.button>
            )}

            {/* Botón Restaurar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestaurar}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 ${theme.classes.button.primary} font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl`}
            >
              <RefreshCw className='h-4 w-4' />
              Restaurar
            </motion.button>
          </div>
        </div>

        {/* Motivo de archivado */}
        {motivoCategoria && (
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30'>
            <div className='flex items-start gap-2'>
              <FileText className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400' />
              <div className='min-w-0 flex-1'>
                <p className='mb-1 text-xs font-semibold text-amber-900 dark:text-amber-200'>
                  Motivo de archivado:
                </p>
                <p className='text-sm font-medium text-amber-800 dark:text-amber-300'>
                  {motivoCategoria}
                </p>
                {motivoDetalle && (
                  <p className='mt-2 text-xs italic text-amber-700 dark:text-amber-400'>
                    &quot;{motivoDetalle}&quot;
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer: Fecha archivado */}
        <div className='flex items-center gap-4 border-t border-gray-200 pt-2 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400'>
          <span className='flex items-center gap-1.5'>
            <Calendar className='h-3.5 w-3.5' />
            Archivado: {formatDateCompact(fechaActualizacion)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
