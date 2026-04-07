'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import { formatDateForDB } from '@/lib/utils/date.utils'

import DocumentosBaseService from '../services/documentos-base.service'
import { type TipoEntidad } from '../types/entidad.types'

interface EditarMetadatosData {
  titulo?: string
  descripcion?: string
  categoria_id?: string
  fecha_documento?: string | null
  fecha_vencimiento?: string | null
}

export function useDocumentoEditar() {
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editarMetadatos = async (
    documentoId: string,
    data: EditarMetadatosData,
    tipoEntidad: TipoEntidad = 'proyecto'
  ): Promise<boolean> => {
    setEditando(true)
    setError(null)

    try {
      // Validaciones
      if (data.titulo && data.titulo.trim().length < 3) {
        throw new Error('El título debe tener al menos 3 caracteres')
      }

      if (data.fecha_vencimiento && data.fecha_documento) {
        const fechaDocumento = new Date(data.fecha_documento)
        const fechaVencimiento = new Date(data.fecha_vencimiento)

        if (fechaVencimiento <= fechaDocumento) {
          throw new Error(
            'La fecha de vencimiento debe ser posterior a la fecha del documento'
          )
        }
      }

      // Preparar updates (solo campos que cambiaron)
      const updates: Record<string, unknown> = {}

      if (data.titulo !== undefined) updates.titulo = data.titulo.trim()
      if (data.descripcion !== undefined)
        updates.descripcion = data.descripcion?.trim() || null
      if (data.categoria_id !== undefined)
        updates.categoria_id = data.categoria_id || null
      if (data.fecha_documento !== undefined) {
        updates.fecha_documento = data.fecha_documento
          ? formatDateForDB(data.fecha_documento)
          : null
      }
      if (data.fecha_vencimiento !== undefined) {
        updates.fecha_vencimiento = data.fecha_vencimiento
          ? formatDateForDB(data.fecha_vencimiento)
          : null
      }

      // Delegar al service centralizado (incluye auditoría automática)
      await DocumentosBaseService.actualizarDocumento(
        documentoId,
        updates,
        tipoEntidad
      )

      toast.success('Documento actualizado correctamente', {
        description: 'Los cambios se guardaron exitosamente',
      })

      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      toast.error('Error al editar documento', {
        description: errorMsg,
      })
      return false
    } finally {
      setEditando(false)
    }
  }

  return {
    editando,
    error,
    editarMetadatos,
  }
}
