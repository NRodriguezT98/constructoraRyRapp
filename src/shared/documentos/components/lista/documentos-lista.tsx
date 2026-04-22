'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Archive,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  FileX,
  FolderCog,
  FolderPlus,
  Pin,
  Upload,
} from 'lucide-react'

import { usePermisosQuery } from '@/modules/usuarios/hooks'
import type { Modulo } from '@/modules/usuarios/types'
import { ConfirmacionModal } from '@/shared/components/modals/ConfirmacionModal'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { SectionLoadingSpinner } from '@/shared/components/ui/SectionLoadingSpinner'
import { type ModuleName } from '@/shared/config/module-themes'
import type { CarpetaConConteo } from '@/shared/documentos/types/carpeta.types'
import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'

import { useDocumentosLista, type SortCol } from '../../hooks'
import { useDocumentosStore } from '../../store/documentos.store'
import { obtenerConfiguracionEntidad, type TipoEntidad } from '../../types'
import {
  CarpetaBreadcrumbs,
  CarpetaCard,
  CarpetaFormModal,
  MoverACarpetaModal,
} from '../carpetas'
import { ArchivarDocumentoModal, RestaurarDocumentoModal } from '../modals'
import { DocumentoViewer } from '../viewer/documento-viewer'

import { DocumentoCardHorizontal } from './documento-card-horizontal'
import { DocumentosFiltros } from './documentos-filtros'

interface DocumentosListaProps {
  entidadId: string // ✅ GENÉRICO (antes proyectoId)
  tipoEntidad: TipoEntidad // ✅ NUEVO: 'proyecto', 'vivienda', etc.
  onViewDocumento?: (documento: DocumentoProyecto) => void
  onUploadClick?: (carpetaId?: string | null) => void
  onCategoriasClick?: () => void // 🗂 Acción de gestionar categorías
  moduleName?: ModuleName // 🎨 Tema del módulo
  defaultVista?: 'grid' | 'lista'
}

export function DocumentosLista({
  entidadId,
  tipoEntidad,
  onViewDocumento,
  onUploadClick,
  onCategoriasClick,
  moduleName, // 🎨 Inferir desde tipoEntidad si no se pasa
  defaultVista = 'lista',
}: DocumentosListaProps) {
  // 🎨 Auto-inferir moduleName desde tipoEntidad si no se especifica
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const themeModuleName = moduleName || config.moduleName

  // 🔒 Permisos: basados en permisos_rol del módulo 'documentos', no del módulo padre
  const { puede, esAdmin } = usePermisosQuery()
  const canUpload = esAdmin || puede('documentos' as Modulo, 'subir')
  const canCreate = canUpload // "Nueva carpeta" también requiere poder subir
  const vistaActual = useDocumentosStore(state => state.vistaActual)
  const setVistaActual = useDocumentosStore(state => state.setVistaActual)

  const {
    vista: _vista,
    setVista: _setVista,
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
    modalEliminarAbierto,
    documentoParaEliminar: _documentoParaEliminar,
    datosModalEliminar,
    procesandoEliminar,
    confirmarEliminar,
    cancelarEliminar,
    documentosMostrar,
    documentosOrdenados,
    sortCol,
    sortDir,
    toggleSort,
    categorias,
    cargandoDocumentos,
    hasDocumentos,
    tipoEntidad: tipoEntidadFromHook, // ✅ Extraer tipoEntidad del hook
    // ✅ Carpetas
    carpetas,
    carpetaActualId,
    breadcrumbs,
    navegarACarpeta,
    handleCrearCarpeta,
    handleRenombrarCarpeta,
    handleEliminarCarpeta,
    handleMoverDocumento,
    crearCarpetaCargando,
    moverDocumentoCargando,
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
  } = useDocumentosLista({
    entidadId,
    tipoEntidad,
    onViewDocumento,
    defaultVista,
  })

  // Estado de modales de carpetas
  const [modalCarpetaAbierto, setModalCarpetaAbierto] = useState(false)
  const [carpetaParaEditar, setCarpetaParaEditar] =
    useState<CarpetaConConteo | null>(null)
  const [modalMoverAbierto, setModalMoverAbierto] = useState(false)
  const [documentoParaMover, setDocumentoParaMover] =
    useState<DocumentoProyecto | null>(null)
  const [carpetaParaEliminar, setCarpetaParaEliminar] =
    useState<CarpetaConConteo | null>(null)

  // renderSortBtn: función UI pura que consume sortCol/sortDir/toggleSort del hook
  const renderSortBtn = (col: SortCol, label: string) => {
    const active = sortCol === col
    return (
      <button
        type='button'
        onClick={() => toggleSort(col)}
        className={`flex items-center gap-0.5 text-[11px] font-medium transition-colors ${
          active
            ? 'text-gray-700 dark:text-gray-200'
            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
        }`}
      >
        {label}
        {active ? (
          sortDir === 'asc' ? (
            <ChevronUp className='h-3 w-3' />
          ) : (
            <ChevronDown className='h-3 w-3' />
          )
        ) : (
          <ArrowUpDown className='h-3 w-3 opacity-40' />
        )}
      </button>
    )
  }

  // 🆕 Wrapper para refrescar (compatible con tipo void)
  const handleRefresh = async () => {
    await refrescar()
  }

  if (cargandoDocumentos) {
    return (
      <SectionLoadingSpinner
        label='Cargando documentos...'
        moduleName={moduleName as ModuleName}
        icon={FileText}
      />
    )
  }

  return (
    <div className='space-y-6'>
      {/* 📑 TABS: Activos / Archivados (Papelera ahora es módulo independiente admin-only) */}
      <div className='flex items-center gap-2 border-b border-gray-200 dark:border-gray-700'>
        <button
          onClick={() => setVistaActual('activos')}
          className={`relative px-4 py-3 text-sm font-medium transition-all duration-200 ${
            vistaActual === 'activos'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <div className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            <span>Activos</span>
          </div>
          {vistaActual === 'activos' && (
            <motion.div
              layoutId='activeTab'
              className='absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500'
            />
          )}
        </button>

        <button
          onClick={() => setVistaActual('archivados')}
          className={`relative px-4 py-3 text-sm font-medium transition-all duration-200 ${
            vistaActual === 'archivados'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <div className='flex items-center gap-2'>
            <Archive className='h-4 w-4' />
            <span>Archivados</span>
          </div>
          {vistaActual === 'archivados' && (
            <motion.div
              layoutId='activeTab'
              className='absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500'
            />
          )}
        </button>
      </div>

      {/* Contenido según tab activa */}
      {/* 🎯 USAR MISMA CARD para activos y archivados */}
      <>
        {/* 📁 Breadcrumbs de navegación de carpetas */}
        {breadcrumbs.length > 1 ? (
          <CarpetaBreadcrumbs
            breadcrumbs={breadcrumbs}
            onNavigate={navegarACarpeta}
            moduleName={themeModuleName}
          />
        ) : null}

        {/* 📁 Carpetas del nivel actual (solo en vista activos) */}
        {vistaActual === 'activos' ? (
          <div className='space-y-2'>
            {/* Encabezado de sección carpetas */}
            <div className='flex items-center justify-between'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Carpetas
              </h3>
              {canCreate ? (
                <button
                  type='button'
                  onClick={() => {
                    setCarpetaParaEditar(null)
                    setModalCarpetaAbierto(true)
                  }}
                  className='flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                >
                  <FolderPlus className='h-3.5 w-3.5' />
                  Nueva carpeta
                </button>
              ) : null}
            </div>

            {/* Grid de carpetas */}
            {carpetas.length > 0 ? (
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'>
                {carpetas.map(carpeta => (
                  <CarpetaCard
                    key={carpeta.id}
                    carpeta={carpeta}
                    moduleName={themeModuleName}
                    onOpen={navegarACarpeta}
                    onRename={c => {
                      setCarpetaParaEditar(c)
                      setModalCarpetaAbierto(true)
                    }}
                    onDelete={c => {
                      setCarpetaParaEliminar(c)
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className='py-1 text-xs text-gray-400 dark:text-gray-600'>
                Sin carpetas — crea una para organizar tus documentos
              </p>
            )}

            {/* Separador entre carpetas y documentos */}
            <div className='border-t border-gray-200 pt-1 dark:border-gray-700' />
          </div>
        ) : null}

        {/* ── Sección Archivos ─────────────────────────────────────── */}
        {(() => {
          const ancladosCount = documentosMostrar.filter(
            d => d.es_importante
          ).length
          const porVencerCount = documentosMostrar.filter(d => {
            if (!d.fecha_vencimiento) return false
            const dias = Math.ceil(
              (new Date(d.fecha_vencimiento).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
            return dias >= 0 && dias <= 30
          }).length
          return (
            <div className='flex items-center justify-between gap-2'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Archivos
              </h3>

              <div className='flex items-center gap-2'>
                {/* Contadores */}
                {documentosMostrar.length > 0 ? (
                  <div className='flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500'>
                    <span>
                      {documentosMostrar.length}{' '}
                      {documentosMostrar.length === 1 ? 'doc' : 'docs'}
                    </span>
                    {ancladosCount > 0 ? (
                      <span className='flex items-center gap-1'>
                        <Pin className='h-3 w-3 fill-cyan-500 text-cyan-500' />
                        {ancladosCount}{' '}
                        {ancladosCount === 1 ? 'anclado' : 'anclados'}
                      </span>
                    ) : null}
                    {porVencerCount > 0 ? (
                      <span className='flex items-center gap-1 text-orange-400 dark:text-orange-500'>
                        <Calendar className='h-3 w-3' />
                        {porVencerCount} por vencer
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {/* Separador visual solo si hay contadores Y botones visibles */}
                {documentosMostrar.length > 0 &&
                canCreate &&
                (onCategoriasClick ?? onUploadClick) ? (
                  <span className='h-3 w-px bg-gray-300 dark:bg-gray-600' />
                ) : null}

                {/* Botón Categorías — solo con permiso crear */}
                {onCategoriasClick && canCreate ? (
                  <button
                    type='button'
                    onClick={onCategoriasClick}
                    className='group flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                  >
                    <FolderCog className='h-3.5 w-3.5 transition-transform group-hover:rotate-12' />
                    Categorías
                  </button>
                ) : null}

                {/* Botón Subir Documento — solo con permiso crear */}
                {onUploadClick && canCreate ? (
                  <button
                    type='button'
                    onClick={() => onUploadClick(carpetaActualId)}
                    className='flex items-center gap-1.5 rounded-md bg-cyan-600 px-2.5 py-1 text-xs font-medium text-white transition-all duration-200 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600'
                  >
                    <Upload className='h-3.5 w-3.5' />
                    Subir Documento
                  </button>
                ) : null}
              </div>
            </div>
          )
        })()}

        {/* Filtros (común para ambas vistas) */}
        <DocumentosFiltros
          documentos={documentosMostrar}
          categorias={categorias}
          moduleName={themeModuleName}
        />

        {/* Lista de documentos */}
        {documentosMostrar.length === 0 ? (
          // Con carpetas encima: EmptyState compacto con acción de subir a esta carpeta
          carpetas.length > 0 && vistaActual === 'activos' ? (
            <EmptyState
              icon={FileX}
              title='Sin archivos en esta ubicación'
              description='Puedes subir archivos directamente aquí o navegar a una carpeta'
              action={
                onUploadClick && canCreate
                  ? {
                      label: 'Subir archivo aquí',
                      onClick: () => onUploadClick?.(carpetaActualId),
                    }
                  : undefined
              }
              moduleName={themeModuleName}
              className='py-8'
            />
          ) : (
            <EmptyState
              icon={vistaActual === 'archivados' ? Archive : FileX}
              title={
                vistaActual === 'archivados'
                  ? 'No hay documentos archivados'
                  : 'No se encontraron documentos'
              }
              description={
                vistaActual === 'archivados'
                  ? 'Los documentos que archives aparecerán aquí'
                  : !hasDocumentos
                    ? `Aún no has subido ningún documento a este ${config.nombreSingular}`
                    : 'No hay documentos que coincidan con los filtros aplicados'
              }
              action={
                !hasDocumentos &&
                onUploadClick &&
                canCreate &&
                vistaActual === 'activos'
                  ? {
                      label: 'Subir primer documento',
                      onClick: () => onUploadClick?.(carpetaActualId),
                    }
                  : undefined
              }
              moduleName={themeModuleName}
            />
          )
        ) : (
          <div className='overflow-hidden rounded-xl border border-gray-200/70 dark:border-gray-700/60'>
            {/* Cabecera de tabla con sort por columna */}
            <div className='flex items-center gap-3 border-b border-gray-200/80 bg-gray-50/80 px-4 py-1.5 dark:border-gray-700/60 dark:bg-gray-800/40'>
              <div className='flex min-w-0 flex-1 items-center'>
                {renderSortBtn('titulo', 'Nombre')}
              </div>
              <div className='hidden w-40 flex-shrink-0 md:block'>
                <span className='text-[11px] font-medium text-gray-400 dark:text-gray-500'>
                  Categoría
                </span>
              </div>
              <div className='hidden w-[160px] flex-shrink-0 lg:block'>
                <span className='text-[11px] font-medium text-gray-400 dark:text-gray-500'>
                  Subido por
                </span>
              </div>
              <div className='hidden w-[96px] flex-shrink-0 lg:block'>
                {renderSortBtn('fecha_creacion', 'Fecha subida')}
              </div>
              <div className='hidden w-[72px] flex-shrink-0 text-right lg:block'>
                {renderSortBtn('tamano_bytes', 'Tamaño')}
              </div>
              <div className='w-[68px] flex-shrink-0' />
            </div>
            {/* Filas */}
            <AnimatePresence mode='popLayout'>
              <motion.div
                key='lista'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='divide-y divide-gray-100/80 dark:divide-gray-800/60'
              >
                {documentosOrdenados.map((documento, index) => {
                  const categoria = getCategoriaByDocumento(documento)
                  return (
                    <motion.div
                      key={documento.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.02 }}
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
                        moduleName={themeModuleName}
                        esArchivado={vistaActual === 'archivados'}
                        onMoverACarpeta={doc => {
                          setDocumentoParaMover(doc)
                          setModalMoverAbierto(true)
                        }}
                      />
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
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

      {/* Modal Eliminar con confirmación */}
      <ConfirmacionModal
        isOpen={modalEliminarAbierto}
        onClose={cancelarEliminar}
        onConfirm={confirmarEliminar}
        variant='danger'
        title={datosModalEliminar.title}
        message={datosModalEliminar.message}
        confirmText={datosModalEliminar.confirmText}
        cancelText='Cancelar'
        isLoading={procesandoEliminar}
        loadingText='Eliminando...'
      />

      {/* 📁 Confirmación eliminar carpeta */}
      <ConfirmacionModal
        isOpen={carpetaParaEliminar !== null}
        onClose={() => setCarpetaParaEliminar(null)}
        onConfirm={async () => {
          if (carpetaParaEliminar) {
            await handleEliminarCarpeta(carpetaParaEliminar.id)
          }
          setCarpetaParaEliminar(null)
        }}
        variant='danger'
        title='Eliminar carpeta'
        message={`¿Eliminar la carpeta "${carpetaParaEliminar?.nombre ?? ''}"? Los documentos dentro volverán a la raíz.`}
        confirmText='Eliminar'
        cancelText='Cancelar'
      />

      {/* 📁 Modal Crear/Renombrar Carpeta */}
      <CarpetaFormModal
        isOpen={modalCarpetaAbierto}
        onClose={() => {
          setModalCarpetaAbierto(false)
          setCarpetaParaEditar(null)
        }}
        onSubmit={async (nombre, descripcion) => {
          if (carpetaParaEditar) {
            await handleRenombrarCarpeta(carpetaParaEditar.id, nombre)
          } else {
            await handleCrearCarpeta(nombre, descripcion)
          }
          setModalCarpetaAbierto(false)
          setCarpetaParaEditar(null)
        }}
        carpeta={carpetaParaEditar}
        moduleName={themeModuleName}
        cargando={crearCarpetaCargando}
      />

      {/* 📁 Modal Mover a Carpeta */}
      <MoverACarpetaModal
        isOpen={modalMoverAbierto}
        onClose={() => {
          setModalMoverAbierto(false)
          setDocumentoParaMover(null)
        }}
        onMover={async carpetaDestinoId => {
          if (documentoParaMover) {
            await handleMoverDocumento(documentoParaMover.id, carpetaDestinoId)
          }
          setModalMoverAbierto(false)
          setDocumentoParaMover(null)
        }}
        entidadId={entidadId}
        tipoEntidad={tipoEntidad}
        moduleName={themeModuleName}
        carpetaActualId={
          documentoParaMover
            ? (((documentoParaMover as unknown as Record<string, unknown>)
                .carpeta_id as string | null) ?? null)
            : null
        }
        cargando={moverDocumentoCargando}
      />
    </div>
  )
}
