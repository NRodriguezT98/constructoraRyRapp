/**
 * ============================================
 * HOOK: useDocumentosListaVivienda
 * ============================================
 * Hook con lógica de negocio para listar y gestionar documentos de vivienda
 * SOLO LÓGICA - UI en DocumentosListaVivienda component
 */

import { useAuth } from '@/contexts/auth-context'
import { useCallback } from 'react'
import { useDocumentosVivienda } from './useDocumentosVivienda'

interface UseDocumentosListaViviendaParams {
  viviendaId: string
}

export function useDocumentosListaVivienda({ viviendaId }: UseDocumentosListaViviendaParams) {
  const { user } = useAuth()
  const {
    documentos,
    isLoading,
    error,
    descargarDocumento,
    eliminarDocumento,
    isDescargando,
    isEliminando,
  } = useDocumentosVivienda(viviendaId)

  // ✅ Permisos: Solo Administrador puede eliminar
  const canDelete = user?.role === 'Administrador'

  // ✅ Handler: Descargar documento
  const handleDescargar = useCallback(
    async (id: string, nombreOriginal: string) => {
      try {
        await descargarDocumento({ id, nombreOriginal })
      } catch (error) {
        console.error('❌ Error al descargar documento:', error)
      }
    },
    [descargarDocumento]
  )

  // ✅ Handler: Eliminar documento
  const handleEliminar = useCallback(
    async (id: string, titulo: string) => {
      const confirmado = window.confirm(
        `¿Estás seguro de eliminar el documento "${titulo}"?\n\nEsta acción no se puede deshacer.`
      )

      if (!confirmado) return

      try {
        await eliminarDocumento(id)
      } catch (error) {
        console.error('❌ Error al eliminar documento:', error)
      }
    },
    [eliminarDocumento]
  )

  return {
    // Data
    documentos,
    isLoading,
    error: error ? (error as Error).message : null,

    // Actions
    handleDescargar,
    handleEliminar,

    // States
    isDescargando,
    isEliminando,
    canDelete,
  }
}
