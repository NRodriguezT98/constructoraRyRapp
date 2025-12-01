/**
 * useDetectarCambiosDocumento - Hook para detectar y comparar cambios en documentos
 *
 * ✅ Hook personalizado (SOLO lógica)
 * ✅ < 200 líneas
 * ✅ Funciones puras de comparación
 */

import { useMemo } from 'react'

import { formatDateForInput } from '@/lib/utils/date.utils'
import type { DocumentoProyecto } from '../types'

export interface CambioDocumentoDetectado {
  campo: string
  label: string
  valorAnterior: string | null
  valorNuevo: string | null
}

export interface ResumenCambiosDocumento {
  cambios: CambioDocumentoDetectado[]
  totalCambios: number
  hayCambios: boolean
}

interface DatosNuevosDocumento {
  titulo: string
  descripcion?: string
  categoria_id?: string
  fecha_documento: string | null
  fecha_vencimiento: string | null
}

export function useDetectarCambiosDocumento(
  documentoOriginal: DocumentoProyecto,
  nuevosDatos: DatosNuevosDocumento
): ResumenCambiosDocumento {
  const resumen = useMemo(() => {
    const cambios: CambioDocumentoDetectado[] = []

    // Comparar título
    if (documentoOriginal.titulo !== nuevosDatos.titulo) {
      cambios.push({
        campo: 'titulo',
        label: 'Título del documento',
        valorAnterior: documentoOriginal.titulo,
        valorNuevo: nuevosDatos.titulo,
      })
    }

    // Comparar descripción
    const descripcionOriginal = documentoOriginal.descripcion || ''
    const descripcionNueva = nuevosDatos.descripcion || ''
    if (descripcionOriginal !== descripcionNueva) {
      cambios.push({
        campo: 'descripcion',
        label: 'Descripción',
        valorAnterior: descripcionOriginal || 'Sin descripción',
        valorNuevo: descripcionNueva || 'Sin descripción',
      })
    }

    // Comparar categoría
    const categoriaOriginal = documentoOriginal.categoria_id || ''
    const categoriaNueva = nuevosDatos.categoria_id || ''
    if (categoriaOriginal !== categoriaNueva) {
      cambios.push({
        campo: 'categoria_id',
        label: 'Categoría',
        valorAnterior: categoriaOriginal || 'Sin categoría',
        valorNuevo: categoriaNueva || 'Sin categoría',
      })
    }

    // Comparar fecha documento (normalizar ambas a formato YYYY-MM-DD)
    const fechaDocOriginal = documentoOriginal.fecha_documento
      ? formatDateForInput(documentoOriginal.fecha_documento)
      : ''
    const fechaDocNueva = nuevosDatos.fecha_documento || ''
    if (fechaDocOriginal !== fechaDocNueva) {
      cambios.push({
        campo: 'fecha_documento',
        label: 'Fecha del documento',
        valorAnterior: documentoOriginal.fecha_documento || 'Sin fecha',
        valorNuevo: nuevosDatos.fecha_documento || 'Sin fecha',
      })
    }

    // Comparar fecha vencimiento (normalizar ambas a formato YYYY-MM-DD)
    const fechaVencOriginal = documentoOriginal.fecha_vencimiento
      ? formatDateForInput(documentoOriginal.fecha_vencimiento)
      : ''
    const fechaVencNueva = nuevosDatos.fecha_vencimiento || ''
    if (fechaVencOriginal !== fechaVencNueva) {
      cambios.push({
        campo: 'fecha_vencimiento',
        label: 'Vencimiento',
        valorAnterior: documentoOriginal.fecha_vencimiento || 'Sin vencimiento',
        valorNuevo: nuevosDatos.fecha_vencimiento || 'Sin vencimiento',
      })
    }

    const totalCambios = cambios.length
    const hayCambios = totalCambios > 0

    return {
      cambios,
      totalCambios,
      hayCambios,
    }
  }, [documentoOriginal, nuevosDatos])

  return resumen
}
