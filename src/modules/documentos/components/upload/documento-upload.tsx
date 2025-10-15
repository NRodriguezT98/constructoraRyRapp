'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    Calendar,
    FileCheck,
    FileText,
    Loader2,
    Star,
    Upload,
    X,
} from 'lucide-react'
import { formatFileSize, getFileExtension } from '../../../../types/documento.types'
import { useDocumentoUpload } from '../../hooks'
import { EtiquetasInput } from '../shared/etiquetas-input'

interface DocumentoUploadProps {
  proyectoId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function DocumentoUpload({
  proyectoId,
  onSuccess,
  onCancel,
}: DocumentoUploadProps) {
  const {
    isDragging,
    archivoSeleccionado,
    errorArchivo,
    subiendoDocumento,
    categorias,
    etiquetas,
    esImportante,
    fileInputRef,
    register,
    handleSubmit,
    errors,
    setValue,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleClickSelectFile,
    limpiarArchivo,
  } = useDocumentoUpload({ proyectoId, onSuccess })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Zona de subida de archivo */}
      {!archivoSeleccionado ? (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300
            ${isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
            }
            ${errorArchivo ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.zip,.rar,.txt"
          />

          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            className="space-y-4"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Upload size={40} className="text-white" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra un archivo o haz clic'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                PDF, imágenes, Office, CAD, archivos comprimidos
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Tamaño máximo: 50 MB
              </p>
            </div>
          </motion.div>

          {errorArchivo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 text-red-600 dark:text-red-400"
            >
              <AlertCircle size={16} />
              <span className="text-sm font-medium">{errorArchivo}</span>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Preview del archivo seleccionado */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={24} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                {archivoSeleccionado.name}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <span>{formatFileSize(archivoSeleccionado.size)}</span>
                <span>•</span>
                <span className="uppercase">{getFileExtension(archivoSeleccionado.name)}</span>
                <span>•</span>
                <span>{archivoSeleccionado.type || 'Tipo desconocido'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={limpiarArchivo}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <X size={20} className="text-red-600 dark:text-red-400" />
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {archivoSeleccionado && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título del documento *
              </label>
              <input
                {...register('titulo')}
                type="text"
                placeholder="Ej: Licencia de Construcción 2024"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.titulo.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                {...register('descripcion')}
                rows={3}
                placeholder="Descripción opcional del documento..."
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all resize-none"
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.descripcion.message}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                {...register('categoria_id')}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
              >
                <option value="">Sin categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {errors.categoria_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.categoria_id.message}
                </p>
              )}
            </div>

            {/* Etiquetas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Etiquetas
              </label>
              <EtiquetasInput
                value={etiquetas}
                onChange={(nuevasEtiquetas) => setValue('etiquetas', nuevasEtiquetas)}
              />
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Fecha del documento
                </label>
                <input
                  {...register('fecha_documento')}
                  type="date"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Fecha de vencimiento
                </label>
                <input
                  {...register('fecha_vencimiento')}
                  type="date"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Importante */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    {...register('es_importante')}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </div>
                <div className="flex items-center gap-2">
                  <Star
                    size={18}
                    className={`transition-colors ${esImportante
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-400'
                      }`}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Marcar como importante
                  </span>
                </div>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={subiendoDocumento}
          className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={!archivoSeleccionado || subiendoDocumento}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {subiendoDocumento ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <FileCheck size={18} />
              Subir documento
            </>
          )}
        </button>
      </div>
    </form>
  )
}
