'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Archive, FileText, FileX } from 'lucide-react'

import { DocumentoCard } from '@/modules/documentos/components/lista/documento-card'
import { DocumentoCardHorizontal } from '@/modules/documentos/components/lista/documento-card-horizontal'
import { DocumentosFiltros } from '@/modules/documentos/components/lista/documentos-filtros'

import { useDocumentosListaCliente } from '../hooks'

import { DocumentoCategoriasModal } from './documento-categorias-modal'
import { DocumentoRenombrarModal } from './documento-renombrar-modal'

interface DocumentosListaClienteProps {
  clienteId: string
}

export function DocumentosListaCliente({
  clienteId
}: DocumentosListaClienteProps) {
  // ⭐ REFACTORIZADO: Usa hook useDocumentosListaCliente para toda la lógica
  const [vistaActual, setVistaActual] = useState<'activos' | 'archivados'>('activos')

  const {
    // Estado
    vista,
    setVista,
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

    // 🆕 Funciones de actualización
    refrescarDocumentos,

    // Filtros
    busqueda,
    categoriaFiltro,
    soloImportantes,
  } = useDocumentosListaCliente({
    clienteId
  })

  if (cargandoDocumentos) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 📑 TABS: Activos / Archivados (consistente con proyectos) */}
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
              layoutId="activeTabCliente"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
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
              layoutId="activeTabCliente"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500"
            />
          )}
        </button>
      </div>

      {/* Filtros compactos con estadísticas (SOLO en vista activos) */}
      {vistaActual === 'activos' && (
        <DocumentosFiltros
          documentos={documentosFiltrados as any}
          categorias={categorias}
          onChangeVista={setVista}
          moduleName="clientes"
        />
      )}

      {/* Contenido según tab activa */}
      {vistaActual === 'archivados' ? (
        <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-800/50'>
          <Archive className='mb-4 h-16 w-16 text-gray-400' />
          <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
            Documentos archivados
          </h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Los documentos archivados aparecerán aquí
          </p>
        </div>
      ) : documentosFiltrados.length === 0 ? (
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
                      tipoEntidad="cliente"
                      onView={handleView}
                      onDownload={handleDownload}
                      onToggleImportante={handleToggleImportante}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onRename={handleRename}
                      onRefresh={refrescarDocumentos}
                      moduleName="clientes"
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
                    tipoEntidad="cliente"
                    onView={handleView}
                    onDownload={handleDownload}
                    onToggleImportante={handleToggleImportante}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onRename={handleRename}
                    onRefresh={refrescarDocumentos}
                    moduleName="clientes"
                    // No permitir categorizar la cédula (ya tiene categoría fija)
                    onAsignarCategoria={documento.id === 'cedula-ciudadania' ? undefined : handleAsignarCategoria}
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
        onClose={closeModalRenombrar}
        onRenombrar={handleConfirmarRenombrar}
      />

      {/* Modal de categorías */}
      <DocumentoCategoriasModal
        isOpen={modalCategoriasAbierto}
        categoriaActual={documentoParaCategorizar?.categoria_id}
        onClose={closeModalCategorias}
        onSeleccionar={handleConfirmarCategoria}
      />
    </div>
  )
}
