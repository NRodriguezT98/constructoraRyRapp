/**
 * ============================================
 * HOOK: useDocumentosTab
 * ============================================
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 * Hook que maneja TODA la lógica del tab de documentos.
 * El componente solo renderiza UI.
 *
 * Responsabilidades:
 * - Gestionar vistas (documentos, upload, categorías)
 * - Validar si tiene documento de identidad (cédula)
 * - Controlar modales de upload
 * - Recargar página después de subir documentos
 */

import { useCallback, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useQueryClient } from '@tanstack/react-query'

import { useDocumentoIdentidad } from '@/modules/clientes/documentos/hooks/useDocumentoIdentidad'
import { documentosPendientesKeys } from '@/modules/clientes/types/documentos-pendientes.types'

interface UseDocumentosTabProps {
  clienteId: string
}

type Vista = 'documentos' | 'upload' | 'categorias'

export function useDocumentosTab({ clienteId }: UseDocumentosTabProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  // =====================================================
  // ESTADO
  // =====================================================

  const [vistaActual, setVistaActual] = useState<Vista>('documentos')
  const [uploadTipoCedula, setUploadTipoCedula] = useState(false)
  const [metadataPendiente, setMetadataPendiente] = useState<Record<string, any> | null>(null)

  // ✅ Hook de validación de documento de identidad
  const { tieneCedula, cargando: cargandoValidacion } = useDocumentoIdentidad({ clienteId })

  // =====================================================
  // ACCIONES
  // =====================================================

  /**
   * Mostrar formulario de upload de documentos
   * @param esCedula - Si es un documento de cédula
   * @param metadata - Metadata para vincular con documento pendiente
   */
  const mostrarUpload = useCallback((esCedula: boolean = false, metadata?: Record<string, any>) => {
    setUploadTipoCedula(esCedula)
    // ✅ Si es cédula, agregar flag para pre-marcar checkbox
    const metadataConFlag = esCedula
      ? { ...metadata, auto_check_identidad: true }
      : metadata || null
    setMetadataPendiente(metadataConFlag)
    setVistaActual('upload')
  }, [])

  /**
   * Mostrar gestor de categorías
   */
  const mostrarCategorias = useCallback(() => {
    setVistaActual('categorias')
  }, [])

  /**
   * Volver a vista de documentos
   */
  const volverADocumentos = useCallback(() => {
    setVistaActual('documentos')
    setUploadTipoCedula(false)
    setMetadataPendiente(null)
  }, [])

  /**
   * Después de subir documento exitosamente
   */
  const onSuccessUpload = useCallback(() => {
    volverADocumentos()
    // ✅ Invalidar documentos pendientes para que el banner desaparezca inmediatamente
    queryClient.invalidateQueries({
      queryKey: documentosPendientesKeys.byCliente(clienteId),
    })
    // ✅ Refrescar Server Components (lista de documentos)
    router.refresh()
  }, [queryClient, router, volverADocumentos, clienteId])

  /**
   * Cancelar upload
   */
  const onCancelUpload = useCallback(() => {
    volverADocumentos()
  }, [volverADocumentos])

  // =====================================================
  // COMPUTED
  // =====================================================

  const mostrandoUpload = vistaActual === 'upload'
  const mostrandoCategorias = vistaActual === 'categorias'
  const mostrandoDocumentos = vistaActual === 'documentos'

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    vistaActual,
    tieneCedula,
    cargandoValidacion,
    uploadTipoCedula,
    metadataPendiente,

    // Vistas
    mostrandoUpload,
    mostrandoCategorias,
    mostrandoDocumentos,

    // Acciones
    mostrarUpload,
    mostrarCategorias,
    volverADocumentos,
    onSuccessUpload,
    onCancelUpload,
  }
}
