/**
 * ============================================
 * USE DOCUMENTOS LISTA (REACT QUERY) - VIVIENDAS
 * ============================================
 *
 * Hook principal para gestión de documentos de viviendas
 * Migrado de Zustand a React Query
 *
 * ADAPTADO DESDE: src/modules/documentos/hooks/useDocumentosLista.ts
 */

import { useCallback, useMemo, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'
import { useModal } from '@/shared/components/modals'
import { DocumentosViviendaService } from '../../services/documentos'
import type { DocumentoVivienda } from '../../types/documento-vivienda.types'

import {
    useArchivarDocumentoViviendaMutation,
    useCategoriasViviendaQuery,
    useDocumentosViviendaQuery,
    useEliminarDocumentoViviendaMutation,
    useRestaurarDocumentoViviendaMutation,
    useToggleImportanteViviendaMutation,
} from './useDocumentosViviendaQuery'

interface UseDocumentosListaProps {
  viviendaId: string
  onViewDocumento?: (documento: DocumentoVivienda) => void
}

export function useDocumentosLista({
  viviendaId,
  onViewDocumento,
}: UseDocumentosListaProps) {
  // Estado local UI
  const [vista, setVista] = useState<'grid' | 'lista'>('grid')
  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState<DocumentoVivienda | null>(null)
  const [modalViewerAbierto, setModalViewerAbierto] = useState(false)
  const [urlPreview, setUrlPreview] = useState<string | undefined>(undefined)

  // Estado local para filtros
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [soloImportantes, setSoloImportantes] = useState(false)

  const { user } = useAuth()
  const { confirm } = useModal()

  // ✅ REACT QUERY: Datos del servidor (cache automático)
  const { documentos, cargando: cargandoDocumentos, refrescar } = useDocumentosViviendaQuery(viviendaId)
  const { categorias } = useCategoriasViviendaQuery(user?.id)

  // ✅ REACT QUERY: Mutations
  const eliminarMutation = useEliminarDocumentoViviendaMutation(viviendaId)
  const toggleImportanteMutation = useToggleImportanteViviendaMutation(viviendaId)
  const archivarMutation = useArchivarDocumentoViviendaMutation(viviendaId)
  const restaurarMutation = useRestaurarDocumentoViviendaMutation(viviendaId)

  // Filtrado de documentos (local)
  const documentosFiltrados = useMemo(() => {
    let filtered = documentos

    if (categoriaFiltro) {
      filtered = filtered.filter(doc => doc.categoria_id === categoriaFiltro)
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

    // ✅ ORDENAMIENTO INTELIGENTE
    return filtered.sort((a, b) => {
      // 1. Documentos VENCIDOS primero (CRÍTICO)
      const aVencido = a.fecha_vencimiento && new Date(a.fecha_vencimiento) < new Date()
      const bVencido = b.fecha_vencimiento && new Date(b.fecha_vencimiento) < new Date()

      if (aVencido && !bVencido) return -1
      if (!aVencido && bVencido) return 1

      // 2. Documentos próximos a vencer (30 días)
      const calcularDiasParaVencer = (fecha: string | undefined) => {
        if (!fecha) return Infinity
        return Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }

      const diasA = calcularDiasParaVencer(a.fecha_vencimiento)
      const diasB = calcularDiasParaVencer(b.fecha_vencimiento)

      const aProximoVencer = diasA >= 0 && diasA <= 30
      const bProximoVencer = diasB >= 0 && diasB <= 30

      if (aProximoVencer && !bProximoVencer) return -1
      if (!aProximoVencer && bProximoVencer) return 1

      // Si ambos están próximos a vencer, ordenar por días restantes (menos días primero)
      if (aProximoVencer && bProximoVencer) {
        return diasA - diasB
      }

      // 3. Documentos importantes
      if (a.es_importante && !b.es_importante) return -1
      if (!a.es_importante && b.es_importante) return 1

      // 4. Más recientes primero (por fecha de creación)
      return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    })
  }, [documentos, categoriaFiltro, busqueda, soloImportantes])

  // Handlers
  const handleView = useCallback(
    async (documento: DocumentoVivienda) => {
      setDocumentoSeleccionado(documento)
      setModalViewerAbierto(true)

      // Generar URL de preview para PDFs e imágenes
      const isPDF = documento.tipo_mime?.includes('pdf')
      const isImage = documento.tipo_mime?.startsWith('image/')

      if (isPDF || isImage) {
        try {
          // Bucket privado requiere signed URL
          const { data, error } = await supabase.storage
            .from('documentos-viviendas')
            .createSignedUrl(documento.url_storage, 3600) // 1 hora

          if (error) throw error

          setUrlPreview(data.signedUrl)
        } catch (error) {
          console.error('Error al obtener URL de preview:', error)
          setUrlPreview(undefined)
        }
      } else {
        setUrlPreview(undefined)
      }

      onViewDocumento?.(documento)
    },
    [onViewDocumento]
  )

  const handleCloseViewer = useCallback(() => {
    setModalViewerAbierto(false)
    setDocumentoSeleccionado(null)
    setUrlPreview(undefined)
  }, [])

  const handleDownload = useCallback(async (documento: DocumentoVivienda) => {
    try {
      const url = await DocumentosViviendaService.obtenerUrlDescarga(
        documento.url_storage
      )
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error al descargar documento:', error)
    }
  }, [])

  const handleToggleImportante = useCallback(
    async (documento: DocumentoVivienda) => {
      try {
        await toggleImportanteMutation.mutateAsync(documento.id)
      } catch (error) {
        console.error('Error al actualizar documento:', error)
      }
    },
    [toggleImportanteMutation]
  )

  const handleArchive = useCallback(
    async (documento: DocumentoVivienda) => {
      // ✅ Si el documento ya está archivado → Confirmar antes de restaurar
      if (documento.estado === 'archivado') {
        const confirmed = await confirm({
          title: 'Restaurar documento',
          message: `¿Estás seguro de que deseas restaurar "${documento.titulo}"?\n\n✅ El documento volverá a estar activo y visible en la pestaña "Activos".\n\n💡 Podrás archivarlo nuevamente en cualquier momento.`,
          confirmText: 'Restaurar',
          variant: 'info'
        })

        if (confirmed) {
          try {
            await restaurarMutation.mutateAsync(documento.id)
          } catch (error) {
            console.error('Error al restaurar documento:', error)
          }
        }
        return
      }

      // ❌ Si está activo → Mostrar confirmación antes de archivar
      // Contar versiones para mensaje informativo
      const { total } = await DocumentosViviendaService.contarVersionesActivas(documento.id)

      const mensaje = total > 1
        ? `¿Estás seguro de que deseas archivar "${documento.titulo}"?\n\n⚠️ Se archivarán TODAS las ${total} versiones de este documento.\n\n✅ Podrás restaurarlo completo desde la pestaña "Archivados".`
        : `¿Estás seguro de que deseas archivar "${documento.titulo}"?\n\n✅ Podrás restaurarlo desde la pestaña "Archivados".`

      const confirmed = await confirm({
        title: 'Archivar documento completo',
        message: mensaje,
        confirmText: 'Archivar',
        variant: 'warning'
      })

      if (confirmed) {
        await archivarMutation.mutateAsync(documento.id)
      }
    },
    [archivarMutation, restaurarMutation, confirm]
  )

  const handleDelete = useCallback(
    async (documento: DocumentoVivienda) => {
      try {
        // 1. Verificar si el usuario es Administrador
        const esAdmin = user?.role === 'Administrador'

        // 2. Contar versiones activas del documento
        const { total } = await DocumentosViviendaService.contarVersionesActivas(documento.id)

        // 3. Construir mensaje según cantidad de versiones y rol
        let title = '¿Eliminar documento?'
        let message = ''

        if (total > 1) {
          // Documento con múltiples versiones
          title = `⚠️ Eliminar documento con ${total} versiones`
          message = `Se eliminarán TODAS las versiones de "${documento.titulo}".\n\n`

          if (esAdmin) {
            message += `📋 Si deseas eliminar solo UNA versión específica, usa el botón "Ver Historial" en la card del documento.\n\n✅ Podrás recuperar este documento desde la Papelera.\n\n¿Continuar con la eliminación completa?`
          } else {
            message += `⚠️ IMPORTANTE:\n• Los documentos eliminados solo pueden ser recuperados por un Administrador desde la Papelera.\n• Si deseas eliminar solo 1 versión específica, solicítalo a un Administrador (acción restringida).\n\n¿Continuar con la eliminación?`
          }
        } else {
          // Documento sin versiones adicionales
          if (esAdmin) {
            message = `Se eliminará "${documento.titulo}".\n\n✅ Podrás recuperarlo desde la Papelera.`
          } else {
            message = `Se eliminará "${documento.titulo}".\n\n⚠️ Solo un Administrador podrá recuperarlo desde la Papelera.\n\n¿Continuar?`
          }
        }

        const confirmed = await confirm({
          title,
          message,
          confirmText: total > 1 ? `Eliminar ${total} versiones` : 'Eliminar',
          cancelText: 'Cancelar',
          variant: 'danger'
        })

        if (confirmed) {
          await eliminarMutation.mutateAsync(documento.id)
        }
      } catch (error) {
        console.error('Error al eliminar documento:', error)
      }
    },
    [eliminarMutation, confirm, user?.role]
  )

  // Helpers
  const getCategoriaByDocumento = useCallback(
    (documento: DocumentoVivienda) => {
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
    urlPreview,

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

    // 🆕 Refrescar datos
    refrescar,
  }
}
