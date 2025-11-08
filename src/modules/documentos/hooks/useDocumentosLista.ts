/**
 * ============================================
 * USE DOCUMENTOS LISTA (REACT QUERY)
 * ============================================
 *
 * Hook principal para gestión de documentos
 * Migrado de Zustand a React Query
 *
 * CAMBIOS:
 * - ✅ React Query para datos del servidor
 * - ✅ Zustand solo para estado UI (filtros, vista)
 * - ✅ Sin useEffect manual
 * - ✅ Cache automático
 */

import { useCallback, useMemo, useState } from 'react'

import { useAuth } from '../../../contexts/auth-context'
import { useModal } from '../../../shared/components/modals'
import { DocumentosService } from '../services'
import { useDocumentosStore } from '../store/documentos.store'
import { DocumentoProyecto } from '../types'

import {
  useCategoriasQuery,
  useDocumentosProyectoQuery,
  useEliminarDocumentoMutation,
  useToggleImportanteMutation,
} from './useDocumentosQuery'

interface UseDocumentosListaProps {
  proyectoId: string
  onViewDocumento?: (documento: DocumentoProyecto) => void
}

export function useDocumentosLista({
  proyectoId,
  onViewDocumento,
}: UseDocumentosListaProps) {
  // Estado local UI
  const [vista, setVista] = useState<'grid' | 'lista'>('grid')
  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState<DocumentoProyecto | null>(null)
  const [modalViewerAbierto, setModalViewerAbierto] = useState(false)

  const { user } = useAuth()
  const { confirm } = useModal()

  // ✅ REACT QUERY: Datos del servidor (cache automático)
  const { documentos, cargando: cargandoDocumentos, refrescar } = useDocumentosProyectoQuery(proyectoId)
  const { categorias } = useCategoriasQuery(user?.id, 'proyectos')

  // ✅ REACT QUERY: Mutations
  const eliminarMutation = useEliminarDocumentoMutation(proyectoId)
  const toggleImportanteMutation = useToggleImportanteMutation(proyectoId)

  // ✅ ZUSTAND: Solo estado UI (filtros, búsqueda)
  const {
    categoriaFiltro,
    etiquetasFiltro,
    busqueda,
    soloImportantes,
  } = useDocumentosStore()

  // Filtrado de documentos (local)
  const documentosFiltrados = useMemo(() => {
    let filtered = documentos

    if (categoriaFiltro) {
      filtered = filtered.filter(doc => doc.categoria_id === categoriaFiltro)
    }

    if (etiquetasFiltro.length > 0) {
      filtered = filtered.filter(doc =>
        etiquetasFiltro.some(etiqueta => doc.etiquetas?.includes(etiqueta))
      )
    }

    if (soloImportantes) {
      filtered = filtered.filter(doc => doc.es_importante)
    }

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase()
      filtered = filtered.filter(
        doc =>
          doc.titulo.toLowerCase().includes(busquedaLower) ||
          doc.nombre_original.toLowerCase().includes(busquedaLower) ||
          doc.descripcion?.toLowerCase().includes(busquedaLower)
      )
    }

    return filtered
  }, [documentos, categoriaFiltro, etiquetasFiltro, busqueda, soloImportantes])

  // Handlers
  const handleView = useCallback(
    (documento: DocumentoProyecto) => {
      setDocumentoSeleccionado(documento)
      setModalViewerAbierto(true)
      onViewDocumento?.(documento)
    },
    [onViewDocumento]
  )

  const handleCloseViewer = useCallback(() => {
    setModalViewerAbierto(false)
    setDocumentoSeleccionado(null)
  }, [])

  const handleDownload = useCallback(async (documento: DocumentoProyecto) => {
    try {
      const url = await DocumentosService.obtenerUrlDescarga(
        documento.url_storage
      )
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error al descargar documento:', error)
    }
  }, [])

  const handleToggleImportante = useCallback(
    async (documento: DocumentoProyecto) => {
      try {
        await toggleImportanteMutation.mutateAsync(documento.id)
      } catch (error) {
        console.error('Error al actualizar documento:', error)
      }
    },
    [toggleImportanteMutation]
  )

  const handleArchive = useCallback(
    async (documento: DocumentoProyecto) => {
      const confirmed = await confirm({
        title: 'Archivar documento',
        message: `¿Estás seguro de que deseas archivar "${documento.titulo}"?`,
        confirmText: 'Archivar',
        variant: 'warning'
      })

      if (confirmed) {
        try {
          await DocumentosService.archivarDocumento(documento.id)
          await refrescar()
        } catch (error) {
          console.error('Error al archivar documento:', error)
        }
      }
    },
    [refrescar, confirm]
  )

  const handleDelete = useCallback(
    async (documento: DocumentoProyecto) => {
      const confirmed = await confirm({
        title: '¿Eliminar documento?',
        message: `Se eliminará permanentemente "${documento.titulo}".\n\nEsta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        variant: 'danger'
      })

      if (confirmed) {
        try {
          await eliminarMutation.mutateAsync(documento.id)
        } catch (error) {
          console.error('Error al eliminar documento:', error)
        }
      }
    },
    [eliminarMutation, confirm]
  )

  // Helpers
  const getCategoriaByDocumento = useCallback(
    (documento: DocumentoProyecto) => {
      return categorias.find(c => c.id === documento.categoria_id)
    },
    [categorias]
  )

  const hasDocumentos = documentos.length > 0

  return {
    // Estado UI
    vista,
    setVista,
    documentoSeleccionado,
    modalViewerAbierto,

    // Datos
    documentosFiltrados,
    categorias,
    cargandoDocumentos,
    hasDocumentos,

    // Handlers
    handleView,
    handleCloseViewer,
    handleDownload,
    handleToggleImportante,
    handleArchive,
    handleDelete,
    getCategoriaByDocumento,
  }
}
