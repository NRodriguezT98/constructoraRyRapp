'use client'

import { useEffect, useState } from 'react'

import { formatDateForInput } from '@/lib/utils/date.utils'

import type {
  CategoriaDocumento,
  DocumentoProyecto,
  TipoEntidad,
} from '../types'

import { useDetectarCambiosDocumento } from './useDetectarCambiosDocumento'
import { useDocumentoEditar } from './useDocumentoEditar'

interface UseDocumentoEditarMetadatosModalProps {
  isOpen: boolean
  documento: DocumentoProyecto
  categorias: CategoriaDocumento[]
  tipoEntidad: TipoEntidad
  onClose: () => void
  onEditado?: () => void | Promise<void>
}

export function useDocumentoEditarMetadatosModal({
  isOpen,
  documento,
  tipoEntidad,
  onClose,
  onEditado,
}: UseDocumentoEditarMetadatosModalProps) {
  const { editando, editarMetadatos } = useDocumentoEditar()

  const [titulo, setTitulo] = useState(documento.titulo)
  const [descripcion, setDescripcion] = useState(documento.descripcion || '')
  const [categoriaId, setCategoriaId] = useState(documento.categoria_id || '')
  const [fechaDocumento, setFechaDocumento] = useState(
    documento.fecha_documento
      ? formatDateForInput(documento.fecha_documento)
      : ''
  )
  const [fechaVencimiento, setFechaVencimiento] = useState(
    documento.fecha_vencimiento
      ? formatDateForInput(documento.fecha_vencimiento)
      : ''
  )
  const [mostrarConfirmacionCerrar, setMostrarConfirmacionCerrar] =
    useState(false)
  const [mostrarConfirmacionGuardar, setMostrarConfirmacionGuardar] =
    useState(false)

  const resumenCambios = useDetectarCambiosDocumento(documento, {
    titulo: titulo.trim(),
    descripcion: descripcion.trim() || undefined,
    categoria_id: categoriaId || undefined,
    fecha_documento: fechaDocumento || null,
    fecha_vencimiento: fechaVencimiento || null,
  })

  const hayCambios = resumenCambios.hayCambios

  useEffect(() => {
    if (isOpen) {
      setTitulo(documento.titulo)
      setDescripcion(documento.descripcion || '')
      setCategoriaId(documento.categoria_id || '')
      setFechaDocumento(
        documento.fecha_documento
          ? formatDateForInput(documento.fecha_documento)
          : ''
      )
      setFechaVencimiento(
        documento.fecha_vencimiento
          ? formatDateForInput(documento.fecha_vencimiento)
          : ''
      )
    }
  }, [isOpen, documento])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hayCambios) {
      onClose()
      return
    }
    setMostrarConfirmacionGuardar(true)
  }

  const confirmarGuardar = async () => {
    const success = await editarMetadatos(
      documento.id,
      {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        categoria_id: categoriaId || undefined,
        fecha_documento: fechaDocumento || null,
        fecha_vencimiento: fechaVencimiento || null,
      },
      tipoEntidad
    )

    if (success) {
      setMostrarConfirmacionGuardar(false)
      await onEditado?.()
      onClose()
    }
  }

  const handleClose = () => {
    if (editando) return
    if (hayCambios) {
      setMostrarConfirmacionCerrar(true)
    } else {
      onClose()
    }
  }

  const confirmarCerrar = () => {
    setMostrarConfirmacionCerrar(false)
    onClose()
  }

  const cancelarCerrar = () => {
    setMostrarConfirmacionCerrar(false)
  }

  return {
    // Estado del formulario
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    categoriaId,
    setCategoriaId,
    fechaDocumento,
    setFechaDocumento,
    fechaVencimiento,
    setFechaVencimiento,
    // Estado UI
    mostrarConfirmacionCerrar,
    mostrarConfirmacionGuardar,
    setMostrarConfirmacionGuardar,
    // Estado de operación
    editando,
    hayCambios,
    resumenCambios,
    // Handlers
    handleSubmit,
    confirmarGuardar,
    handleClose,
    confirmarCerrar,
    cancelarCerrar,
  }
}
