'use client'

import type { BaseSyntheticEvent, ReactNode, RefObject } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { FileCheck, Loader2 } from 'lucide-react'
import type {
  FieldErrors,
  Path,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import {
  AccordionWizardField,
  AccordionWizardTextarea,
  getAccordionWizardStyles,
} from '@/shared/components/accordion-wizard'
import { type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import { ArchivoSelector } from './ArchivoSelector'
import { CategoriaSelect } from './CategoriaSelect'
import type {
  CategoriaDocumentoBase,
  DocumentoFormValuesBase,
} from './documento-form.types'
import { FechasInputs } from './FechasInputs'

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
  esDocumentoIdentidad?: boolean
  categoriaIdentidad?: CategoriaDocumentoBase | undefined
  categoriaBloqueada?: boolean

  // React Hook Form
  register: UseFormRegister<TFormValues>
  handleSubmit: (e?: BaseSyntheticEvent) => Promise<void>
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
  const styles = getAccordionWizardStyles(moduleName)
  const categoriaIdField = 'categoria_id' as Path<TFormValues>
  const tituloField = 'titulo' as Path<TFormValues>
  const descripcionField = 'descripcion' as Path<TFormValues>
  const categoriaId = (watch(categoriaIdField) as string | undefined) ?? ''

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
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.section.active.replace(
                'overflow-hidden',
                'overflow-visible'
              )}
            >
              {/* Header */}
              <div className='flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800'>
                <div className={styles.stepCircle.active}>
                  <FileCheck className='h-4 w-4 text-current opacity-70' />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                    Información del Documento
                  </h3>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Completa los datos del archivo seleccionado
                  </p>
                </div>
              </div>

              {/* Campos */}
              <div className='space-y-4 px-6 py-5'>
                {/* Título */}
                <AccordionWizardField
                  label='Título del documento'
                  moduleName={moduleName}
                  required
                  error={errors.titulo?.message as string | undefined}
                  maxLength={200}
                  {...register(tituloField)}
                />

                {/* Descripción */}
                <AccordionWizardTextarea
                  label='Descripción (opcional)'
                  moduleName={moduleName}
                  rows={3}
                  error={errors.descripcion?.message as string | undefined}
                  {...register(descripcionField)}
                />

                {/* Categoría */}
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
                  disabled={esDocumentoIdentidad || categoriaBloqueada}
                  helperText={
                    esDocumentoIdentidad && categoriaIdentidad
                      ? `Categoría: ${categoriaIdentidad.nombre}`
                      : categoriaBloqueada
                        ? 'Categoría asignada por requisito'
                        : undefined
                  }
                />

                {/* Campos específicos del módulo */}
                {extraFields}

                {/* Fechas */}
                <FechasInputs
                  moduleName={moduleName}
                  register={register}
                  errors={errors}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTONES FOOTER */}
      {showFormFields && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex items-center justify-between gap-3'
        >
          {onCancel ? (
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className={cn(
                styles.navigation.backButton,
                'disabled:opacity-50'
              )}
            >
              Cancelar
            </button>
          ) : (
            <span />
          )}

          <button
            type='submit'
            disabled={
              (mode === 'create' && !archivoSeleccionado) || isSubmitting
            }
            className={styles.navigation.nextButton}
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
