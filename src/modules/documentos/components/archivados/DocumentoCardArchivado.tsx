'use client'

/**
 * 📦 COMPONENTE: Card de Documento Archivado
 *
 * Card compacto para documentos archivados
 * - Vista horizontal simplificada
 * - Acción principal: Restaurar
 * - Info básica: título, fecha, tamaño
 */

import { motion } from 'framer-motion'
import { Calendar, HardDrive, RefreshCw } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import type { DocumentoProyecto } from '@/types/documento.types'
import { formatFileSize, getFileExtension, getFileIcon } from '@/types/documento.types'

interface DocumentoCardArchivadoProps {
  documento: DocumentoProyecto
  onRestaurar: () => void
  moduleName?: ModuleName
}

export function DocumentoCardArchivado({
  documento,
  onRestaurar,
  moduleName = 'proyectos',
}: DocumentoCardArchivadoProps) {
  const theme = moduleThemes[moduleName]
  const extension = getFileExtension(documento.nombre_original)
  const FileIcon = getFileIcon(extension)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Icono del archivo */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${theme.classes.bg.light} flex items-center justify-center`}>
          <FileIcon className={`w-6 h-6 ${theme.classes.text.primary}`} />
        </div>

        {/* Información del documento */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {documento.titulo}
          </h4>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateCompact(documento.fecha_creacion)}
            </span>
            {documento.tamano_bytes && (
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {formatFileSize(documento.tamano_bytes)}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
              Archivado
            </span>
          </div>
        </div>

        {/* Botón Restaurar */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestaurar}
          className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg ${theme.classes.button.primary} text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300`}
        >
          <RefreshCw className="w-4 h-4" />
          Restaurar
        </motion.button>
      </div>
    </motion.div>
  )
}
