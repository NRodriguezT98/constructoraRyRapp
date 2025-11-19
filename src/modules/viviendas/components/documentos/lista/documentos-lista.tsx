'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Archive, FileText, FileX } from 'lucide-react'

import { useDocumentosStore } from '@/modules/documentos/store/documentos.store'
import { useDocumentosLista } from '@/modules/viviendas/hooks/documentos'
import { DocumentoVivienda } from '@/modules/viviendas/types/documento-vivienda.types'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { LoadingSpinner } from '@/shared/components/ui/Loading'
import { type ModuleName } from '@/shared/config/module-themes'
import { DocumentoViewer } from '../viewer/documento-viewer'

import { DocumentoCard } from './documento-card'
import { DocumentosFiltros } from './documentos-filtros'

interface DocumentosListaProps {
  viviendaId: string
  onViewDocumento?: (documento: DocumentoVivienda) => void
  onUploadClick?: () => void
  moduleName?: ModuleName // ðŸŽ¨ Tema del mÃ³dulo
}

export function DocumentosLista({
  viviendaId,
  onViewDocumento,
  onUploadClick,
  moduleName = 'viviendas', // ðŸŽ¨ Default a proyectos
}: DocumentosListaProps) {
  const vistaActual = useDocumentosStore((state) => state.vistaActual)
  const setVistaActual = useDocumentosStore((state) => state.setVistaActual)

  const {
    vista,
    setVista,
    documentoSeleccionado,
    modalViewerAbierto,
    urlPreview,
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
    refrescar, // 🆕 Para refrescar después de editar/reemplazar
  } = useDocumentosLista({ viviendaId, onViewDocumento })

  // ðŸ†• Wrapper para refrescar (compatible con tipo void)
  const handleRefresh = async () => {
    await refrescar()
  }

  if (cargandoDocumentos) {
    return (
      <div className='flex items-center justify-center py-20'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* ðŸ“‘ TABS: Activos / Archivados */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setVistaActual('activos')}
          className={`relative px-4 py-3 font-medium text-sm transition-all duration-200 ${
            vistaActual === 'activos'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Activos</span>
          </div>
          {vistaActual === 'activos' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500"
            />
          )}
        </button>

        <button
          onClick={() => setVistaActual('archivados')}
          className={`relative px-4 py-3 font-medium text-sm transition-all duration-200 ${
            vistaActual === 'archivados'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            <span>Archivados</span>
          </div>
          {vistaActual === 'archivados' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500"
            />
          )}
        </button>
      </div>

      {/* Contenido según tab activa */}
      {vistaActual === 'archivados' ? (
        <div className="p-8 text-center text-gray-500">
          {/* TODO: Copiar DocumentosArchivadosLista adaptado para viviendas */}
          <p>Funcionalidad de archivados pendiente de implementar</p>
        </div>
      ) : (
        <>
          {/* Filtros (solo en vista activos) */}
          <DocumentosFiltros
            documentos={documentosFiltrados}
            categorias={categorias}
            onChangeVista={setVista}
            moduleName={moduleName}
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
          moduleName={moduleName}
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
                      categorias={categorias} // ðŸ†• Para modal de editar
                      onView={handleView}
                      onDownload={handleDownload}
                      onToggleImportante={handleToggleImportante}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onRefresh={handleRefresh} // ðŸ†• Pasar callback de refresh
                      moduleName={moduleName}
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
                      categorias={categorias} // ðŸ†• Para modal de editar
                      onView={handleView}
                      onDownload={handleDownload}
                      onToggleImportante={handleToggleImportante}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onRefresh={handleRefresh} // ðŸ†• Pasar callback de refresh
                      moduleName={moduleName}
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
        urlPreview={urlPreview}
        moduleName={moduleName}
      />
        </>
      )}
    </div>
  )
}
