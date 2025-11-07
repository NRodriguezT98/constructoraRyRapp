/**
 * ============================================
 * COMPONENTE: DocumentoUploadVivienda
 * ============================================
 * Componente presentacional puro para subir documentos de vivienda
 * SOLO UI - Toda la lógica está en useDocumentoUploadVivienda
 */

'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, FileText, FolderOpen, Upload, X } from 'lucide-react'
import { useCategoriasSistemaViviendas } from '../../hooks'
import { useDocumentoUploadVivienda } from '../../hooks/useDocumentoUploadVivienda'

interface DocumentoUploadViviendaProps {
  viviendaId: string
  onSuccess: () => void
  onCancel: () => void
  categoriaPreseleccionada?: string // Nombre de categoría a pre-seleccionar
  bloquearCategoria?: boolean // Si true, no permite cambiar la categoría
  documentoIdReemplazar?: string // Si se proporciona, crea nueva versión de este documento
}

export function DocumentoUploadVivienda({
  viviendaId,
  onSuccess,
  onCancel,
  categoriaPreseleccionada,
  bloquearCategoria = false,
  documentoIdReemplazar,
}: DocumentoUploadViviendaProps) {
  const {
    // Estados
    selectedFile,
    selectedCategoria,
    titulo,
    descripcion,
    uploading,
    error,

    // Handlers
    handleFileSelect,
    handleCategoriaChange,
    handleTituloChange,
    handleDescripcionChange,
    handleSubmit,
    removeSelectedFile,
  } = useDocumentoUploadVivienda({
    viviendaId,
    onSuccess,
    categoriaPreseleccionada,
  })

  const { categoriasSistema, isLoading: loadingCategorias } = useCategoriasSistemaViviendas()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-orange-200 bg-white p-4 shadow-sm dark:border-orange-800 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2.5">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-50 dark:border-orange-700 dark:bg-gray-700 dark:text-orange-300 dark:hover:bg-gray-600"
            type="button"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a Documentos</span>
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Subir Documento
        </h2>
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Sube certificados, planos, escrituras y otros documentos de la vivienda
        </p>
      </div>

      {/* Formulario */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error general */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Selección de archivo */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Archivo
            </label>
            {!selectedFile ? (
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`
                    group flex cursor-pointer flex-col items-center justify-center gap-3
                    rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8
                    transition-all hover:border-orange-500 hover:bg-orange-50
                    dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-orange-600 dark:hover:bg-orange-950/30
                    ${uploading ? 'pointer-events-none opacity-50' : ''}
                  `}
                >
                  <div className="rounded-full bg-orange-100 p-4 group-hover:bg-orange-200 dark:bg-orange-900/30 dark:group-hover:bg-orange-900/50">
                    <Upload className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Haz clic para seleccionar un archivo
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PDF, JPG o PNG • Máx. 10MB
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600 text-white shadow-lg">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="categoria" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Categoría {bloquearCategoria && <span className="text-orange-600">(Pre-seleccionada)</span>}
            </label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <select
                id="categoria"
                value={selectedCategoria}
                onChange={handleCategoriaChange}
                className="w-full rounded-lg border-2 border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-orange-600"
                disabled={uploading || loadingCategorias || bloquearCategoria}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categoriasSistema.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            {bloquearCategoria ? (
              <p className="mt-1.5 text-xs text-orange-600 dark:text-orange-400 font-medium">
                🔒 Esta categoría está bloqueada para este documento
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                💡 Si el nombre del archivo coincide con una categoría, se asignará automáticamente
              </p>
            )}
          </div>

          {/* Título */}
          <div>
            <label htmlFor="titulo" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Título del documento
            </label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={handleTituloChange}
              placeholder="Ej: Certificado de Tradición 2024"
              className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-orange-600"
              disabled={uploading}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={handleDescripcionChange}
              placeholder="Información adicional sobre el documento..."
              rows={3}
              className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-orange-600"
              disabled={uploading}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-orange-700 hover:to-amber-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              disabled={uploading || !selectedFile || !selectedCategoria || !titulo}
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Subir Documento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
