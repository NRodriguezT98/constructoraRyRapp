'use client'

import { useDocumentoUpload } from '@/modules/viviendas/hooks/documentos'
import { DocumentoFormBase } from '@/shared/components/forms/documento'
import { type ModuleName } from '@/shared/config/module-themes'

interface DocumentoUploadProps {
  viviendaId: string
  onSuccess?: () => void
  onCancel?: () => void
  moduleName?: ModuleName // ðŸŽ¨ Tema del mÃ³dulo
}

export function DocumentoUpload({
  viviendaId,
  onSuccess,
  onCancel,
  moduleName = 'viviendas', // ðŸŽ¨ Default a proyectos
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
  } = useDocumentoUpload({ viviendaId, onSuccess })

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
