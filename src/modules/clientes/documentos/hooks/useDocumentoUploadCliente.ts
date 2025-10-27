/**
 * Hook: useDocumentoUploadCliente
 *
 * Gestiona toda la lógica de carga de documentos para clientes.
 *
 * Responsabilidades:
 * - Validación de archivos (tipo, tamaño)
 * - Drag & drop de archivos
 * - Subida de cédulas al perfil del cliente
 * - Subida de documentos regulares al sistema de documentos
 * - Manejo de errores y estados de carga
 *
 * ⚠️ Integrado con Supabase Storage y sistema de documentos
 */

import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client-browser'
import { DragEvent, useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDocumentosClienteStore } from '../store/documentos-cliente.store'

export type UploadFormData = {
  titulo: string
  descripcion?: string
  categoria_id?: string
  etiquetas: string[]
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante: boolean
  metadata: Record<string, any>
}

interface UseDocumentoUploadClienteProps {
  clienteId: string
  esCedula?: boolean
  numeroDocumento?: string
  nombreCliente?: string
  onSuccess?: () => void
}

export function useDocumentoUploadCliente({
  clienteId,
  esCedula = false,
  numeroDocumento,
  nombreCliente,
  onSuccess,
}: UseDocumentoUploadClienteProps) {
  // =====================================================
  // CONTEXTOS Y STORES
  // =====================================================
  const { user } = useAuth()
  const { categorias, subiendoDocumento, subirDocumento } = useDocumentosClienteStore()

  // =====================================================
  // ESTADO
  // =====================================================
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [errorArchivo, setErrorArchivo] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [esImportante, setEsImportante] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // =====================================================
  // REACT HOOK FORM
  // =====================================================
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UploadFormData>({
    defaultValues: {
      titulo: '',
      descripcion: '',
      categoria_id: '',
      etiquetas: [],
      es_importante: false,
      metadata: {},
    },
  })

  // =====================================================
  // VALIDACIÓN DE ARCHIVOS
  // =====================================================

  /**
   * Validar tipo y tamaño de archivo
   */
  const validarArchivo = useCallback((file: File): boolean => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]

    if (!allowedTypes.includes(file.type)) {
      setErrorArchivo('Tipo de archivo no permitido')
      return false
    }

    if (file.size > maxSize) {
      setErrorArchivo('El archivo excede el tamaño máximo de 10MB')
      return false
    }

    setErrorArchivo('')
    return true
  }, [])

  // =====================================================
  // DRAG & DROP HANDLERS
  // =====================================================

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

      const file = e.dataTransfer.files[0]
      if (file && validarArchivo(file)) {
        setArchivoSeleccionado(file)
        // Auto-generar título desde nombre del archivo
        const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '')
        setValue('titulo', nombreSinExtension)
      }
    },
    [validarArchivo, setValue]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && validarArchivo(file)) {
        setArchivoSeleccionado(file)
        const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '')
        setValue('titulo', nombreSinExtension)
      }
    },
    [validarArchivo, setValue]
  )

  const handleClickSelectFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const limpiarArchivo = useCallback(() => {
    setArchivoSeleccionado(null)
    setErrorArchivo('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // =====================================================
  // SUBMIT: SUBIR DOCUMENTO
  // =====================================================

  /**
   * Subir documento (cédula o documento regular)
   */
  const handleSubmit = handleFormSubmit(async (data) => {
    if (!archivoSeleccionado) {
      toast.error('Selecciona un archivo')
      return
    }

    if (!user) {
      toast.error('No hay usuario autenticado')
      return
    }

    try {
      // Si es cédula, subir directamente al perfil del cliente
      if (esCedula) {
        await subirCedula(archivoSeleccionado)
      } else {
        // Documento regular
        await subirDocumentoRegular(archivoSeleccionado, data)
      }

      toast.success(esCedula ? 'Cédula subida exitosamente' : 'Documento subido exitosamente')
      reset()
      limpiarArchivo()
      setEtiquetas([])
      setEsImportante(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error al subir documento:', error)
      toast.error('Error al subir el documento')
    }
  })

  /**
   * Subir cédula al perfil del cliente
   */
  const subirCedula = async (archivo: File) => {
    // Importar dinámicamente solo el servicio de clientes
    const { clientesService } = await import('@/modules/clientes/services/clientes.service')

    // Verificar autenticación usando la instancia global
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      toast.error('No hay sesión activa. Por favor, inicia sesión nuevamente.')
      throw new Error('No hay sesión activa')
    }

    // Validar que sea PDF o imagen
    if (!archivo.type.match(/^(application\/pdf|image\/(jpeg|jpg|png|webp))$/)) {
      toast.error('La cédula debe ser un PDF o imagen (JPG, PNG, WEBP)')
      throw new Error('Tipo de archivo no válido para cédula')
    }

    // Subir a storage - Path simplificado de 2 niveles
    const extension = archivo.name.split('.').pop()

    // Generar nombre descriptivo usando nombre del cliente
    // Formato: Cedula_Laura_Duque_11522266.pdf
    let nombreArchivo = `cedula-${numeroDocumento || clienteId}.${extension}`
    if (nombreCliente) {
      // Limpiar nombre: remover acentos, reemplazar espacios por guión bajo
      const nombreLimpio = nombreCliente
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/\s+/g, '_') // Espacios -> guión bajo
        .replace(/[^a-zA-Z0-9_]/g, '') // Solo alfanuméricos y guión bajo

      nombreArchivo = `Cedula_${nombreLimpio}_${numeroDocumento}.${extension}`
    }

    // Path simple: userId/nombreArchivo
    const storagePath = `${session.user.id}/${nombreArchivo}`

    const { error: uploadError } = await supabase.storage
      .from('documentos-clientes')
      .upload(storagePath, archivo, {
        cacheControl: '3600',
        upsert: true, // Permitir sobrescribir si ya existe
      })

    if (uploadError) {
      console.error('Error al subir cédula:', uploadError)
      toast.error(`Error al subir la cédula: ${uploadError.message}`)
      throw uploadError
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('documentos-clientes').getPublicUrl(storagePath)

    // Actualizar cliente con la URL de la cédula
    await clientesService.actualizarCliente(clienteId, {
      documento_identidad_url: publicUrl,
    })
  }

  /**
   * Subir documento regular al sistema de documentos
   */
  const subirDocumentoRegular = async (archivo: File, data: UploadFormData) => {
    if (!user) throw new Error('Usuario no autenticado')

    await subirDocumento(
      {
        archivo,
        cliente_id: clienteId,
        categoria_id: data.categoria_id || undefined,
        titulo: data.titulo,
        descripcion: data.descripcion,
        etiquetas: etiquetas,
        fecha_documento: data.fecha_documento,
        fecha_vencimiento: data.fecha_vencimiento,
        es_importante: esImportante,
        metadata: data.metadata,
      },
      user.id
    )
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || ''
  }

  // =====================================================
  // RETORNO
  // =====================================================

  return {
    // Estado
    archivoSeleccionado,
    errorArchivo,
    isDragging,
    etiquetas,
    esImportante,
    subiendoDocumento,
    categorias,

    // Refs
    fileInputRef,

    // React Hook Form
    register,
    errors,
    setValue,

    // Funciones de archivo
    validarArchivo,
    limpiarArchivo,

    // Drag & Drop
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleClickSelectFile,

    // Submit
    handleSubmit,

    // Setters
    setEtiquetas,
    setEsImportante,

    // Utilidades
    formatFileSize,
    getFileExtension,
  }
}
