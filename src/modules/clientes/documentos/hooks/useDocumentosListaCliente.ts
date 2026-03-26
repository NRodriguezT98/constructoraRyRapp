// ============================================
// HOOK: useDocumentosListaCliente
// ============================================

import { useCallback, useMemo, useState } from 'react'

import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'
import {
    useArchivarDocumentoMutation,
    useCategoriasQuery,
    useDocumentosArchivadosQuery,
    useDocumentosQuery,
    useEliminarDocumentoMutation,
    useRestaurarDocumentoMutation,
    useToggleImportanteMutation,
} from '@/modules/documentos/hooks/useDocumentosQuery'
import { DocumentosBaseService } from '@/modules/documentos/services/documentos-base.service'
import { DocumentosService } from '@/modules/documentos/services/documentos.service'
import type { DocumentoProyecto } from '@/modules/documentos/types/documento.types'
import { obtenerConfiguracionEntidad } from '@/modules/documentos/types/entidad.types'

import { useDocumentosClienteStore } from '../store/documentos-cliente.store'

interface UseDocumentosListaClienteParams {
  clienteId: string
}

export function useDocumentosListaCliente({ clienteId }: UseDocumentosListaClienteParams) {
  const { user } = useAuth()

  // Vista grid/lista
  const [vista, setVista] = useState<'grid' | 'lista'>('lista')

  // Estado modales renombrar
  const [modalRenombrarAbierto, setModalRenombrarAbierto] = useState(false)
  const [documentoRenombrar, setDocumentoRenombrar] = useState<DocumentoProyecto | null>(null)

  // Estado modales categorías
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)
  const [documentoParaCategorizar, setDocumentoParaCategorizar] = useState<DocumentoProyecto | null>(null)

  // Filtros (Zustand store)
  const { categoriaFiltro, busqueda, soloImportantes } = useDocumentosClienteStore()

  // ─── React Query ───────────────────────────────────────────
  const { documentos, cargando: cargandoDocumentos, refrescar } = useDocumentosQuery(clienteId, 'cliente')
  const { documentos: documentosArchivados, cargando: cargandoArchivados, refrescar: refrescarArchivados } = useDocumentosArchivadosQuery(clienteId, 'cliente')
  const { categorias } = useCategoriasQuery(user?.id, 'clientes')

  const archivarMutation = useArchivarDocumentoMutation(clienteId, 'cliente')
  const restaurarMutation = useRestaurarDocumentoMutation(clienteId, 'cliente')
  const eliminarMutation = useEliminarDocumentoMutation(clienteId, 'cliente')
  const toggleImportanteMutation = useToggleImportanteMutation(clienteId, 'cliente')

  // ─── Filtrado ──────────────────────────────────────────────
  const documentosFiltrados = useMemo(() => {
    // Solo documentos activos en este tab
    let filtered = documentos.filter(doc => doc.estado === 'activo')

    if (categoriaFiltro) {
      filtered = filtered.filter(doc => doc.categoria_id === categoriaFiltro)
    }
    if (soloImportantes) {
      filtered = filtered.filter(doc => doc.es_importante)
    }
    if (busqueda) {
      const q = busqueda.toLowerCase()
      filtered = filtered.filter(
        doc =>
          doc.titulo.toLowerCase().includes(q) ||
          doc.nombre_original.toLowerCase().includes(q) ||
          doc.descripcion?.toLowerCase().includes(q)
      )
    }

    return filtered.sort((a, b) => {
      // 1. Documentos importantes (anclados) siempre primero
      if (a.es_importante && !b.es_importante) return -1
      if (!a.es_importante && b.es_importante) return 1

      // 2. Resto: más recientes primero
      return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    })
  }, [documentos, categoriaFiltro, busqueda, soloImportantes])

  // ─── Handlers ─────────────────────────────────────────────
  const handleView = useCallback(async (documento: DocumentoProyecto) => {
    try {
      const { bucket } = obtenerConfiguracionEntidad('cliente')
      const { data } = await supabase.storage
        .from(bucket)
        .createSignedUrl(documento.url_storage, 3600)
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    } catch {
      toast.error('No se pudo abrir el documento')
    }
  }, [])

  const handleDownload = useCallback(async (documento: DocumentoProyecto) => {
    try {
      const url = await DocumentosService.obtenerUrlDescarga(documento.url_storage, 'cliente')
      window.open(url, '_blank')
    } catch {
      toast.error('Error al descargar el documento')
    }
  }, [])

  const handleToggleImportante = useCallback(async (documento: DocumentoProyecto) => {
    try {
      await toggleImportanteMutation.mutateAsync(documento.id)
    } catch {
      // La mutation ya muestra el toast de error
    }
  }, [toggleImportanteMutation])

  const handleArchive = useCallback(async (documento: DocumentoProyecto) => {
    try {
      await archivarMutation.mutateAsync({
        documentoId: documento.id,
        motivoCategoria: 'Documento de negociación anterior',
        motivoDetalle: 'Archivado manualmente por el asesor',
      })
    } catch {
      // La mutation ya muestra el toast de error
    }
  }, [archivarMutation])

  const handleRestore = useCallback(async (documento: DocumentoProyecto) => {
    try {
      await restaurarMutation.mutateAsync(documento.id)
    } catch {
      // La mutation ya muestra el toast de error
    }
  }, [restaurarMutation])

  const handleDelete = useCallback(async (documento: DocumentoProyecto) => {
    const confirmed = window.confirm(`¿Eliminar "${documento.titulo}"? Esta acción lo moverá a la papelera.`)
    if (!confirmed) return
    try {
      await eliminarMutation.mutateAsync(documento.id)
    } catch {
      // La mutation ya muestra el toast de error
    }
  }, [eliminarMutation])

  const handleRename = useCallback((documento: DocumentoProyecto) => {
    setDocumentoRenombrar(documento)
    setModalRenombrarAbierto(true)
  }, [])

  const closeModalRenombrar = useCallback(() => {
    setModalRenombrarAbierto(false)
    setDocumentoRenombrar(null)
  }, [])

  const handleConfirmarRenombrar = useCallback(async (nuevoTitulo: string) => {
    if (!documentoRenombrar) return
    try {
      await DocumentosBaseService.actualizarDocumento(
        documentoRenombrar.id,
        { titulo: nuevoTitulo },
        'cliente'
      )
      await refrescar()
      toast.success('Documento renombrado')
      closeModalRenombrar()
    } catch {
      toast.error('Error al renombrar el documento')
    }
  }, [documentoRenombrar, refrescar, closeModalRenombrar])

  const handleAsignarCategoria = useCallback((documento: DocumentoProyecto) => {
    setDocumentoParaCategorizar(documento)
    setModalCategoriasAbierto(true)
  }, [])

  const closeModalCategorias = useCallback(() => {
    setModalCategoriasAbierto(false)
    setDocumentoParaCategorizar(null)
  }, [])

  const handleConfirmarCategoria = useCallback(async (categoriaId: string) => {
    if (!documentoParaCategorizar) return
    try {
      await DocumentosBaseService.actualizarDocumento(
        documentoParaCategorizar.id,
        { categoria_id: categoriaId },
        'cliente'
      )
      await refrescar()
      toast.success('Categoría asignada')
      closeModalCategorias()
    } catch {
      toast.error('Error al asignar categoría')
    }
  }, [documentoParaCategorizar, refrescar, closeModalCategorias])

  const getCategoriaByDocumento = useCallback(
    (documento: DocumentoProyecto) => categorias.find(c => c.id === documento.categoria_id),
    [categorias]
  )

  const refrescarDocumentos = useCallback(async () => {
    await Promise.all([refrescar(), refrescarArchivados()])
  }, [refrescar, refrescarArchivados])

  return {
    // UI
    vista,
    setVista,

    // Datos activos
    cargandoDocumentos,
    documentosFiltrados,
    categorias,

    // Datos archivados
    documentosArchivados,
    cargandoArchivados,

    // Modal renombrar
    modalRenombrarAbierto,
    documentoRenombrar,
    closeModalRenombrar,
    handleConfirmarRenombrar,

    // Modal categorías
    modalCategoriasAbierto,
    documentoParaCategorizar,
    closeModalCategorias,
    handleConfirmarCategoria,

    // Handlers
    handleView,
    handleDownload,
    handleToggleImportante,
    handleArchive,
    handleRestore,
    handleDelete,
    handleRename,
    handleAsignarCategoria,
    getCategoriaByDocumento,
    refrescarDocumentos,

    // Filtros
    busqueda,
    categoriaFiltro,
    soloImportantes,
  }
}
