import { DragEvent, useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../../contexts/auth-context'
import { documentoConArchivoSchema } from '../schemas/documento.schema'
import { useDocumentosStore } from '../store/documentos.store'

type UploadFormData = {
  titulo: string
  descripcion?: string
  categoria_id?: string
  etiquetas: string[]
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante: boolean
  metadata: Record<string, any>
}

interface UseDocumentoUploadProps {
  proyectoId: string
  onSuccess?: () => void
}

export function useDocumentoUpload({
  proyectoId,
  onSuccess,
}: UseDocumentoUploadProps) {
  // Estado local
  const [isDragging, setIsDragging] = useState(false)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(
    null
  )
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auth
  const { user } = useAuth()

  // Store
  const { categorias, subiendoDocumento, subirDocumento } = useDocumentosStore()

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    defaultValues: {
      titulo: '',
      descripcion: '',
      categoria_id: '',
      etiquetas: [],
      fecha_documento: undefined,
      fecha_vencimiento: undefined,
      es_importante: false,
      metadata: {},
    },
  })

  const etiquetas = watch('etiquetas') || []
  const esImportante = watch('es_importante')

  // Validación de archivo
  const validarArchivo = useCallback((file: File): boolean => {
    setErrorArchivo(null)

    try {
      documentoConArchivoSchema.shape.archivo.parse(file)
      return true
    } catch (error: any) {
      const mensajeError = error.errors?.[0]?.message || 'Archivo no válido'
      setErrorArchivo(mensajeError)
      return false
    }
  }, [])

  // Handlers de archivo
  const handleArchivoSeleccionado = useCallback(
    (file: File) => {
      if (validarArchivo(file)) {
        setArchivoSeleccionado(file)

        // Autocompletar título con nombre del archivo (sin extensión)
        if (!watch('titulo')) {
          const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '')
          setValue('titulo', nombreSinExtension)
        }
      }
    },
    [validarArchivo, watch, setValue]
  )

  const limpiarArchivo = useCallback(() => {
    setArchivoSeleccionado(null)
    setErrorArchivo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleArchivoSeleccionado(files[0])
      }
    },
    [handleArchivoSeleccionado]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleArchivoSeleccionado(files[0])
      }
    },
    [handleArchivoSeleccionado]
  )

  const handleClickSelectFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Submit
  const onSubmit = useCallback(
    async (data: UploadFormData) => {
      if (!archivoSeleccionado) {
        setErrorArchivo('Debes seleccionar un archivo')
        return
      }

      if (!user) {
        console.error('Usuario no autenticado')
        return
      }

      try {
        await subirDocumento(
          {
            ...data,
            archivo: archivoSeleccionado,
            proyecto_id: proyectoId,
            subido_por: user.id,
          },
          user.id
        )

        // Reset form
        reset()
        limpiarArchivo()
        onSuccess?.()
      } catch (error) {
        console.error('Error al subir documento:', error)
      }
    },
    [archivoSeleccionado, user, proyectoId, subirDocumento, reset, limpiarArchivo, onSuccess]
  )

  // Helpers
  const handleSetEtiquetas = useCallback(
    (nuevasEtiquetas: string[]) => {
      setValue('etiquetas', nuevasEtiquetas)
    },
    [setValue]
  )

  return {
    // Estado
    isDragging,
    archivoSeleccionado,
    errorArchivo,
    subiendoDocumento,
    categorias,
    etiquetas,
    esImportante,

    // Refs
    fileInputRef,

    // Form
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    setValue,
    watch,

    // Handlers de archivo
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleClickSelectFile,
    limpiarArchivo,
    handleSetEtiquetas,
  }
}
