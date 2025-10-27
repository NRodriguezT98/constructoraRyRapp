import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/auth-context'
import { useModal } from '../../../shared/components/modals'
import { DocumentosService } from '../services'
import { useDocumentosStore } from '../store/documentos.store'
import { DocumentoProyecto } from '../types'

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

  // Estado global del store
  const {
    documentos,
    categorias,
    cargandoDocumentos,
    cargarDocumentos,
    cargarCategorias,
    toggleImportante,
    eliminarDocumento,
    categoriaFiltro,
    etiquetasFiltro,
    busqueda,
    soloImportantes,
  } = useDocumentosStore()

  // Filtrado de documentos
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

  // Cargar datos iniciales
  useEffect(() => {
    cargarDocumentos(proyectoId)
    if (user?.id) {
      cargarCategorias(user.id)
    }
  }, [proyectoId, user?.id, cargarDocumentos, cargarCategorias])

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
        await toggleImportante(documento.id)
      } catch (error) {
        console.error('Error al actualizar documento:', error)
      }
    },
    [toggleImportante]
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
          await cargarDocumentos(proyectoId)
        } catch (error) {
          console.error('Error al archivar documento:', error)
        }
      }
    },
    [proyectoId, cargarDocumentos, confirm]
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
          await eliminarDocumento(documento.id)
        } catch (error) {
          console.error('Error al eliminar documento:', error)
        }
      }
    },
    [eliminarDocumento, confirm]
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
