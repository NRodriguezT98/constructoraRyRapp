'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FileX, LayoutGrid, List } from 'lucide-react'

import { DocumentoCard } from '@/modules/documentos/components/lista/documento-card'
import { DocumentoCardHorizontal } from '@/modules/documentos/components/lista/documento-card-horizontal'

import { useDocumentosListaCliente } from '../hooks'

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
  // ⭐ REFACTORIZADO: Usa hook useDocumentosListaCliente para toda la lógica
  const {
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

    // 🆕 Funciones de actualización
    refrescarDocumentos,

    // Filtros
    busqueda,
    categoriaFiltro,
    soloImportantes,
  } = useDocumentosListaCliente({
    clienteId,
    cedulaUrl,
    numeroDocumento,
    cedulaTituloPersonalizado
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
          onRefresh={refrescarDocumentos} // 🆕 Callback para refrescar
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
                      onRefresh={refrescarDocumentos} // 🆕 Callback para refrescar después de versión
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
                    onRefresh={refrescarDocumentos} // 🆕 Callback para refrescar después de versión
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
