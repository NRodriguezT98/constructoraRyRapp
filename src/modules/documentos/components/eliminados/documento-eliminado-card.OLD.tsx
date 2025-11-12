/**
 * Card individual de documento eliminado con expansión de versiones
 */

'use client'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatFileSize } from '@/lib/utils/format.utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Folder,
  Loader2,
  RotateCcw,
  Trash2,
  User,
} from 'lucide-react'
import { useVersionesEliminadasCard } from '../../hooks/useVersionesEliminadasCard'

interface DocumentoEliminadoCardProps {
  documento: any // Usar any temporalmente para las relaciones proyectos/usuarios
  onRestaurarTodo: (id: string, titulo: string) => void
  onEliminarDefinitivo: (id: string, titulo: string) => void
  restaurando: boolean
  eliminando: boolean
}

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
    isRestaurando,
  } = useVersionesEliminadasCard({
    documentoId: documento.id,
    documentoTitulo: documento.titulo,
  })

  const tieneVersiones = documento.version > 1

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 space-y-3">
        {/* Header: Título + Badge + Botón Expandir */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {documento.titulo}
              </h3>
              {/* Badge de versión */}
              {tieneVersiones && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-semibold text-blue-700 dark:text-blue-400 flex-shrink-0">
                  v{documento.version}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Folder className="w-3 h-3" />
              <span className="truncate">{documento.proyectos?.nombre}</span>
            </div>
          </div>

          {/* Botón expandir (solo si tiene versiones) */}
          {tieneVersiones && (
            <button
              onClick={toggleExpansion}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isExpanded ? 'Colapsar versiones' : 'Expandir versiones'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}

          {/* Badge de categoría */}
          {documento.categoria && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
              {documento.categoria.nombre}
            </span>
          )}
        </div>

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
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {/* Header de versiones */}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    📋 Versiones eliminadas ({stats.totalVersiones})
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={seleccionarTodas}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Todas
                    </button>
                    <span className="text-xs text-gray-400">|</span>
                    <button
                      onClick={limpiarSeleccion}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Nota informativa */}
                <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <FileText className="w-3 h-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Todas estas versiones están <span className="font-semibold">eliminadas</span>. Selecciona las que deseas restaurar.
                  </p>
                </div>

                {/* Loading state */}
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}

                {/* Lista de versiones */}
                {!isLoading && versiones.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {versiones.map((version) => (
                      <label
                        key={version.id}
                        className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all"
                      >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <div className="relative flex items-center justify-center w-4 h-4 mt-0.5 flex-shrink-0">
                              <input
                                type="checkbox"
                                checked={versionesSeleccionadas.has(version.id)}
                                onChange={() => toggleVersion(version.id)}
                                className="sr-only"
                              />
                              <div
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                  versionesSeleccionadas.has(version.id)
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                }`}
                              >
                                {versionesSeleccionadas.has(version.id) && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                            </div>

                            {/* Información de la versión */}
                            <div className="flex-1 min-w-0 space-y-1">
                              {/* Título */}
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  v{version.version}: {version.titulo}
                                </p>
                                {version.es_version_actual && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex-shrink-0">
                                    última versión
                                  </span>
                                )}
                              </div>

                              {/* Metadata en grid compacto */}
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {/* Fecha del documento */}
                                {version.fecha_documento && (
                                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                                      Fecha documento:
                                    </span>
                                    <span className="truncate">
                                      {formatDateCompact(version.fecha_documento)}
                                    </span>
                                  </div>
                                )}

                                {/* Fecha de subida */}
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                                    Fecha de subida:
                                  </span>
                                  <span className="truncate">
                                    {formatDateCompact(version.fecha_creacion)}
                                  </span>
                                </div>

                                {/* Usuario que subió */}
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                  <User className="w-3 h-3 flex-shrink-0" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                                    Subido por:
                                  </span>
                                  <span className="truncate">
                                    {(version as any).usuario?.nombres || version.subido_por}{' '}
                                    {(version as any).usuario?.apellidos || ''}
                                  </span>
                                </div>

                                {/* Tamaño del archivo */}
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                  <FileText className="w-3 h-3 flex-shrink-0" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                                    Tamaño:
                                  </span>
                                  <span>{formatFileSize(version.tamano_bytes)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                )}

                {/* Botón restaurar seleccionadas */}
                {stats.seleccionadas > 0 && (
                  <button
                    onClick={restaurarSeleccionadas}
                    disabled={isRestaurando}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium transition-colors"
                  >
                    {isRestaurando ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Restaurar Seleccionadas ({stats.seleccionadas})
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metadata: Fechas + Usuario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Eliminado: {formatDateCompact(documento.fecha_actualizacion)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <User className="w-3 h-3" />
            <span className="truncate">
              {documento.usuarios?.nombres} {documento.usuarios?.apellidos}
            </span>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onRestaurarTodo(documento.id, documento.titulo)}
            disabled={restaurando || eliminando}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium transition-colors"
          >
            {restaurando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Restaurar Todo
          </button>
          <button
            onClick={() => onEliminarDefinitivo(documento.id, documento.titulo)}
            disabled={restaurando || eliminando}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium transition-colors"
          >
            {eliminando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Eliminar Definitivo
          </button>
        </div>
      </div>
    </motion.div>
  )
}
