'use client'

import { useState } from 'react'
import { useDocumentoReemplazarArchivo } from './useDocumentoReemplazarArchivo'

interface UseReemplazarArchivoFormProps {
  onSuccess?: () => void | Promise<void>
  onClose?: () => void
}

export function useReemplazarArchivoForm({
  onSuccess,
  onClose
}: UseReemplazarArchivoFormProps = {}) {
  const { reemplazando, progreso, reemplazarArchivo } = useDocumentoReemplazarArchivo()

  // Estados del formulario
  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null)
  const [justificacion, setJustificacion] = useState('')
  const [password, setPassword] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Validaciones
  const isFormValid = nuevoArchivo !== null && justificacion.length >= 10 && password.length > 0
  const isSubmitDisabled = reemplazando || !isFormValid

  // Handlers de drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setNuevoArchivo(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNuevoArchivo(e.target.files[0])
    }
  }

  const removeFile = () => {
    setNuevoArchivo(null)
  }

  // Handler de submit
  const handleSubmit = async (
    e: React.FormEvent,
    documento: {
      id: string
      nombre_archivo: string
      url_storage: string
      tamano_bytes: number
      version: number
    }
  ) => {
    e.preventDefault()

    if (!nuevoArchivo) return

    const success = await reemplazarArchivo(documento, {
      nuevoArchivo,
      justificacion,
      password
    })

    if (success) {
      await onSuccess?.()
      resetForm()
      onClose?.()
    }
  }

  // Reset form
  const resetForm = () => {
    setNuevoArchivo(null)
    setJustificacion('')
    setPassword('')
    setDragActive(false)
  }

  // Close handler
  const handleClose = () => {
    if (!reemplazando) {
      resetForm()
      onClose?.()
    }
  }

  return {
    // Estados
    nuevoArchivo,
    justificacion,
    password,
    dragActive,
    reemplazando,
    progreso,

    // Validaciones
    isFormValid,
    isSubmitDisabled,

    // Setters
    setNuevoArchivo,
    setJustificacion,
    setPassword,

    // Handlers
    handleDrag,
    handleDrop,
    handleFileChange,
    removeFile,
    handleSubmit,
    handleClose,
    resetForm
  }
}
