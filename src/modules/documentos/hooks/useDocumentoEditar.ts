'use client'

import { supabase } from '@/lib/supabase/client'
import { formatDateForDB } from '@/lib/utils/date.utils'
import { useState } from 'react'
import { toast } from 'sonner'

interface EditarMetadatosData {
  titulo?: string
  descripcion?: string
  categoria_id?: string
  fecha_documento?: string | null
  fecha_vencimiento?: string | null
  etiquetas?: string[]
}

export function useDocumentoEditar() {
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editarMetadatos = async (
    documentoId: string,
    data: EditarMetadatosData
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
          throw new Error('La fecha de vencimiento debe ser posterior a la fecha del documento')
        }
      }

      // Preparar datos para actualizar (solo campos que cambiaron)
      const updateData: any = {
        fecha_actualizacion: new Date().toISOString()
      }

      if (data.titulo !== undefined) updateData.titulo = data.titulo.trim()
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion?.trim() || null
      if (data.categoria_id !== undefined) updateData.categoria_id = data.categoria_id || null
      if (data.fecha_documento !== undefined) {
        updateData.fecha_documento = data.fecha_documento ? formatDateForDB(data.fecha_documento) : null
      }
      if (data.fecha_vencimiento !== undefined) {
        updateData.fecha_vencimiento = data.fecha_vencimiento ? formatDateForDB(data.fecha_vencimiento) : null
      }
      if (data.etiquetas !== undefined) updateData.etiquetas = data.etiquetas

      // Actualizar en base de datos
      const { error: updateError } = await supabase
        .from('documentos_proyecto')
        .update(updateData)
        .eq('id', documentoId)

      if (updateError) {
        console.error('Error al actualizar metadatos:', updateError)
        throw new Error('No se pudo actualizar el documento')
      }

      toast.success('Documento actualizado correctamente', {
        description: 'Los cambios se guardaron exitosamente'
      })

      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      toast.error('Error al editar documento', {
        description: errorMsg
      })
      return false
    } finally {
      setEditando(false)
    }
  }

  return {
    editando,
    error,
    editarMetadatos
  }
}
