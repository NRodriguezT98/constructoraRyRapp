'use client'

import type { BaseSyntheticEvent, ReactNode, RefObject } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { FileCheck, Info, Loader2 } from 'lucide-react'
import type {
  FieldErrors,
  Path,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import { ArchivoSelector } from './ArchivoSelector'
import { CategoriaSelect } from './CategoriaSelect'
import { DescripcionTextarea } from './DescripcionTextarea'
import type {
  CategoriaDocumentoBase,
  DocumentoFormValuesBase,
} from './documento-form.types'
import { FechasInputs } from './FechasInputs'
import { ImportanteToggle } from './ImportanteToggle'
import { TituloInput } from './TituloInput'

interface DocumentoFormBaseProps<TFormValues extends DocumentoFormValuesBase> {
  mode: 'create' | 'edit'
  moduleName?: ModuleName

  // Estado de archivo (solo para mode='create')
  archivoSeleccionado?: File | null
  errorArchivo?: string | null
  isDragging?: boolean
  fileInputRef?: RefObject<HTMLInputElement | null>

  // Datos del formulario
  categorias: CategoriaDocumentoBase[]
  isSubmitting: boolean
  esDocumentoIdentidad?: boolean // ✅ Para deshabilitar categoría
  categoriaIdentidad?: CategoriaDocumentoBase | undefined // ✅ Categoría auto-seleccionada
  categoriaBloqueada?: boolean // ✅ Para bloquear categoría (requisitos de fuentes)

  // React Hook Form
  register: UseFormRegister<TFormValues>
  handleSubmit: (e?: BaseSyntheticEvent) => Promise<void> // Ya wrapeado
  errors: FieldErrors<TFormValues>
  setValue: UseFormSetValue<TFormValues>
  watch: UseFormWatch<TFormValues>

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

export function DocumentoFormBase<TFormValues extends DocumentoFormValuesBase>({
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
  categoriaBloqueada = false,
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
}: DocumentoFormBaseProps<TFormValues>) {
  const theme = moduleThemes[moduleName]
  const categoriaIdField = 'categoria_id' as Path<TFormValues>
  const tituloField = 'titulo' as Path<TFormValues>
  const descripcionField = 'descripcion' as Path<TFormValues>
  const categoriaId = (watch(categoriaIdField) as string | undefined) ?? ''
  const titulo = (watch(tituloField) as string | undefined) ?? ''
  const descripcion = (watch(descripcionField) as string | undefined) ?? ''

  const showArchivoSelector = mode === 'create'
  const showFormFields =
    mode === 'edit' || (mode === 'create' && archivoSeleccionado)

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className='space-y-4'
    >
      {/* ZONA DE ARCHIVO - Solo en creación */}
      {showArchivoSelector &&
        fileInputRef &&
        onDragOver &&
        onDragLeave &&
        onDrop &&
        onFileInputChange &&
        onLimpiarArchivo && (
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
            className='space-y-0'
          >
            {/* Card única con todo el formulario */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-3 rounded-xl border border-gray-200/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'
            >
              {/* Header */}
              <div className='flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700'>
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    'bg-gradient-to-br',
                    theme.classes.gradient.primary
                  )}
                >
                  <Info className='h-4 w-4 text-white' />
                </div>
                <h3
                  className={cn(
                    'text-sm font-semibold',
                    theme.classes.text.primary
                  )}
                >
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
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <CategoriaSelect
                  moduleName={moduleName}
                  categorias={categorias}
                  value={categoriaId}
                  onChange={value =>
                    setValue(
                      categoriaIdField,
                      value as PathValue<TFormValues, typeof categoriaIdField>
                    )
                  }
                  errors={errors}
                  disabled={esDocumentoIdentidad || categoriaBloqueada} // ✅ Deshabilitar si es documento de identidad O categoría bloqueada
                  helperText={
                    esDocumentoIdentidad && categoriaIdentidad
                      ? `Categoría: ${categoriaIdentidad.nombre}`
                      : categoriaBloqueada
                        ? 'Categoría asignada por requisito'
                        : undefined
                  }
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
          className='flex items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-gray-700'
        >
          {onCancel && (
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className='rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              Cancelar
            </button>
          )}

          <button
            type='submit'
            disabled={
              (mode === 'create' && !archivoSeleccionado) || isSubmitting
            }
            className={cn(
              'flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium transition-all',
              'disabled:cursor-not-allowed disabled:opacity-50',
              theme.classes.button.primary
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className='animate-spin' />
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
