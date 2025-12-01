'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FileCheck, Info, Loader2 } from 'lucide-react'
import { ReactNode, RefObject } from 'react'
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import { ArchivoSelector } from './ArchivoSelector'
import { CategoriaSelect } from './CategoriaSelect'
import { DescripcionTextarea } from './DescripcionTextarea'
import { FechasInputs } from './FechasInputs'
import { ImportanteToggle } from './ImportanteToggle'
import { TituloInput } from './TituloInput'

interface CategoriaDocumento {
  id: string
  nombre: string
  descripcion?: string | null
}

interface DocumentoFormBaseProps {
  mode: 'create' | 'edit'
  moduleName?: ModuleName

  // Estado de archivo (solo para mode='create')
  archivoSeleccionado?: File | null
  errorArchivo?: string | null
  isDragging?: boolean
  fileInputRef?: RefObject<HTMLInputElement>

  // Datos del formulario
  categorias: CategoriaDocumento[]
  isSubmitting: boolean
  esDocumentoIdentidad?: boolean // ✅ Para deshabilitar categoría
  categoriaIdentidad?: CategoriaDocumento | undefined // ✅ Categoría auto-seleccionada

  // React Hook Form
  register: UseFormRegister<any>
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> // Ya wrapeado
  errors: FieldErrors
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>

  // Handlers de archivo (solo para mode='create')
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void
  onFileInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLimpiarArchivo?: () => void

  // Handlers de formulario
  onCancel?: () => void

  // Campos específicos del módulo (inyectados entre categoría y fechas)
  extraFields?: ReactNode

  // Textos personalizables
  submitButtonText?: string
  submittingButtonText?: string
}

export function DocumentoFormBase({
  mode,
  moduleName = 'proyectos',
  archivoSeleccionado,
  errorArchivo,
  isDragging = false,
  fileInputRef,
  categorias,
  isSubmitting,
  esDocumentoIdentidad = false,
  categoriaIdentidad,
  register,
  handleSubmit,
  errors,
  setValue,
  watch,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onLimpiarArchivo,
  onCancel,
  extraFields,
  submitButtonText = 'Subir documento',
  submittingButtonText = 'Subiendo...',
}: DocumentoFormBaseProps) {
  const theme = moduleThemes[moduleName]
  const categoriaId = watch('categoria_id') || ''
  const titulo = watch('titulo')
  const descripcion = watch('descripcion')

  const showArchivoSelector = mode === 'create'
  const showFormFields = mode === 'edit' || (mode === 'create' && archivoSeleccionado)

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* ZONA DE ARCHIVO - Solo en creación */}
      {showArchivoSelector && fileInputRef && onDragOver && onDragLeave && onDrop && onFileInputChange && onLimpiarArchivo && (
        <ArchivoSelector
          moduleName={moduleName}
          archivoSeleccionado={archivoSeleccionado || null}
          errorArchivo={errorArchivo || null}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onFileInputChange={onFileInputChange}
          onLimpiarArchivo={onLimpiarArchivo}
        />
      )}

      {/* FORMULARIO DE METADATOS */}
      <AnimatePresence>
        {showFormFields && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-0"
          >
            {/* Card única con todo el formulario */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 shadow-lg space-y-3"
            >
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  'bg-gradient-to-br',
                  theme.classes.gradient.primary
                )}>
                  <Info className="w-4 h-4 text-white" />
                </div>
                <h3 className={cn(
                  'text-sm font-semibold',
                  theme.classes.text.primary
                )}>
                  Información del Documento
                </h3>
              </div>

              {/* Título */}
              <TituloInput
                moduleName={moduleName}
                register={register}
                errors={errors}
                value={titulo}
              />

              {/* Descripción */}
              <DescripcionTextarea
                moduleName={moduleName}
                register={register}
                errors={errors}
                value={descripcion}
                rows={2}
              />

              {/* Grid: Categoría + Importante */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <CategoriaSelect
                  moduleName={moduleName}
                  categorias={categorias}
                  value={categoriaId}
                  onChange={(value) => setValue('categoria_id', value)}
                  errors={errors}
                  disabled={esDocumentoIdentidad} // ✅ Deshabilitar si es documento de identidad
                  helperText={esDocumentoIdentidad && categoriaIdentidad ? `Categoría: ${categoriaIdentidad.nombre}` : undefined}
                />

                <ImportanteToggle
                  moduleName={moduleName}
                  register={register}
                  watch={watch}
                />
              </div>

              {/* 🔥 CAMPOS ESPECÍFICOS DEL MÓDULO (inyectados) */}
              {extraFields}

              {/* Fechas */}
              <FechasInputs
                moduleName={moduleName}
                register={register}
                errors={errors}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTONES FOOTER */}
      {showFormFields && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={
              (mode === 'create' && !archivoSeleccionado) || isSubmitting
            }
            className={cn(
              'px-6 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              theme.classes.button.primary
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {submittingButtonText}
              </>
            ) : (
              <>
                <FileCheck size={16} />
                {submitButtonText}
              </>
            )}
          </button>
        </motion.div>
      )}
    </motion.form>
  )
}
