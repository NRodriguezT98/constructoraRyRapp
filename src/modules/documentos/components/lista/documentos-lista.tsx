'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FileX } from 'lucide-react'

import { EmptyState } from '../../../../shared/components/ui/EmptyState'
import { LoadingSpinner } from '../../../../shared/components/ui/Loading'
import { DocumentoProyecto } from '../../../../types/documento.types'
import { useDocumentosLista } from '../../hooks'
import { DocumentoViewer } from '../viewer/documento-viewer'

import { DocumentoCard } from './documento-card'
import { DocumentosFiltros } from './documentos-filtros'

interface DocumentosListaProps {
  proyectoId: string
  onViewDocumento?: (documento: DocumentoProyecto) => void
  onUploadClick?: () => void
}

export function DocumentosLista({
  proyectoId,
  onViewDocumento,
  onUploadClick,
}: DocumentosListaProps) {
  const {
    vista,
    setVista,
    documentoSeleccionado,
    modalViewerAbierto,
    documentosFiltrados,
    categorias,
    cargandoDocumentos,
    hasDocumentos,
    handleView,
    handleCloseViewer,
    handleDownload,
    handleToggleImportante,
    handleArchive,
    handleDelete,
    getCategoriaByDocumento,
  } = useDocumentosLista({ proyectoId, onViewDocumento })

  if (cargandoDocumentos) {
    return (
      <div className='flex items-center justify-center py-20'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Filtros */}
      <DocumentosFiltros
        documentos={documentosFiltrados}
        categorias={categorias}
        onChangeVista={setVista}
      />

      {/* Lista de documentos */}
      {documentosFiltrados.length === 0 ? (
        <EmptyState
          icon={FileX}
          title='No se encontraron documentos'
          description={
            !hasDocumentos
              ? 'Aún no has subido ningún documento a este proyecto'
              : 'No hay documentos que coincidan con los filtros aplicados'
          }
          action={
            !hasDocumentos && onUploadClick
              ? {
                  label: 'Subir primer documento',
                  onClick: onUploadClick,
                }
              : undefined
          }
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
                      documento={documento}
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
              className='space-y-4'
            >
              {documentosFiltrados.map((documento, index) => {
                const categoria = getCategoriaByDocumento(documento)
                return (
                  <motion.div
                    key={documento.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <DocumentoCard
                      documento={documento}
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
          )}
        </AnimatePresence>
      )}

      {/* Modal Viewer */}
      <DocumentoViewer
        documento={documentoSeleccionado}
        isOpen={modalViewerAbierto}
        onClose={handleCloseViewer}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </div>
  )
}
