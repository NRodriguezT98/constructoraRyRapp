'use client'

import { DocumentoFormBase } from '@/shared/components/forms/documento'
import { type ModuleName } from '@/shared/config/module-themes'
import { useDocumentoUpload } from '../../hooks'

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
  const {
    isDragging,
    archivoSeleccionado,
    errorArchivo,
    subiendoDocumento,
    categorias,
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
  } = useDocumentoUpload({ proyectoId, onSuccess })

  return (
    <DocumentoFormBase
      mode="create"
      moduleName={moduleName}

      // Estado de archivo
      archivoSeleccionado={archivoSeleccionado}
      errorArchivo={errorArchivo}
      isDragging={isDragging}
      fileInputRef={fileInputRef}

      // Datos del formulario
      categorias={categorias}
      isSubmitting={subiendoDocumento}

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
  )
}
