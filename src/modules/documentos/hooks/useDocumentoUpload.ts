import { DragEvent, useCallback, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useAuth } from '../../../contexts/auth-context'
import type { DocumentoFormData } from '../schemas/documento.schema'
import { documentoConArchivoSchema, documentoFormSchema } from '../schemas/documento.schema'

import { useCategoriasQuery, useSubirDocumentoMutation } from './useDocumentosQuery'

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

  // Categorías desde React Query
  const { categorias = [] } = useCategoriasQuery(user?.id, 'proyectos')

  // Mutation para subir documento
  const { mutateAsync: subirDocumento, isPending: subiendoDocumento } = useSubirDocumentoMutation(proyectoId)

  // Form con validaciones Zod (sin validación de archivo aquí - se valida en handleFileChange)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DocumentoFormData>({
    resolver: zodResolver(documentoFormSchema),
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
    mode: 'onChange', // Validar mientras el usuario escribe
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
    async (data: DocumentoFormData) => {
      if (!archivoSeleccionado) {
        setErrorArchivo('Debes seleccionar un archivo')
        return
      }

      if (!user) {
        console.error('Usuario no autenticado')
        return
      }

      try {
        await subirDocumento({
          archivo: archivoSeleccionado,
          titulo: data.titulo,
          descripcion: data.descripcion,
          categoriaId: data.categoria_id,
          etiquetas: data.etiquetas,
          fechaDocumento: data.fecha_documento,
          fechaVencimiento: data.fecha_vencimiento,
          esImportante: data.es_importante,
          userId: user.id,
        })

        // Reset form
        reset()
        limpiarArchivo()
        onSuccess?.()
      } catch (error) {
        console.error('Error al subir documento:', error)
      }
    },
    [archivoSeleccionado, user, subirDocumento, reset, limpiarArchivo, onSuccess]
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
