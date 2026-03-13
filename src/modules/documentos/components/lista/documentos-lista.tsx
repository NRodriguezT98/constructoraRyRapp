'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Archive, FileText, FileX } from 'lucide-react'

import { type ModuleName } from '@/shared/config/module-themes'
import { EmptyState } from '../../../../shared/components/ui/EmptyState'
import { LoadingSpinner } from '../../../../shared/components/ui/Loading'
import { DocumentoProyecto } from '../../../../types/documento.types'
import { useDocumentosLista } from '../../hooks'
import { useDocumentosStore } from '../../store/documentos.store'
import { type TipoEntidad, obtenerConfiguracionEntidad } from '../../types'
import { ArchivarDocumentoModal, RestaurarDocumentoModal } from '../modals'
import { DocumentoViewer } from '../viewer/documento-viewer'

import { DocumentoCard } from './documento-card'
import { DocumentoCardHorizontal } from './documento-card-horizontal'
import { DocumentosFiltros } from './documentos-filtros'

interface DocumentosListaProps {
  entidadId: string // ✅ GENÉRICO (antes proyectoId)
  tipoEntidad: TipoEntidad // ✅ NUEVO: 'proyecto', 'vivienda', etc.
  onViewDocumento?: (documento: DocumentoProyecto) => void
  onUploadClick?: () => void
  moduleName?: ModuleName // 🎨 Tema del módulo
}

export function DocumentosLista({
  entidadId,
  tipoEntidad,
  onViewDocumento,
  onUploadClick,
  moduleName, // 🎨 Inferir desde tipoEntidad si no se pasa
}: DocumentosListaProps) {
  // 🎨 Auto-inferir moduleName desde tipoEntidad si no se especifica
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const themeModuleName = moduleName || config.moduleName
  const vistaActual = useDocumentosStore((state) => state.vistaActual)
  const setVistaActual = useDocumentosStore((state) => state.setVistaActual)

  const {
    vista,
    setVista,
    documentoSeleccionado,
    modalViewerAbierto,
    urlPreview,
    modalArchivarAbierto,
    setModalArchivarAbierto, // ✅ Extraer setter del hook
    documentoParaArchivar,
    modalRestaurarAbierto,
    setModalRestaurarAbierto,
    documentoParaRestaurar,
    procesandoRestaurar,
    documentosFiltrados, // Ya incluye filtro por estado según vistaActual
    categorias,
    cargandoDocumentos,
    hasDocumentos,
    tipoEntidad: tipoEntidadFromHook, // ✅ Extraer tipoEntidad del hook
    handleView,
    handleCloseViewer,
    handleDownload,
    handleToggleImportante,
    handleArchive,
    confirmarArchivado,
    confirmarRestauracion,
    handleDelete,
    getCategoriaByDocumento,
    refrescar, // 🆕 Para refrescar después de editar/reemplazar
  } = useDocumentosLista({ entidadId, tipoEntidad, onViewDocumento })

  // 🆕 Wrapper para refrescar (compatible con tipo void)
  const handleRefresh = async () => {
    await refrescar()
  }

  // 🆕 Filtrar por estado según tab activa
  const documentosMostrar = documentosFiltrados.filter(doc =>
    vistaActual === 'archivados'
      ? doc.estado === 'archivado'
      : doc.estado === 'activo'
  )

  if (cargandoDocumentos) {
    return (
      <div className='flex items-center justify-center py-20'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 📑 TABS: Activos / Archivados (Papelera ahora es módulo independiente admin-only) */}
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
      {/* 🎯 USAR MISMA CARD para activos y archivados */}
      <>
        {/* Filtros (común para ambas vistas) */}
        <DocumentosFiltros
          documentos={documentosMostrar}
          categorias={categorias}
          onChangeVista={setVista}
          moduleName={themeModuleName}
        />

        {/* Lista de documentos */}
        {documentosMostrar.length === 0 ? (
          <EmptyState
            icon={vistaActual === 'archivados' ? Archive : FileX}
            title={vistaActual === 'archivados' ? 'No hay documentos archivados' : 'No se encontraron documentos'}
            description={
              vistaActual === 'archivados'
                ? 'Los documentos que archives aparecerán aquí'
                : !hasDocumentos
                ? `Aún no has subido ningún documento a este ${config.nombreSingular}`
                : 'No hay documentos que coincidan con los filtros aplicados'
            }
            action={
              !hasDocumentos && onUploadClick && vistaActual === 'activos'
                ? {
                    label: 'Subir primer documento',
                    onClick: onUploadClick,
                  }
                : undefined
            }
            moduleName={themeModuleName}
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
              {documentosMostrar.map((documento, index) => {
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
                      categorias={categorias} // 🆕 Para modal de editar
                      tipoEntidad={tipoEntidadFromHook} // ✅ Pasar tipoEntidad
                      onView={handleView}
                      onDownload={handleDownload}
                      onToggleImportante={handleToggleImportante}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onRefresh={handleRefresh} // 🆕 Pasar callback de refresh
                      moduleName={themeModuleName}
                      esArchivado={vistaActual === 'archivados'} // 🆕 Indicar si está en vista archivados
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
              className='space-y-1.5'
            >
              {documentosMostrar.map((documento, index) => {
                const categoria = getCategoriaByDocumento(documento)
                return (
                  <motion.div
                    key={documento.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <DocumentoCardHorizontal
                      documento={documento}
                      categoria={categoria}
                      categorias={categorias}
                      tipoEntidad={tipoEntidadFromHook}
                      onView={handleView}
                      onDownload={handleDownload}
                      onToggleImportante={handleToggleImportante}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onRefresh={handleRefresh}
                    />
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </>

      {/* Modal Viewer */}
      <DocumentoViewer
        documento={documentoSeleccionado}
        isOpen={modalViewerAbierto}
        onClose={handleCloseViewer}
        onDownload={handleDownload}
        onDelete={handleDelete}
        urlPreview={urlPreview}
        moduleName={themeModuleName}
      />

      {/* Modal Archivar con motivo */}
      <ArchivarDocumentoModal
        isOpen={modalArchivarAbierto}
        onClose={() => setModalArchivarAbierto(false)}
        onConfirm={confirmarArchivado}
        tituloDocumento={documentoParaArchivar?.titulo || ''}
        moduleName={themeModuleName}
      />

      {/* Modal Restaurar con confirmación */}
      <RestaurarDocumentoModal
        isOpen={modalRestaurarAbierto}
        onClose={() => setModalRestaurarAbierto(false)}
        onConfirm={confirmarRestauracion}
        documentoTitulo={documentoParaRestaurar?.titulo || ''}
        moduleName={themeModuleName}
        procesando={procesandoRestaurar}
      />
    </div>
  )
}
