/**
 * usePasoLegal - Hook para lógica del Paso 3 (Información Legal)
 * ✅ Separación de responsabilidades
 * ✅ Manejo de archivo centralizado
 */

import { useRef, useState } from 'react'

import type { UseFormSetValue } from 'react-hook-form'

import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'

export function usePasoLegal({ setValue }: { setValue: UseFormSetValue<ViviendaSchemaType> }) {
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
    // Nota: el archivo se gestiona vía estado local (certificadoFile), no en el form
  }

  const removeFile = () => {
    setCertificadoFile(null)
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
