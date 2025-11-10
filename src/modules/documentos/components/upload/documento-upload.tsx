'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ChevronDown,
    FileCheck,
    FileText,
    Folder,
    Loader2,
    Star,
    Tag,
    Upload,
    X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'
import { formatFileSize, getFileExtension } from '../../../../types/documento.types'
import { useDocumentoUpload } from '../../hooks'
import { CategoriaDocumento } from '../../types'
import { EtiquetasInput } from '../shared/etiquetas-input'

// ============================================
// COMPONENTE: Select Personalizado de Categorías
// ============================================
interface CategoriaSelectProps {
  categorias: CategoriaDocumento[]
  value: string
  onChange: (value: string) => void
  error?: boolean
}

function CategoriaSelect({ categorias, value, onChange, error }: CategoriaSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const categoriaSeleccionada = categorias.find(c => c.id === value)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      {/* Botón del select */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all text-left flex items-center justify-between',
          'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent',
          error
            ? 'border-red-500 dark:border-red-500'
            : 'border-gray-200 dark:border-gray-700'
        )}
      >
        <div className="flex-1 min-w-0">
          {categoriaSeleccionada ? (
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {categoriaSeleccionada.nombre}
              </div>
              {categoriaSeleccionada.descripcion && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {categoriaSeleccionada.descripcion}
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Sin categoría</span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={cn(
            'ml-2 flex-shrink-0 transition-transform text-gray-400',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
          >
            {/* Opción "Sin categoría" */}
            <button
              type="button"
              onClick={() => {
                onChange('')
                setIsOpen(false)
              }}
              className={cn(
                'w-full px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                !value && 'bg-green-50 dark:bg-green-900/20'
              )}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                Sin categoría
              </div>
            </button>

            {/* Lista de categorías */}
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                onClick={() => {
                  onChange(categoria.id)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full px-2.5 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-t border-gray-100 dark:border-gray-700',
                  value === categoria.id && 'bg-green-50 dark:bg-green-900/20'
                )}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {categoria.nombre}
                </div>
                {categoria.descripcion && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-tight">
                    {categoria.descripcion}
                  </div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface DocumentoUploadProps {
  proyectoId: string
  onSuccess?: () => void
  onCancel?: () => void
  moduleName?: ModuleName // 🎨 Tema del módulo
}

export function DocumentoUpload({
  proyectoId,
  onSuccess,
  onCancel,
  moduleName = 'proyectos', // 🎨 Default a proyectos
}: DocumentoUploadProps) {
  // 🎨 Obtener tema dinámico
  const theme = moduleThemes[moduleName]
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
    watch,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleClickSelectFile,
    limpiarArchivo,
  } = useDocumentoUpload({ proyectoId, onSuccess })

  const categoriaId = watch('categoria_id') || ''

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* ZONA DE ARCHIVO - Compacta */}
      {!archivoSeleccionado ? (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300',
            isDragging
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-[1.01]'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500',
            errorArchivo && 'border-red-500 bg-red-50 dark:bg-red-900/20'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.zip,.rar,.txt"
          />

          <motion.div
            animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
            className="space-y-3"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Upload size={32} className="text-white" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra un archivo o haz clic'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PDF, imágenes, Office, CAD (máx. 50 MB)
              </p>
            </div>
          </motion.div>

          {errorArchivo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-2 text-red-600 dark:text-red-400"
            >
              <AlertCircle size={14} />
              <span className="text-xs font-medium">{errorArchivo}</span>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Preview compacto del archivo */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {archivoSeleccionado.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                <span>{formatFileSize(archivoSeleccionado.size)}</span>
                <span>•</span>
                <span className="uppercase">{getFileExtension(archivoSeleccionado.name)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={limpiarArchivo}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <X size={16} className="text-red-600 dark:text-red-400" />
            </button>
          </div>
        </motion.div>
      )}

      {/* LAYOUT RESPONSIVE - 1 columna móvil, 2 columnas tablet/desktop */}
      <AnimatePresence>
        {archivoSeleccionado && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* COLUMNA IZQUIERDA: Información Principal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 shadow-lg space-y-4"
            >
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Información del Documento
                </h3>
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Título del documento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('titulo')}
                    type="text"
                    placeholder="Ej: Licencia de Construcción 2024"
                    maxLength={200}
                    className={cn(
                      'w-full px-3 py-2 pr-9 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all',
                      'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent',
                      errors.titulo
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                  />
                  {/* Indicador de estado */}
                  {register('titulo') && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {errors.titulo ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
                {errors.titulo && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {errors.titulo.message}
                  </motion.p>
                )}
                {!errors.titulo && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mínimo 3 caracteres, máximo 200
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Descripción
                </label>
                <div className="relative">
                  <textarea
                    {...register('descripcion')}
                    rows={3}
                    placeholder="Descripción opcional del documento..."
                    maxLength={1000}
                    className={cn(
                      'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all resize-none',
                      'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent',
                      errors.descripcion
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                  />
                  {/* Indicador de estado */}
                  {register('descripcion') && (
                    <div className="absolute right-2.5 top-2.5">
                      {errors.descripcion ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
                {errors.descripcion && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {errors.descripcion.message}
                  </motion.p>
                )}
                {!errors.descripcion && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Opcional, máximo 1000 caracteres
                  </p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Folder size={14} />
                  Categoría
                </label>

                <CategoriaSelect
                  categorias={categorias}
                  value={categoriaId}
                  onChange={(value) => setValue('categoria_id', value)}
                  error={!!errors.categoria_id}
                />

                {errors.categoria_id && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {errors.categoria_id.message}
                  </motion.p>
                )}
                {!errors.categoria_id && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Categoriza el documento para mejor organización
                  </p>
                )}
              </div>
            </motion.div>

            {/* COLUMNA DERECHA: Fechas, Etiquetas y Opciones */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 shadow-lg space-y-4"
            >
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Fechas y Opciones
                </h3>
              </div>

              {/* Fechas en grid responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Fecha del documento */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Fecha del documento
                  </label>
                  <input
                    {...register('fecha_documento')}
                    type="date"
                    className={cn(
                      'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all',
                      'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent',
                      errors.fecha_documento
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                  />
                  {errors.fecha_documento && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.fecha_documento.message}
                    </motion.p>
                  )}
                </div>

                {/* Fecha de vencimiento */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    Vencimiento
                  </label>
                  <input
                    {...register('fecha_vencimiento')}
                    type="date"
                    className={cn(
                      'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all',
                      'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent',
                      errors.fecha_vencimiento
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                  />
                  {errors.fecha_vencimiento && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.fecha_vencimiento.message}
                    </motion.p>
                  )}
                  {!errors.fecha_vencimiento && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      ℹ️ Solo si expira
                    </p>
                  )}
                </div>
              </div>

              {/* Etiquetas */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Tag size={14} />
                  Etiquetas
                </label>
                <EtiquetasInput
                  value={etiquetas}
                  onChange={(nuevasEtiquetas) => setValue('etiquetas', nuevasEtiquetas)}
                />
                {errors.etiquetas && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {errors.etiquetas.message}
                  </motion.p>
                )}
              </div>

              {/* Marcar como importante */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="relative">
                    <input
                      {...register('es_importante')}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star
                      size={16}
                      className={cn(
                        'transition-colors',
                        esImportante
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-400'
                      )}
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Marcar como importante
                    </span>
                  </div>
                </label>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTONES FOOTER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={subiendoDocumento}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={!archivoSeleccionado || subiendoDocumento}
          className={cn(
            'px-6 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2',
            'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
            'disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30'
          )}
        >
          {subiendoDocumento ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <FileCheck size={16} />
              Subir documento
            </>
          )}
        </button>
      </motion.div>
    </motion.form>
  )
}
