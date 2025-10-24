'use client'

import { useAuth } from '@/contexts/auth-context'
import { DocumentoCard } from '@/modules/documentos/components/lista/documento-card'
import { DocumentoCardHorizontal } from '@/modules/documentos/components/lista/documento-card-horizontal'
import { AnimatePresence, motion } from 'framer-motion'
import { FileX, LayoutGrid, List } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DocumentosClienteService } from '../services/documentos-cliente.service'
import { useDocumentosClienteStore } from '../store/documentos-cliente.store'
import { DocumentoCategoriasModal } from './documento-categorias-modal'
import { DocumentoRenombrarModal } from './documento-renombrar-modal'
import { DocumentosAgrupados } from './documentos-agrupados'
import { DocumentosFiltrosCliente } from './documentos-filtros-cliente'

interface DocumentosListaClienteProps {
  clienteId: string
  cedulaUrl?: string | null
  numeroDocumento?: string
  cedulaTituloPersonalizado?: string | null
}

export function DocumentosListaCliente({
  clienteId,
  cedulaUrl,
  numeroDocumento,
  cedulaTituloPersonalizado
}: DocumentosListaClienteProps) {
  const router = useRouter()
  const { user } = useAuth()
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
  const [vista, setVista] = useState<'grid' | 'lista'>('lista')
  const [documentoRenombrar, setDocumentoRenombrar] = useState<any | null>(null)
  const [modalRenombrarAbierto, setModalRenombrarAbierto] = useState(false)

  // Estado para modal de categorías
  const [documentoParaCategorizar, setDocumentoParaCategorizar] = useState<any | null>(null)
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)

  // Estado para vista agrupada
  const [vistaAgrupada, setVistaAgrupada] = useState(false)

  // Estado local para título de cédula (optimistic update)
  const [cedulaTituloLocal, setCedulaTituloLocal] = useState<string | null>(
    cedulaTituloPersonalizado || null
  )

  // ✅ CARGAR DATOS AL MONTAR EL COMPONENTE
  useEffect(() => {
    console.log('📋 [DocumentosListaCliente] Montando componente, cargando datos...')
    console.log('  - clienteId:', clienteId)
    console.log('  - user:', user?.id)

    // Cargar documentos del cliente
    if (clienteId) {
      console.log('  - Llamando cargarDocumentos...')
      cargarDocumentos(clienteId)
    }

    // Cargar categorías (necesarias para filtros)
    if (user?.id) {
      console.log('  - Llamando cargarCategorias...')
      cargarCategorias(user.id)
    }
  }, [clienteId, user, cargarDocumentos, cargarCategorias])

  // Debug: Mostrar estado actual
  useEffect(() => {
    console.log('📊 [DocumentosListaCliente] Estado actual:')
    console.log('  - documentos.length:', documentos.length)
    console.log('  - categorias.length:', categorias.length)
    console.log('  - cargandoDocumentos:', cargandoDocumentos)
    console.log('  - filtros activos:', { categoriaFiltro, busqueda, soloImportantes })
  }, [documentos, categorias, cargandoDocumentos, categoriaFiltro, busqueda, soloImportantes])

  // Crear documento virtual para la cédula
  const cedulaDocumento = cedulaUrl ? {
    id: 'cedula-ciudadania',
    titulo: cedulaTituloLocal || 'Cédula de Ciudadanía', // Usar título local (optimistic)
    descripcion: `CC ${numeroDocumento || 'N/A'}`,
    url_storage: cedulaUrl,
    nombre_original: `cedula-${numeroDocumento || 'documento'}.pdf`,
    nombre_archivo: `cedula-${numeroDocumento || 'documento'}.pdf`,
    tipo_mime: 'application/pdf',
    tamano_bytes: 1024, // Tamaño estimado (se mostrará como "1 KB")
    tamanio: 1024,
    es_importante: true,
    es_requerido: true,
    categoria_id: null,
    fecha_subida: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    fecha_vencimiento: null, // Sin fecha de vencimiento
    subido_por: null,
    cliente_id: clienteId,
    proyecto_id: null,
    es_archivado: false,
    version: 1,
    notas: 'Documento de identidad del cliente',
    etiquetas: ['Identidad', 'Requerido'], // Etiquetas para el documento
  } : null

  // Combinar cédula con otros documentos
  const todosDocumentos = cedulaDocumento
    ? [cedulaDocumento, ...documentos]
    : documentos

  // Aplicar filtros
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

  // Handlers
  const handleView = async (documento: any) => {
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
  }

  const handleDownload = async (documento: any) => {
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
  }

  const handleToggleImportante = async (documento: any) => {
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
  }

  const handleArchive = async (documento: any) => {
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
  }

  const handleDelete = async (documento: any) => {
    // Si es la cédula, eliminar desde el cliente
    if (documento.id === 'cedula-ciudadania') {
      if (
        !window.confirm(
          `¿Estás seguro de eliminar la Cédula de Ciudadanía? Esta acción no se puede deshacer.`
        )
      ) {
        return
      }

      try {
        // Importar el servicio de clientes dinámicamente
        const { clientesService } = await import('@/modules/clientes/services/clientes.service')

        // Actualizar el cliente para quitar la cédula
        await clientesService.actualizarCliente(clienteId, {
          documento_identidad_url: null
        })

        toast.success('Cédula eliminada correctamente')

        // Refrescar datos del servidor SIN recargar la página
        router.refresh()
      } catch (error) {
        console.error('Error al eliminar cédula:', error)
        toast.error('Error al eliminar la cédula')
      }
      return
    }

    if (
      !window.confirm(
        `¿Estás seguro de eliminar "${documento.titulo}"? Esta acción no se puede deshacer.`
      )
    ) {
      return
    }

    try {
      await DocumentosClienteService.eliminarDocumento(documento.id)
      await cargarDocumentos(clienteId)
      toast.success('Documento eliminado')
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast.error('Error al eliminar el documento')
    }
  }

  const getCategoriaByDocumento = (documento: any) => {
    return categorias.find((c) => c.id === documento.categoria_id) || null
  }

  const handleRename = async (documento: any) => {
    setDocumentoRenombrar(documento)
    setModalRenombrarAbierto(true)
  }

  const handleConfirmarRenombrar = async (nuevoTitulo: string) => {
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

        // 3. Refrescar datos del servidor (en background, sin bloquear UI)
        router.refresh()
        return
      }

      // Para documentos normales: Optimistic update
      // 1. Actualizar UI inmediatamente (antes de confirmar con servidor)
      actualizarDocumentoLocal(documentoRenombrar.id, {
        titulo: nuevoTitulo,
        fecha_actualizacion: new Date().toISOString()
      })

      // 2. Guardar en servidor en background
      await DocumentosClienteService.renombrarDocumento(
        documentoRenombrar.id,
        nuevoTitulo
      )

      // 3. Opcional: Recargar desde servidor para confirmar
      // (En caso de que el servidor haya modificado algo más)
      await cargarDocumentos(clienteId)
    } catch (error) {
      // Si falla, revertir cambios
      if (documentoRenombrar.id === 'cedula-ciudadania') {
        setCedulaTituloLocal(cedulaTituloPersonalizado || null)
      } else {
        await cargarDocumentos(clienteId)
      }
      throw error // El modal maneja el error
    }
  }

  const handleAsignarCategoria = async (documento: any) => {
    if (documento.id === 'cedula-ciudadania') {
      toast.error('No se puede categorizar la cédula de ciudadanía')
      return
    }
    setDocumentoParaCategorizar(documento)
    setModalCategoriasAbierto(true)
  }

  const handleConfirmarCategoria = async (categoriaId: string) => {
    if (!documentoParaCategorizar) return

    try {
      // Actualizar categoría en BD
      await DocumentosClienteService.actualizarCategoria(
        documentoParaCategorizar.id,
        categoriaId
      )

      // Refrescar documentos
      await cargarDocumentos(clienteId)

      toast.success('Categoría asignada correctamente')
      setModalCategoriasAbierto(false)
      setDocumentoParaCategorizar(null)
    } catch (error) {
      console.error('Error al asignar categoría:', error)
      toast.error('Error al asignar categoría')
    }
  }

  if (cargandoDocumentos) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Filtros y controles */}
      <div className='space-y-4'>
        <DocumentosFiltrosCliente onChangeVista={setVista} />

        {/* Toggle Vista Agrupada */}
        <div className='flex justify-end'>
          <button
            onClick={() => setVistaAgrupada(!vistaAgrupada)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              vistaAgrupada
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {vistaAgrupada ? <LayoutGrid size={18} /> : <List size={18} />}
            <span className='text-sm'>
              {vistaAgrupada ? 'Vista Agrupada' : 'Vista Normal'}
            </span>
          </button>
        </div>
      </div>

      {/* Debug info */}
      <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-900/20'>
        <p className='font-semibold text-blue-900 dark:text-blue-100'>
          🔍 Debug Info:
        </p>
        <ul className='mt-2 space-y-1 text-blue-700 dark:text-blue-300'>
          <li>Total documentos en store: {documentos.length}</li>
          <li>Con cédula: {todosDocumentos.length}</li>
          <li>Después de filtros: {documentosFiltrados.length}</li>
          <li>Categorías disponibles: {categorias.length}</li>
          <li>Filtros activos: {JSON.stringify({ categoriaFiltro, busqueda, soloImportantes })}</li>
        </ul>
      </div>

      {/* Lista de documentos */}
      {documentosFiltrados.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-800/50'>
          <FileX className='mb-4 h-16 w-16 text-gray-400' />
          <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
            No hay documentos
          </h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {busqueda || categoriaFiltro || soloImportantes
              ? 'No se encontraron documentos con los filtros aplicados'
              : 'Sube documentos para comenzar'}
          </p>
        </div>
      ) : vistaAgrupada ? (
        // Vista agrupada por categorías
        <DocumentosAgrupados
          documentos={documentosFiltrados}
          categorias={categorias}
          onView={handleView}
          onDownload={handleDownload}
          onToggleImportante={handleToggleImportante}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onRename={handleRename}
          onAsignarCategoria={handleAsignarCategoria}
        />
      ) : (
        <AnimatePresence mode='popLayout'>
          {vista === 'grid' ? (
            <motion.div
              key='grid'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
            >
              {documentosFiltrados.map((documento, index) => {
                const categoria = getCategoriaByDocumento(documento)
                return (
                  <motion.div
                    key={documento.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DocumentoCard
                      documento={documento as any}
                      categoria={categoria}
                      onView={handleView}
                      onDownload={handleDownload}
                      onToggleImportante={handleToggleImportante}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onRename={handleRename}
                    />
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key='lista'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='space-y-3'
            >
              {documentosFiltrados.map((documento, index) => {
                const categoria = getCategoriaByDocumento(documento)
                return (
                  <DocumentoCardHorizontal
                    key={documento.id}
                    documento={documento as any}
                    categoria={categoria}
                    onView={handleView}
                    onDownload={handleDownload}
                    onToggleImportante={handleToggleImportante}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onRename={handleRename}
                    onAsignarCategoria={handleAsignarCategoria}
                  />
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Modal de renombrar */}
      <DocumentoRenombrarModal
        isOpen={modalRenombrarAbierto}
        tituloActual={documentoRenombrar?.titulo || ''}
        esCedula={documentoRenombrar?.id === 'cedula-ciudadania'}
        onClose={() => {
          setModalRenombrarAbierto(false)
          setDocumentoRenombrar(null)
        }}
        onRenombrar={handleConfirmarRenombrar}
      />

      {/* Modal de categorías */}
      <DocumentoCategoriasModal
        isOpen={modalCategoriasAbierto}
        categoriaActual={documentoParaCategorizar?.categoria_id}
        onClose={() => {
          setModalCategoriasAbierto(false)
          setDocumentoParaCategorizar(null)
        }}
        onSeleccionar={handleConfirmarCategoria}
      />
    </div>
  )
}
