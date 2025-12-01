import React, { DragEvent, useCallback, useEffect, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useAuth } from '../../../contexts/auth-context'
import { useDocumentoIdentidad } from '../../clientes/documentos/hooks/useDocumentoIdentidad'
import type { DocumentoFormData } from '../schemas/documento.schema'
import { documentoConArchivoSchema, documentoFormSchema } from '../schemas/documento.schema'
import type { TipoEntidad } from '../types'

import { useCategoriasQuery, useSubirDocumentoMutation } from './useDocumentosQuery'

interface UseDocumentoUploadProps {
  entidadId: string
  tipoEntidad: TipoEntidad
  onSuccess?: () => void
}

export function useDocumentoUpload({
  entidadId,
  tipoEntidad,
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

  // ✅ Convertir tipoEntidad a moduleName para categorías
  const modulosCategorias: Record<TipoEntidad, 'proyectos' | 'clientes' | 'viviendas'> = {
    proyecto: 'proyectos',
    vivienda: 'viviendas',
    cliente: 'clientes',
  }

  const moduloCategoria = modulosCategorias[tipoEntidad]

  // Categorías desde React Query
  const { categorias = [] } = useCategoriasQuery(user?.id, moduloCategoria)

  // ✅ Validar si ya existe documento de identidad (solo para clientes)
  // Siempre llamar al hook, pero pasar clienteId vacío si no es cliente
  const { tieneCedula: yaExisteDocumentoIdentidad } = useDocumentoIdentidad({
    clienteId: tipoEntidad === 'cliente' ? entidadId : '', // Vacío si no es cliente
  })

  // Mutation para subir documento (GENÉRICO)
  const { mutateAsync: subirDocumento, isPending: subiendoDocumento } = useSubirDocumentoMutation(entidadId, tipoEntidad)

  // Form con validaciones Zod (sin validación de archivo aquí - se valida en handleFileChange)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm<DocumentoFormData>({
    resolver: zodResolver(documentoFormSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      categoria_id: '',
      fecha_documento: undefined,
      fecha_vencimiento: undefined,
      es_importante: false,
      es_documento_identidad: false,
      metadata: {},
    },
    mode: 'onChange', // Validar mientras el usuario escribe
  })

  const esImportante = watch('es_importante')
  const esDocumentoIdentidad = watch('es_documento_identidad')
  const categoriaSeleccionada = watch('categoria_id')

  // ✅ Buscar categoría "Documentos de Identidad" automáticamente
  const categoriaIdentidad = categorias.find(c =>
    c.nombre === 'Documentos de Identidad' ||
    c.nombre.toLowerCase().includes('identidad') ||
    c.nombre.toLowerCase().includes('cédula') ||
    c.nombre.toLowerCase().includes('cedula')
  )

  // ✅ Auto-seleccionar categoría cuando marca como documento de identidad
  // useEffect para observar cambios en esDocumentoIdentidad
  useEffect(() => {
    if (esDocumentoIdentidad && categoriaIdentidad && !categoriaSeleccionada) {
      setValue('categoria_id', categoriaIdentidad.id)
    }
  }, [esDocumentoIdentidad, categoriaIdentidad, categoriaSeleccionada, setValue])

  // ✅ Deshabilitar checkbox si ya existe documento de identidad (solo clientes)
  const checkboxDeshabilitado = tipoEntidad === 'cliente' && yaExisteDocumentoIdentidad

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

      // ✅ VALIDACIÓN CRÍTICA: Bloquear si intenta subir documento de identidad cuando ya existe uno
      if (tipoEntidad === 'cliente' && data.es_documento_identidad && yaExisteDocumentoIdentidad) {
        setErrorArchivo('Ya existe un documento de identidad para este cliente. Elimina el anterior antes de subir uno nuevo.')
        return
      }

      try {
        await subirDocumento({
          archivo: archivoSeleccionado,
          titulo: data.titulo,
          descripcion: data.descripcion,
          categoriaId: data.categoria_id,
          fechaDocumento: data.fecha_documento,
          fechaVencimiento: data.fecha_vencimiento,
          esImportante: data.es_importante,
          esDocumentoIdentidad: data.es_documento_identidad,
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
    [archivoSeleccionado, user, subirDocumento, reset, limpiarArchivo, onSuccess, getValues, tipoEntidad, yaExisteDocumentoIdentidad]
  )

  // Helpers - ninguno por ahora

  return {
    // Estado
    isDragging,
    archivoSeleccionado,
    errorArchivo,
    subiendoDocumento,
    categorias,
    esImportante,
    esDocumentoIdentidad,
    categoriaIdentidad, // ✅ Para deshabilitar select
    categoriaSeleccionada, // ✅ Para saber si hay categoría seleccionada
    checkboxDeshabilitado, // ✅ Para deshabilitar checkbox si ya existe documento de identidad
    yaExisteDocumentoIdentidad, // ✅ Para mensajes informativos

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
  }
}
