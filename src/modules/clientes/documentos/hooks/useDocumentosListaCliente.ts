'use client'

import { useAuth } from '@/contexts/auth-context'
import { useModal } from '@/shared/components/modals'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DocumentosClienteService } from '../services/documentos-cliente.service'
import { useDocumentosClienteStore } from '../store/documentos-cliente.store'

// ✅ TIPOS
interface UseDocumentosListaClienteProps {
  clienteId: string
  cedulaUrl?: string | null
  numeroDocumento?: string
  cedulaTituloPersonalizado?: string | null
}

/**
 * ⭐ HOOK: useDocumentosListaCliente
 *
 * Extrae TODA la lógica de documentos-lista-cliente:
 * - Carga de documentos y categorías
 * - Creación de documento virtual para cédula
 * - Filtrado de documentos
 * - Handlers para acciones (ver, descargar, importante, archivar, eliminar)
 * - Handlers de modales (renombrar, categorizar)
 * - Vista (grid/lista/agrupada)
 */
export function useDocumentosListaCliente({
  clienteId,
  cedulaUrl,
  numeroDocumento,
  cedulaTituloPersonalizado
}: UseDocumentosListaClienteProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { confirm } = useModal()

  // Zustand store
  const {
    documentos,
    categorias,
    cargandoDocumentos,
    cargarDocumentos,
    cargarCategorias,
    actualizarDocumentoLocal,
    // Filtros
    categoriaFiltro,
    busqueda,
    soloImportantes,
  } = useDocumentosClienteStore()

  // Estados locales
  const [vista, setVista] = useState<'grid' | 'lista'>('lista')
  const [documentoRenombrar, setDocumentoRenombrar] = useState<any | null>(null)
  const [modalRenombrarAbierto, setModalRenombrarAbierto] = useState(false)
  const [documentoParaCategorizar, setDocumentoParaCategorizar] = useState<any | null>(null)
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)
  const [vistaAgrupada, setVistaAgrupada] = useState(false)
  const [cedulaTituloLocal, setCedulaTituloLocal] = useState<string | null>(
    cedulaTituloPersonalizado || null
  )

  // ✅ CARGAR DATOS AL MONTAR
  useEffect(() => {
    if (clienteId) {
      cargarDocumentos(clienteId)
    }

    if (user?.id) {
      cargarCategorias(user.id)
    }
  }, [clienteId, user, cargarDocumentos, cargarCategorias])

  // ✅ CATEGORÍA "Documentos de Identidad"
  const categoriaIdentidad = useMemo(() => {
    return categorias.find((cat) => cat.nombre === 'Documentos de Identidad')
  }, [categorias])

  // ✅ DOCUMENTO VIRTUAL PARA CÉDULA
  const cedulaDocumento = useMemo(() => {
    if (!cedulaUrl) return null

    return {
      id: 'cedula-ciudadania',
      titulo: cedulaTituloLocal || 'Cédula de Ciudadanía',
      descripcion: `CC ${numeroDocumento || 'N/A'}`,
      url_storage: cedulaUrl,
      nombre_original: `cedula-${numeroDocumento || 'documento'}.pdf`,
      nombre_archivo: `cedula-${numeroDocumento || 'documento'}.pdf`,
      tipo_mime: 'application/pdf',
      tamano_bytes: 1024,
      tamanio: 1024,
      es_importante: true,
      es_requerido: true,
      categoria_id: categoriaIdentidad?.id || null,
      fecha_subida: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
      fecha_vencimiento: null,
      subido_por: null,
      cliente_id: clienteId,
      proyecto_id: null,
      es_archivado: false,
      version: 1,
      notas: 'Documento de identidad del cliente',
      etiquetas: ['Documentos de Identidad', 'Requerido'],
    }
  }, [cedulaUrl, cedulaTituloLocal, numeroDocumento, clienteId, categoriaIdentidad])

  // ✅ COMBINAR CÉDULA CON DOCUMENTOS
  const todosDocumentos = useMemo(() => {
    return cedulaDocumento ? [cedulaDocumento, ...documentos] : documentos
  }, [cedulaDocumento, documentos])

  // ✅ FILTROS
  const documentosFiltrados = useMemo(() => {
    return todosDocumentos.filter(doc => {
      // Filtro por categoría
      if (categoriaFiltro && doc.categoria_id !== categoriaFiltro) return false

      // Filtro por búsqueda
      if (busqueda) {
        const searchLower = busqueda.toLowerCase()
        const tituloMatch = doc.titulo.toLowerCase().includes(searchLower)
        const descripcionMatch = doc.descripcion?.toLowerCase().includes(searchLower)
        if (!tituloMatch && !descripcionMatch) return false
      }

      // Filtro solo importantes
      if (soloImportantes && !doc.es_importante) return false

      return true
    })
  }, [todosDocumentos, categoriaFiltro, busqueda, soloImportantes])

  // ✅ HANDLERS DE ACCIONES
  const handleView = useCallback(async (documento: any) => {
    try {
      // Si es la cédula o ya es una URL completa, usar directamente
      if (documento.id === 'cedula-ciudadania' || documento.url_storage.startsWith('http')) {
        window.open(documento.url_storage, '_blank')
        return
      }

      const url = await DocumentosClienteService.obtenerUrlDescarga(documento.url_storage)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error al abrir documento:', error)
      toast.error('Error al abrir el documento')
    }
  }, [])

  const handleDownload = useCallback(async (documento: any) => {
    try {
      // Si es la cédula o ya es una URL completa, usar directamente
      if (documento.id === 'cedula-ciudadania' || documento.url_storage.startsWith('http')) {
        const link = document.createElement('a')
        link.href = documento.url_storage
        link.download = documento.nombre_original
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Descarga iniciada')
        return
      }

      const url = await DocumentosClienteService.obtenerUrlDescarga(documento.url_storage)
      const link = document.createElement('a')
      link.href = url
      link.download = documento.nombre_original
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Descarga iniciada')
    } catch (error) {
      console.error('Error al descargar:', error)
      toast.error('Error al descargar el documento')
    }
  }, [])

  const handleToggleImportante = useCallback(async (documento: any) => {
    // No permitir cambiar importancia de la cédula
    if (documento.id === 'cedula-ciudadania') {
      toast.info('La cédula de ciudadanía siempre es un documento importante')
      return
    }

    try {
      await DocumentosClienteService.actualizarDocumento(documento.id, {
        es_importante: !documento.es_importante,
      })
      await cargarDocumentos(clienteId)
      toast.success(
        documento.es_importante
          ? 'Documento desmarcado como importante'
          : 'Documento marcado como importante'
      )
    } catch (error) {
      console.error('Error al actualizar:', error)
      toast.error('Error al actualizar el documento')
    }
  }, [clienteId, cargarDocumentos])

  const handleArchive = useCallback(async (documento: any) => {
    // No permitir archivar la cédula
    if (documento.id === 'cedula-ciudadania') {
      toast.info('La cédula de ciudadanía no puede archivarse. Puedes eliminarla si lo necesitas.')
      return
    }

    try {
      await DocumentosClienteService.archivarDocumento(documento.id)
      await cargarDocumentos(clienteId)
      toast.success('Documento archivado')
    } catch (error) {
      console.error('Error al archivar:', error)
      toast.error('Error al archivar el documento')
    }
  }, [clienteId, cargarDocumentos])

  const handleDelete = useCallback(async (documento: any) => {
    // Si es la cédula, eliminar desde el cliente
    if (documento.id === 'cedula-ciudadania') {
      const confirmed = await confirm({
        title: '¿Eliminar Cédula de Ciudadanía?',
        message: 'Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        variant: 'danger'
      })

      if (!confirmed) return

      try {
        const { clientesService } = await import('@/modules/clientes/services/clientes.service')
        await clientesService.actualizarCliente(clienteId, {
          documento_identidad_url: null
        })

        toast.success('Cédula eliminada correctamente')
        router.refresh()
      } catch (error) {
        console.error('Error al eliminar cédula:', error)
        toast.error('Error al eliminar la cédula')
      }
      return
    }

    const confirmed = await confirm({
      title: '¿Eliminar documento?',
      message: `Se eliminará permanentemente "${documento.titulo}".\n\nEsta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger'
    })

    if (!confirmed) return

    try {
      await DocumentosClienteService.eliminarDocumento(documento.id)
      await cargarDocumentos(clienteId)
      toast.success('Documento eliminado')
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast.error('Error al eliminar el documento')
    }
  }, [clienteId, router, cargarDocumentos, confirm])

  // ✅ HANDLERS DE MODALES
  const handleRename = useCallback((documento: any) => {
    setDocumentoRenombrar(documento)
    setModalRenombrarAbierto(true)
  }, [])

  const handleConfirmarRenombrar = useCallback(async (nuevoTitulo: string) => {
    if (!documentoRenombrar) return

    try {
      // Si es la cédula, guardar título en campo personalizado
      if (documentoRenombrar.id === 'cedula-ciudadania') {
        // 1. Actualizar UI inmediatamente (optimistic update)
        setCedulaTituloLocal(nuevoTitulo)

        // 2. Guardar en servidor en background
        const { clientesService } = await import('@/modules/clientes/services/clientes.service')
        await clientesService.actualizarCliente(clienteId, {
          documento_identidad_titulo: nuevoTitulo
        })

        // 3. Refrescar datos del servidor
        router.refresh()
        return
      }

      // Para documentos normales: Optimistic update
      actualizarDocumentoLocal(documentoRenombrar.id, {
        titulo: nuevoTitulo,
        fecha_actualizacion: new Date().toISOString()
      })

      await DocumentosClienteService.renombrarDocumento(
        documentoRenombrar.id,
        nuevoTitulo
      )

      await cargarDocumentos(clienteId)
    } catch (error) {
      // Revertir cambios si falla
      if (documentoRenombrar.id === 'cedula-ciudadania') {
        setCedulaTituloLocal(cedulaTituloPersonalizado || null)
      } else {
        await cargarDocumentos(clienteId)
      }
      throw error
    }
  }, [
    documentoRenombrar,
    clienteId,
    router,
    actualizarDocumentoLocal,
    cargarDocumentos,
    cedulaTituloPersonalizado
  ])

  const handleAsignarCategoria = useCallback((documento: any) => {
    // La cédula ya tiene categoría fija
    if (documento.id === 'cedula-ciudadania') {
      toast.info('La cédula siempre mantiene la categoría "Documentos de Identidad"')
      return
    }
    setDocumentoParaCategorizar(documento)
    setModalCategoriasAbierto(true)
  }, [])

  const handleConfirmarCategoria = useCallback(async (categoriaId: string) => {
    if (!documentoParaCategorizar) return

    try {
      await DocumentosClienteService.actualizarCategoria(
        documentoParaCategorizar.id,
        categoriaId
      )
      await cargarDocumentos(clienteId)
      toast.success('Categoría asignada correctamente')
      setModalCategoriasAbierto(false)
      setDocumentoParaCategorizar(null)
    } catch (error) {
      console.error('Error al asignar categoría:', error)
      toast.error('Error al asignar categoría')
    }
  }, [documentoParaCategorizar, clienteId, cargarDocumentos])

  // ✅ UTILIDADES
  const getCategoriaByDocumento = useCallback((documento: any) => {
    const categoria = categorias.find((c) => c.id === documento.categoria_id)
    return categoria || null
  }, [categorias])

  const closeModalRenombrar = useCallback(() => {
    setModalRenombrarAbierto(false)
    setDocumentoRenombrar(null)
  }, [])

  const closeModalCategorias = useCallback(() => {
    setModalCategoriasAbierto(false)
    setDocumentoParaCategorizar(null)
  }, [])

  return {
    // Estado
    vista,
    setVista,
    vistaAgrupada,
    setVistaAgrupada,
    cargandoDocumentos,
    documentosFiltrados,
    categorias,

    // Modales - Renombrar
    modalRenombrarAbierto,
    documentoRenombrar,
    closeModalRenombrar,
    handleConfirmarRenombrar,

    // Modales - Categorías
    modalCategoriasAbierto,
    documentoParaCategorizar,
    closeModalCategorias,
    handleConfirmarCategoria,

    // Handlers de acciones
    handleView,
    handleDownload,
    handleToggleImportante,
    handleArchive,
    handleDelete,
    handleRename,
    handleAsignarCategoria,

    // Utilidades
    getCategoriaByDocumento,

    // Filtros (desde store)
    busqueda,
    categoriaFiltro,
    soloImportantes,
  }
}
