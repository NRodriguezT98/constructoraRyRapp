/**
 * ============================================
 * HOOK: useDocumentoUploadVivienda
 * ============================================
 * Hook con lógica de negocio para subir documentos de vivienda
 * SOLO LÓGICA - UI en DocumentoUploadVivienda component
 */

import { ChangeEvent, FormEvent, useCallback, useState } from 'react'
import { useCategoriasSistemaViviendas } from './useCategoriasSistemaViviendas'
import { useDocumentosVivienda } from './useDocumentosVivienda'

interface UseDocumentoUploadViviendaParams {
  viviendaId: string
  onSuccess: () => void
  categoriaPreseleccionada?: string
}

export function useDocumentoUploadVivienda({
  viviendaId,
  onSuccess,
  categoriaPreseleccionada,
}: UseDocumentoUploadViviendaParams) {
  // ✅ React Query hooks
  const { subirDocumento, isSubiendo } = useDocumentosVivienda(viviendaId)
  const { obtenerCategoriaPorNombre } = useCategoriasSistemaViviendas()

  // ✅ Estados locales
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCategoriaNombre, setSelectedCategoriaNombre] = useState<string>(
    categoriaPreseleccionada || ''
  )
  const [titulo, setTitulo] = useState<string>('')
  const [descripcion, setDescripcion] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // ✅ Validar archivo
  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos PDF, JPG o PNG'
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return 'El archivo no puede superar los 10MB'
    }

    return null
  }, [])

  // ✅ Handler: Seleccionar archivo
  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setSelectedFile(file)

      // Auto-llenar título con nombre del archivo (sin extensión)
      if (!titulo) {
        const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '')
        setTitulo(nombreSinExtension)

        // ✅ Auto-categorizar por nombre
        const categoriaDetectada = obtenerCategoriaPorNombre(file.name)
        if (categoriaDetectada) {
          setSelectedCategoriaNombre(categoriaDetectada.nombre)
        }
      }
    },
    [validateFile, titulo, obtenerCategoriaPorNombre]
  )

  // ✅ Handler: Cambiar categoría
  const handleCategoriaChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoriaNombre(e.target.value)
  }, [])

  // ✅ Handler: Cambiar título
  const handleTituloChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTitulo(e.target.value)
  }, [])

  // ✅ Handler: Cambiar descripción
  const handleDescripcionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescripcion(e.target.value)
  }, [])

  // ✅ Handler: Remover archivo seleccionado
  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null)
    setError(null)
  }, [])

  // ✅ Handler: Submit formulario
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!selectedFile || !selectedCategoriaNombre || !titulo) {
        setError('Por favor completa todos los campos requeridos')
        return
      }

      try {
        setError(null)
        await subirDocumento({
          viviendaId,
          archivo: selectedFile,
          categoriaNombre: selectedCategoriaNombre,
          titulo,
          descripcion: descripcion || undefined,
        })

        // Resetear formulario
        setSelectedFile(null)
        setSelectedCategoriaNombre('')
        setTitulo('')
        setDescripcion('')

        // Callback de éxito
        onSuccess()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al subir documento')
      }
    },
    [selectedFile, selectedCategoriaNombre, titulo, descripcion, viviendaId, subirDocumento, onSuccess]
  )

  return {
    // Estados
    selectedFile,
    selectedCategoria: selectedCategoriaNombre,
    titulo,
    descripcion,
    uploading: isSubiendo,
    error,

    // Handlers
    handleFileSelect,
    handleCategoriaChange,
    handleTituloChange,
    handleDescripcionChange,
    handleSubmit,
    removeSelectedFile,
  }
}
