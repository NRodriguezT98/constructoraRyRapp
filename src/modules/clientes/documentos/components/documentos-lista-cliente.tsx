'use client'

import { DocumentoCard } from '@/modules/documentos/components/lista/documento-card'
import { DocumentoCardHorizontal } from '@/modules/documentos/components/lista/documento-card-horizontal'
import { DocumentosFiltros } from '@/modules/documentos/components/lista/documentos-filtros'
import { AnimatePresence, motion } from 'framer-motion'
import { FileX } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DocumentosClienteService } from '../services/documentos-cliente.service'
import { useDocumentosClienteStore } from '../store/documentos-cliente.store'

interface DocumentosListaClienteProps {
  clienteId: string
}

export function DocumentosListaCliente({ clienteId }: DocumentosListaClienteProps) {
  const { documentos, categorias, cargandoDocumentos, cargarDocumentos } =
    useDocumentosClienteStore()
  const [vista, setVista] = useState<'grid' | 'lista'>('lista')

  // Handlers
  const handleView = async (documento: any) => {
    try {
      const url = await DocumentosClienteService.obtenerUrlDescarga(documento.url_storage)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error al abrir documento:', error)
      toast.error('Error al abrir el documento')
    }
  }

  const handleDownload = async (documento: any) => {
    try {
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

  if (cargandoDocumentos) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Filtros */}
      <DocumentosFiltros onChangeVista={setVista} />

      {/* Lista de documentos */}
      {documentos.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-800/50'>
          <FileX className='mb-4 h-16 w-16 text-gray-400' />
          <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
            No hay documentos
          </h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Sube documentos para comenzar
          </p>
        </div>
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
              {documentos.map((documento, index) => {
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
              {documentos.map((documento, index) => {
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
                  />
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
