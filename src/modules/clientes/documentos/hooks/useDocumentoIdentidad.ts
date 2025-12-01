/**
 * ============================================
 * USE DOCUMENTO IDENTIDAD
 * ============================================
 *
 * Hook para validación y gestión de documento de identidad del cliente.
 * Verifica si existe cédula/pasaporte y proporciona validaciones.
 *
 * RESPONSABILIDAD: Solo lógica de negocio, sin UI
 */

import { useDocumentosQuery } from '@/modules/documentos/hooks/useDocumentosQuery'
import { useMemo } from 'react'

interface UseDocumentoIdentidadProps {
  clienteId: string
}

interface UseDocumentoIdentidadReturn {
  /** Indica si el cliente tiene documento de identidad cargado */
  tieneCedula: boolean

  /** Documento de identidad actual (si existe) */
  documentoIdentidad: any | null

  /** Estado de carga */
  cargando: boolean

  /** Error al cargar documentos */
  error: Error | null

  /** Mensaje de validación para UI */
  mensajeValidacion: string | null
}

export function useDocumentoIdentidad({
  clienteId
}: UseDocumentoIdentidadProps): UseDocumentoIdentidadReturn {

  // ✅ Cargar documentos del cliente
  const { documentos, cargando, error } = useDocumentosQuery(clienteId, 'cliente')

  // ✅ Buscar documento de identidad
  const documentoIdentidad = useMemo(() => {
    return documentos.find(doc => (doc as any).es_documento_identidad === true) || null
  }, [documentos])

  // ✅ Verificar si tiene cédula
  const tieneCedula = useMemo(() => {
    return documentoIdentidad !== null
  }, [documentoIdentidad])

  // ✅ Mensaje de validación
  const mensajeValidacion = useMemo(() => {
    if (cargando) return null
    if (!tieneCedula) {
      return 'Debe subir el documento de identidad del cliente antes de asignarle viviendas.'
    }
    return null
  }, [tieneCedula, cargando])

  return {
    tieneCedula,
    documentoIdentidad,
    cargando,
    error,
    mensajeValidacion,
  }
}
