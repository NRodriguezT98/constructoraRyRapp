'use client'

import { DocumentoFormBase } from '@/shared/components/forms/documento'
import { type ModuleName } from '@/shared/config/module-themes'
import { useDocumentoUpload } from '../../hooks'
import { type TipoEntidad, obtenerConfiguracionEntidad } from '../../types'
import { CheckboxDocumentoIdentidad } from './CheckboxDocumentoIdentidad'

interface DocumentoUploadProps {
  entidadId: string // ✅ GENÉRICO (antes proyectoId)
  tipoEntidad: TipoEntidad // ✅ NUEVO: 'proyecto', 'vivienda', etc.
  onSuccess?: () => void
  onCancel?: () => void
  moduleName?: ModuleName // 🎨 Tema del módulo
  metadata?: Record<string, any> | null // ✅ NUEVO: Metadata para vincular documento pendiente
}

export function DocumentoUpload({
  entidadId,
  tipoEntidad,
  onSuccess,
  onCancel,
  moduleName, // 🎨 Inferir desde tipoEntidad si no se pasa
  metadata, // ✅ Metadata para vincular
}: DocumentoUploadProps) {
  // 🎨 Auto-inferir moduleName desde tipoEntidad si no se especifica
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const themeModuleName = moduleName || config.moduleName

  const {
    isDragging,
    archivoSeleccionado,
    errorArchivo,
    subiendoDocumento,
    categorias,
    esDocumentoIdentidad,
    categoriaIdentidad,
    categoriaSeleccionada,
    checkboxDeshabilitado, // ✅ Nuevo
    yaExisteDocumentoIdentidad, // ✅ Nuevo
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
    limpiarArchivo,
  } = useDocumentoUpload({ entidadId, tipoEntidad, metadata, onSuccess })

  return (
    <>
      {/* Checkbox de documento de identidad (solo para clientes SIN documento existente) */}
      {tipoEntidad === 'cliente' && !yaExisteDocumentoIdentidad && (
        <div className="mb-4">
          <CheckboxDocumentoIdentidad
            checked={esDocumentoIdentidad}
            onChange={(checked) => setValue('es_documento_identidad', checked)}
            disabled={checkboxDeshabilitado}
          />
        </div>
      )}

      {/* Mensaje informativo si ya existe documento de identidad */}
      {tipoEntidad === 'cliente' && yaExisteDocumentoIdentidad && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-green-900 dark:text-green-100 mb-1">
                ✓ Este cliente ya tiene un documento de identidad registrado
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300">
                Ya no es necesario marcar documentos adicionales como documento de identidad.
                Puedes continuar subiendo otros documentos normalmente.
              </p>
            </div>
          </div>
        </div>
      )}

      <DocumentoFormBase
        mode="create"
        moduleName={themeModuleName}

      // Estado de archivo
      archivoSeleccionado={archivoSeleccionado}
      errorArchivo={errorArchivo}
      isDragging={isDragging}
      fileInputRef={fileInputRef}

      // Datos del formulario
      categorias={categorias}
      isSubmitting={subiendoDocumento}
      esDocumentoIdentidad={esDocumentoIdentidad}
      categoriaIdentidad={categoriaIdentidad}

      // React Hook Form
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      setValue={setValue}
      watch={watch}

      // Handlers de archivo
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onFileInputChange={handleFileInputChange}
      onLimpiarArchivo={limpiarArchivo}

      // Handlers de formulario
      onCancel={onCancel}

      // Textos personalizables
      submitButtonText="Subir documento"
      submittingButtonText="Subiendo..."
      />
    </>
  )
}
