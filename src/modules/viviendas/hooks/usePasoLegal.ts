/**
 * usePasoLegal - Hook para lógica del Paso 3 (Información Legal)
 * ✅ Separación de responsabilidades
 * ✅ Manejo de archivo centralizado
 */

import { useRef, useState } from 'react'
import type { UseFormSetValue } from 'react-hook-form'

export function usePasoLegal({ setValue }: { setValue: UseFormSetValue<any> }) {
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (file.type !== 'application/pdf') {
      setFileError('Solo se permiten archivos PDF')
      return
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('El archivo no debe superar los 10MB')
      return
    }

    setFileError('')
    setCertificadoFile(file)
    setValue('certificado_tradicion_file', file)
  }

  const removeFile = () => {
    setCertificadoFile(null)
    setValue('certificado_tradicion_file', undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFileError('')
  }

  return {
    certificadoFile,
    fileError,
    fileInputRef,
    handleFileChange,
    removeFile,
  }
}
