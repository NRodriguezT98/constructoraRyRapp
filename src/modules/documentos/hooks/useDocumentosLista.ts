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

import { supabase } from '@/lib/supabase/client'
import { useAuth } from '../../../contexts/auth-context'
import { DocumentosService } from '../services'
import { useDocumentosStore } from '../store/documentos.store'
import { DocumentoProyecto, obtenerConfiguracionEntidad, type TipoEntidad } from '../types'

import {
    useArchivarDocumentoMutation,
    useCategoriasQuery,
    useDocumentosQuery,
    useEliminarDocumentoMutation,
    useRestaurarDocumentoMutation,
    useToggleImportanteMutation,
} from './useDocumentosQuery'

interface UseDocumentosListaProps {
  entidadId: string
  tipoEntidad: TipoEntidad
  onViewDocumento?: (documento: DocumentoProyecto) => void
  defaultVista?: 'grid' | 'lista'
}

export function useDocumentosLista({
  entidadId,
  tipoEntidad,
  onViewDocumento,
  defaultVista = 'grid',
}: UseDocumentosListaProps) {
  // Estado local UI
  const [vista, setVista] = useState<'grid' | 'lista'>(defaultVista)
  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState<DocumentoProyecto | null>(null)
  const [modalViewerAbierto, setModalViewerAbierto] = useState(false)
  const [urlPreview, setUrlPreview] = useState<string | undefined>(undefined)
  const [modalArchivarAbierto, setModalArchivarAbierto] = useState(false)
  const [documentoParaArchivar, setDocumentoParaArchivar] = useState<DocumentoProyecto | null>(null)
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState(false)
  const [documentoParaRestaurar, setDocumentoParaRestaurar] = useState<DocumentoProyecto | null>(null)
  const [procesandoRestaurar, setProcesandoRestaurar] = useState(false)

  const { user } = useAuth()

  // ✅ Convertir tipoEntidad a moduleName para categorías
  const modulosCategorias: Record<TipoEntidad, 'proyectos' | 'clientes' | 'viviendas'> = {
    proyecto: 'proyectos',
    vivienda: 'viviendas',
    cliente: 'clientes',
  }

  const moduloCategoria = modulosCategorias[tipoEntidad]

  // ✅ REACT QUERY: Datos del servidor (cache automático) - GENÉRICO
  const { documentos, cargando: cargandoDocumentos, refrescar } = useDocumentosQuery(entidadId, tipoEntidad)
  const { categorias } = useCategoriasQuery(user?.id, moduloCategoria)

  // ✅ REACT QUERY: Mutations - GENÉRICO
  const eliminarMutation = useEliminarDocumentoMutation(entidadId, tipoEntidad)
  const toggleImportanteMutation = useToggleImportanteMutation(entidadId, tipoEntidad)
  const archivarMutation = useArchivarDocumentoMutation(entidadId, tipoEntidad)
  const restaurarMutation = useRestaurarDocumentoMutation(entidadId, tipoEntidad)

  // ✅ ZUSTAND: Solo estado UI (filtros, búsqueda)
  const {
    categoriaFiltro,
    busqueda,
    soloImportantes,
  } = useDocumentosStore()

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

      // 3. Documentos anclados
      if (a.es_importante && !b.es_importante) return -1
      if (!a.es_importante && b.es_importante) return 1

      // Entre anclados: ordenar por fecha de anclaje (el que se ancló primero queda primero)
      if (a.es_importante && b.es_importante) {
        const aAnclado = a.anclado_at ? new Date(a.anclado_at).getTime() : 0
        const bAnclado = b.anclado_at ? new Date(b.anclado_at).getTime() : 0
        return aAnclado - bAnclado
      }

      // 4. Más recientes primero (por fecha de creación)
      return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    })
  }, [documentos, categoriaFiltro, busqueda, soloImportantes])

  // Handlers
  const handleView = useCallback(
    async (documento: DocumentoProyecto) => {
      setDocumentoSeleccionado(documento)
      setModalViewerAbierto(true)

      // Generar URL de preview para PDFs e imágenes
      const isPDF = documento.tipo_mime?.includes('pdf')
      const isImage = documento.tipo_mime?.startsWith('image/')

      if (isPDF || isImage) {
        try {
          // Obtener configuración de bucket según tipo de entidad
          const { bucket } = obtenerConfiguracionEntidad(tipoEntidad)
          const storagePath = documento.url_storage

          // Para buckets privados, usar signed URL temporal (1 hora de validez)
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(storagePath, 3600) // 3600 segundos = 1 hora

          if (error) {
            console.error('❌ Error al crear URL firmada:', error)
            setUrlPreview(undefined)
          } else if (data?.signedUrl) {
            setUrlPreview(data.signedUrl)
          }
        } catch (error) {
          console.error('Error al obtener URL de preview:', error)
          setUrlPreview(undefined)
        }
      } else {
        setUrlPreview(undefined)
      }

      onViewDocumento?.(documento)
    },
    [onViewDocumento, tipoEntidad]
  )

  const handleCloseViewer = useCallback(() => {
    setModalViewerAbierto(false)
    setDocumentoSeleccionado(null)
    setUrlPreview(undefined)
  }, [])

  const handleDownload = useCallback(async (documento: DocumentoProyecto) => {
    try {
      const url = await DocumentosService.obtenerUrlDescarga(
        documento.url_storage,
        tipoEntidad // ✅ Pasar tipoEntidad para usar el bucket correcto
      )
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error al descargar documento:', error)
    }
  }, [tipoEntidad])

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
      // ✅ Si el documento ya está archivado → Abrir modal de confirmación
      if (documento.estado === 'archivado') {
        setDocumentoParaRestaurar(documento)
        setModalRestaurarAbierto(true)
        return
      }

      // ❌ Si está activo → Abrir modal para archivar con motivo
      setDocumentoParaArchivar(documento)
      setModalArchivarAbierto(true)
    },
    []
  )

  const confirmarArchivado = useCallback(
    async (motivoCategoria: string, motivoDetalle: string) => { // ✅ motivoDetalle obligatorio
      if (!documentoParaArchivar) return

      await archivarMutation.mutateAsync({
        documentoId: documentoParaArchivar.id,
        motivoCategoria,
        motivoDetalle,
      })

      setModalArchivarAbierto(false)
      setDocumentoParaArchivar(null)
    },
    [archivarMutation, documentoParaArchivar]
  )

  const confirmarRestauracion = useCallback(
    async () => {
      if (!documentoParaRestaurar) return

      setProcesandoRestaurar(true)
      try {
        await restaurarMutation.mutateAsync(documentoParaRestaurar.id)
        setModalRestaurarAbierto(false)
        setDocumentoParaRestaurar(null)
      } catch (error) {
        console.error('Error al restaurar documento:', error)
      } finally {
        setProcesandoRestaurar(false)
      }
    },
    [restaurarMutation, documentoParaRestaurar]
  )

  const handleDelete = useCallback(
    async (documento: DocumentoProyecto) => {
      try {
        // 1. Verificar si el usuario es Administrador
        const esAdmin = user?.role === 'Administrador'

        // 2. Contar versiones activas del documento
        const { total, versiones = [] } = await DocumentosService.contarVersionesActivas(documento.id, tipoEntidad) as any

        // 3. Construir mensaje según cantidad de versiones y rol
        let title = '¿Eliminar documento?'
        let message = ''

        if (total > 1) {
          // Documento con múltiples versiones
          title = `⚠️ Eliminar documento con ${total} versiones`
          message = `Se eliminarán TODAS las versiones de "${documento.titulo}":\n\n`

          versiones.forEach((v: any) => {
            message += `• v${v.version}: ${v.titulo}\n`
          })

          if (esAdmin) {
            message += `\n📋 Si deseas eliminar solo UNA versión específica, usa el botón "Ver Historial" en la card del documento.\n\n✅ Podrás recuperar este documento desde la Papelera.\n\n¿Continuar con la eliminación completa?`
          } else {
            message += `\n⚠️ IMPORTANTE:\n• Los documentos eliminados solo pueden ser recuperados por un Administrador desde la Papelera.\n• Si deseas eliminar solo 1 versión específica, solicítalo a un Administrador (acción restringida).\n\n¿Continuar con la eliminación?`
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
        } as any)

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
    urlPreview,
    modalArchivarAbierto,
    setModalArchivarAbierto, // ✅ Exponer setter
    documentoParaArchivar,
    modalRestaurarAbierto,
    setModalRestaurarAbierto,
    documentoParaRestaurar,
    procesandoRestaurar,

    // Datos
    documentosFiltrados,
    categorias,
    cargandoDocumentos,
    hasDocumentos,
    tipoEntidad, // ✅ Exponer tipoEntidad para componentes hijos

    // Handlers
    handleView,
    handleCloseViewer,
    handleDownload,
    handleToggleImportante,
    handleArchive,
    confirmarArchivado,
    confirmarRestauracion,
    handleDelete,
    getCategoriaByDocumento,

    // 🆕 Refrescar datos
    refrescar,
  }
}
