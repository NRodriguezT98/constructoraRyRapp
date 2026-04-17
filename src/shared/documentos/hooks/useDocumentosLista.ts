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

import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import { DocumentosService } from '../services'
import { useDocumentosStore } from '../store/documentos.store'
import {
  DocumentoProyecto,
  obtenerConfiguracionEntidad,
  type TipoEntidad,
} from '../types'

import {
  useActualizarCarpetaMutation,
  useBreadcrumbsQuery,
  useCarpetasQuery,
  useCrearCarpetaMutation,
  useEliminarCarpetaMutation,
  useMoverDocumentoACarpetaMutation,
} from './useCarpetasQuery'
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

export type SortCol =
  | 'titulo'
  | 'fecha_creacion'
  | 'fecha_documento'
  | 'tamano_bytes'

export function useDocumentosLista({
  entidadId,
  tipoEntidad,
  onViewDocumento,
  defaultVista = 'grid',
}: UseDocumentosListaProps) {
  // Estado local UI
  const [vista, setVista] = useState<'grid' | 'lista'>(defaultVista)
  const [carpetaActualId, setCarpetaActualId] = useState<string | null>(null)
  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState<DocumentoProyecto | null>(null)
  const [modalViewerAbierto, setModalViewerAbierto] = useState(false)
  const [urlPreview, setUrlPreview] = useState<string | undefined>(undefined)
  const [modalArchivarAbierto, setModalArchivarAbierto] = useState(false)
  const [documentoParaArchivar, setDocumentoParaArchivar] =
    useState<DocumentoProyecto | null>(null)
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState(false)
  const [documentoParaRestaurar, setDocumentoParaRestaurar] =
    useState<DocumentoProyecto | null>(null)
  const [procesandoRestaurar, setProcesandoRestaurar] = useState(false)
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
  const [documentoParaEliminar, setDocumentoParaEliminar] =
    useState<DocumentoProyecto | null>(null)
  const [datosModalEliminar, setDatosModalEliminar] = useState<{
    title: string
    message: string
    confirmText: string
  }>({ title: '', message: '', confirmText: 'Eliminar' })
  const [procesandoEliminar, setProcesandoEliminar] = useState(false)

  const { user, perfil } = useAuth()

  // ✅ Convertir tipoEntidad a moduleName para categorías
  const modulosCategorias: Record<
    TipoEntidad,
    'proyectos' | 'clientes' | 'viviendas'
  > = {
    proyecto: 'proyectos',
    vivienda: 'viviendas',
    cliente: 'clientes',
  }

  const moduloCategoria = modulosCategorias[tipoEntidad]

  // ✅ REACT QUERY: Datos del servidor (cache automático) - GENÉRICO
  const {
    documentos,
    cargando: cargandoDocumentos,
    refrescar,
  } = useDocumentosQuery(entidadId, tipoEntidad)
  const { categorias, cargando: cargandoCategorias } = useCategoriasQuery(
    user?.id,
    moduloCategoria
  )

  // ✅ REACT QUERY: Carpetas
  const { carpetas, cargando: cargandoCarpetas } = useCarpetasQuery(
    entidadId,
    tipoEntidad,
    carpetaActualId
  )
  const { breadcrumbs } = useBreadcrumbsQuery(carpetaActualId)
  const crearCarpetaMutation = useCrearCarpetaMutation(entidadId, tipoEntidad)
  const actualizarCarpetaMutation = useActualizarCarpetaMutation(
    entidadId,
    tipoEntidad
  )
  const eliminarCarpetaMutation = useEliminarCarpetaMutation(
    entidadId,
    tipoEntidad
  )
  const moverDocumentoMutation = useMoverDocumentoACarpetaMutation(
    entidadId,
    tipoEntidad
  )

  // ✅ REACT QUERY: Mutations - GENÉRICO
  const eliminarMutation = useEliminarDocumentoMutation(entidadId, tipoEntidad)
  const toggleImportanteMutation = useToggleImportanteMutation(
    entidadId,
    tipoEntidad
  )
  const archivarMutation = useArchivarDocumentoMutation(entidadId, tipoEntidad)
  const restaurarMutation = useRestaurarDocumentoMutation(
    entidadId,
    tipoEntidad
  )

  // ✅ ZUSTAND: Solo estado UI (filtros, búsqueda, vista activa)
  const { categoriaFiltro, busqueda, soloImportantes, vistaActual } =
    useDocumentosStore()

  // Filtrado de documentos (local)
  const documentosFiltrados = useMemo(() => {
    let filtered = documentos

    // ✅ Filtrar por carpeta actual (null = raíz = docs sin carpeta)
    filtered = filtered.filter(doc => {
      const docCarpetaId =
        (doc as unknown as Record<string, unknown>).carpeta_id ?? null
      return docCarpetaId === carpetaActualId
    })

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
      const aVencido =
        a.fecha_vencimiento && new Date(a.fecha_vencimiento) < new Date()
      const bVencido =
        b.fecha_vencimiento && new Date(b.fecha_vencimiento) < new Date()

      if (aVencido && !bVencido) return -1
      if (!aVencido && bVencido) return 1

      // 2. Documentos próximos a vencer (30 días)
      const calcularDiasParaVencer = (fecha: string | undefined) => {
        if (!fecha) return Infinity
        return Math.ceil(
          (new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
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
      return (
        new Date(b.fecha_creacion).getTime() -
        new Date(a.fecha_creacion).getTime()
      )
    })
  }, [documentos, carpetaActualId, categoriaFiltro, busqueda, soloImportantes])

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
            logger.error('❌ Error al crear URL firmada:', error)
            setUrlPreview(undefined)
          } else if (data?.signedUrl) {
            setUrlPreview(data.signedUrl)
          }
        } catch (error) {
          logger.error('Error al obtener URL de preview:', error)
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

  const handleDownload = useCallback(
    async (documento: DocumentoProyecto) => {
      try {
        const url = await DocumentosService.obtenerUrlDescarga(
          documento.url_storage,
          tipoEntidad // ✅ Pasar tipoEntidad para usar el bucket correcto
        )
        window.open(url, '_blank')
      } catch (error) {
        logger.error('Error al descargar documento:', error)
      }
    },
    [tipoEntidad]
  )

  const handleToggleImportante = useCallback(
    async (documento: DocumentoProyecto) => {
      try {
        await toggleImportanteMutation.mutateAsync(documento.id)
      } catch (error) {
        logger.error('Error al actualizar documento:', error)
      }
    },
    [toggleImportanteMutation]
  )

  const handleArchive = useCallback(async (documento: DocumentoProyecto) => {
    // ✅ Si el documento ya está archivado → Abrir modal de confirmación
    if (documento.estado === 'archivado') {
      setDocumentoParaRestaurar(documento)
      setModalRestaurarAbierto(true)
      return
    }

    // ❌ Si está activo → Abrir modal para archivar con motivo
    setDocumentoParaArchivar(documento)
    setModalArchivarAbierto(true)
  }, [])

  const confirmarArchivado = useCallback(
    async (motivoCategoria: string, motivoDetalle: string) => {
      // ✅ motivoDetalle obligatorio
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

  const confirmarRestauracion = useCallback(async () => {
    if (!documentoParaRestaurar) return

    setProcesandoRestaurar(true)
    try {
      await restaurarMutation.mutateAsync(documentoParaRestaurar.id)
      setModalRestaurarAbierto(false)
      setDocumentoParaRestaurar(null)
    } catch (error) {
      logger.error('Error al restaurar documento:', error)
    } finally {
      setProcesandoRestaurar(false)
    }
  }, [restaurarMutation, documentoParaRestaurar])

  const handleDelete = useCallback(
    async (documento: DocumentoProyecto) => {
      try {
        // 1. Verificar si el usuario es Administrador
        const esAdmin = perfil?.rol === 'Administrador'

        // 2. Contar versiones activas del documento
        const { total, versiones = [] } =
          await DocumentosService.contarVersionesActivas(
            documento.id,
            tipoEntidad
          )

        // 3. Construir mensaje según cantidad de versiones y rol
        let title = '¿Eliminar documento?'
        let message = ''
        let confirmText = 'Eliminar'

        if (total > 1) {
          title = `Eliminar documento con ${total} versiones`
          const listaVersiones = versiones
            .map(v => `• v${v.version}: ${v.titulo}`)
            .join('\n')

          if (esAdmin) {
            message = `Se eliminarán TODAS las versiones de "${documento.titulo}":\n\n${listaVersiones}\n\nPodrás recuperar este documento desde la Papelera.`
          } else {
            message = `Se eliminarán TODAS las versiones de "${documento.titulo}":\n\n${listaVersiones}\n\nSolo un Administrador podrá recuperarlo desde la Papelera.`
          }
          confirmText = `Eliminar ${total} versiones`
        } else {
          if (esAdmin) {
            message = `Se eliminará "${documento.titulo}". Podrás recuperarlo desde la Papelera.`
          } else {
            message = `Se eliminará "${documento.titulo}". Solo un Administrador podrá recuperarlo desde la Papelera.`
          }
        }

        // 4. Abrir modal de confirmación (reemplaza el confirm() nativo roto)
        setDocumentoParaEliminar(documento)
        setDatosModalEliminar({ title, message, confirmText })
        setModalEliminarAbierto(true)
      } catch (error) {
        logger.error('Error al preparar eliminación:', error)
      }
    },
    [perfil?.rol, tipoEntidad]
  )

  const confirmarEliminar = useCallback(async () => {
    if (!documentoParaEliminar) return
    setProcesandoEliminar(true)
    try {
      await eliminarMutation.mutateAsync(documentoParaEliminar.id)
      setModalEliminarAbierto(false)
      setDocumentoParaEliminar(null)
    } catch (error) {
      logger.error('Error al eliminar documento:', error)
    } finally {
      setProcesandoEliminar(false)
    }
  }, [eliminarMutation, documentoParaEliminar])

  const cancelarEliminar = useCallback(() => {
    setModalEliminarAbierto(false)
    setDocumentoParaEliminar(null)
  }, [])

  // Helpers
  // ─── Ordenamiento de columna (delegado desde documentos-lista.tsx) ───────────
  const [sortCol, setSortCol] = useState<SortCol>('titulo')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = useCallback(
    (col: SortCol) => {
      if (sortCol === col) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortCol(col)
        setSortDir('asc')
      }
    },
    [sortCol]
  )

  // Filtrar por tab activa (activos / archivados)
  const documentosMostrar = useMemo(
    () =>
      documentosFiltrados.filter(doc =>
        vistaActual === 'archivados'
          ? doc.estado === 'archivado'
          : doc.estado === 'activo'
      ),
    [documentosFiltrados, vistaActual]
  )

  // Ordenar lista — anclados SIEMPRE flotan arriba
  const documentosOrdenados = useMemo(() => {
    return [...documentosMostrar].sort((a, b) => {
      if (a.es_importante && !b.es_importante) return -1
      if (!a.es_importante && b.es_importante) return 1

      if (a.es_importante && b.es_importante) {
        const aAt = a.anclado_at ? new Date(a.anclado_at).getTime() : 0
        const bAt = b.anclado_at ? new Date(b.anclado_at).getTime() : 0
        return aAt - bAt
      }

      const mult = sortDir === 'asc' ? 1 : -1
      if (sortCol === 'titulo') return a.titulo.localeCompare(b.titulo) * mult
      if (sortCol === 'fecha_creacion')
        return (
          (new Date(a.fecha_creacion).getTime() -
            new Date(b.fecha_creacion).getTime()) *
          mult
        )
      if (sortCol === 'fecha_documento')
        return (
          ((a.fecha_documento ? new Date(a.fecha_documento).getTime() : 0) -
            (b.fecha_documento ? new Date(b.fecha_documento).getTime() : 0)) *
          mult
        )
      if (sortCol === 'tamano_bytes')
        return ((a.tamano_bytes ?? 0) - (b.tamano_bytes ?? 0)) * mult
      return 0
    })
  }, [documentosMostrar, sortCol, sortDir])
  // ─────────────────────────────────────────────────────────────────────────────

  const getCategoriaByDocumento = useCallback(
    (documento: DocumentoProyecto) => {
      return categorias.find(c => c.id === documento.categoria_id)
    },
    [categorias]
  )

  const hasDocumentos = documentos.length > 0

  // ✅ Handlers de carpetas
  const navegarACarpeta = useCallback((carpetaId: string | null) => {
    setCarpetaActualId(carpetaId)
  }, [])

  const handleCrearCarpeta = useCallback(
    async (nombre: string, descripcion?: string) => {
      await crearCarpetaMutation.mutateAsync({
        nombre,
        descripcion,
        padreId: carpetaActualId,
      })
    },
    [crearCarpetaMutation, carpetaActualId]
  )

  const handleRenombrarCarpeta = useCallback(
    async (carpetaId: string, nombre: string) => {
      await actualizarCarpetaMutation.mutateAsync({
        carpetaId,
        updates: { nombre },
      })
    },
    [actualizarCarpetaMutation]
  )

  const handleEliminarCarpeta = useCallback(
    async (carpetaId: string) => {
      await eliminarCarpetaMutation.mutateAsync(carpetaId)
    },
    [eliminarCarpetaMutation]
  )

  const handleMoverDocumento = useCallback(
    async (documentoId: string, carpetaDestinoId: string | null) => {
      await moverDocumentoMutation.mutateAsync({
        documentoId,
        carpetaId: carpetaDestinoId,
      })
    },
    [moverDocumentoMutation]
  )

  return {
    // Estado UI
    vista,
    setVista,
    documentoSeleccionado,
    modalViewerAbierto,
    urlPreview,
    modalArchivarAbierto,
    setModalArchivarAbierto,
    documentoParaArchivar,
    modalRestaurarAbierto,
    setModalRestaurarAbierto,
    documentoParaRestaurar,
    procesandoRestaurar,
    // Modal eliminar
    modalEliminarAbierto,
    documentoParaEliminar,
    datosModalEliminar,
    procesandoEliminar,
    confirmarEliminar,
    cancelarEliminar,

    // Datos
    documentosFiltrados,
    documentosMostrar,
    documentosOrdenados,
    sortCol,
    sortDir,
    toggleSort,
    categorias,
    cargandoDocumentos: cargandoDocumentos || cargandoCategorias,
    hasDocumentos,
    tipoEntidad,

    // ✅ Carpetas
    carpetas,
    carpetaActualId,
    breadcrumbs,
    cargandoCarpetas,
    navegarACarpeta,
    handleCrearCarpeta,
    handleRenombrarCarpeta,
    handleEliminarCarpeta,
    handleMoverDocumento,
    crearCarpetaCargando: crearCarpetaMutation.isPending,
    moverDocumentoCargando: moverDocumentoMutation.isPending,

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

    // Refrescar datos
    refrescar,
  }
}
