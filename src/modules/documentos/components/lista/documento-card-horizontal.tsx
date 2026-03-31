'use client'

import { useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  Archive,
  Crown,
  Download,
  Edit,
  Edit3,
  FileText,
  FileUp,
  FolderPlus,
  History,
  Lock,
  MoreVertical,
  Pin,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { supabase } from '@/lib/supabase/client'
import { formatDateCompact } from '@/lib/utils/date.utils'
import { ConfirmacionModal } from '@/shared/components/modals'
import { type ModuleName } from '@/shared/config/module-themes'

import { useDocumentoCard } from '../../hooks'
import {
  CategoriaDocumento,
  DocumentoProyecto,
  formatFileSize,
  getFileExtension,
} from '../../types/documento.types'
import type { TipoEntidad } from '../../types/entidad.types'
import { BadgeEstadoProceso } from '../badge-estado-proceso'
import {
  DocumentoEditarMetadatosModal,
  DocumentoNuevaVersionModal,
  DocumentoReemplazarArchivoModal,
  DocumentoVersionesModal,
} from '../modals'

interface DocumentoCardHorizontalProps {
  documento: DocumentoProyecto
  categoria?: { nombre: string; color: string; icono: string }
  categorias?: CategoriaDocumento[]
  onView: (documento: DocumentoProyecto) => void
  onDownload: (documento: DocumentoProyecto) => void
  onToggleImportante: (documento: DocumentoProyecto) => void
  onArchive: (documento: DocumentoProyecto) => void
  onDelete: (documento: DocumentoProyecto) => void
  onRename?: (documento: DocumentoProyecto) => void
  onAsignarCategoria?: (documento: DocumentoProyecto) => void
  onRefresh?: () => void | Promise<void>
  tipoEntidad?: TipoEntidad
  moduleName?: ModuleName
  esArchivado?: boolean
}

export function DocumentoCardHorizontal({
  documento,
  categoria,
  categorias = [],
  onView,
  onDownload,
  onToggleImportante,
  onArchive,
  onDelete: _onDelete,
  onRename,
  onAsignarCategoria,
  onRefresh,
  tipoEntidad = 'proyecto',
  moduleName = 'clientes',
  esArchivado = false,
}: DocumentoCardHorizontalProps) {
  const {
    esAdmin,
    menuAbierto,
    menuRef,
    toggleMenu,
    cerrarMenu,
    estaProtegido,
    puedeEliminar,
    procesoInfo: _procesoInfo,
    estadoProceso,
    verificando: _verificando,
    esDocumentoDeProceso,
    modalEditarAbierto,
    abrirModalEditar,
    cerrarModalEditar,
    modalReemplazarAbierto,
    abrirModalReemplazar,
    cerrarModalReemplazar,
    modalVersionesAbierto,
    abrirModalVersiones,
    cerrarModalVersiones,
    modalNuevaVersionAbierto,
    abrirModalNuevaVersion,
    cerrarModalNuevaVersion,
    confirmacionEliminar,
    abrirConfirmacionEliminar,
    cerrarConfirmacionEliminar,
    ejecutarEliminacion,
    eliminando,
  } = useDocumentoCard({ documento, esDocumentoProyecto: true })

  const tieneVersiones = documento.version > 1

  // Thumbnail para imágenes
  const esImagen = documento.tipo_mime?.startsWith('image/')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!esImagen || !documento.url_storage) return
    const config = {
      proyecto: 'documentos-proyectos',
      vivienda: 'documentos-viviendas',
      cliente: 'documentos-clientes',
    } as const
    const bucket = config[tipoEntidad] || 'documentos-proyectos'
    supabase.storage
      .from(bucket)
      .createSignedUrl(documento.url_storage, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) setThumbnailUrl(data.signedUrl)
      })
  }, [esImagen, documento.url_storage, tipoEntidad])

  const estaProximoAVencer = documento.fecha_vencimiento
    ? new Date(documento.fecha_vencimiento) <=
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false

  const estaVencido = documento.fecha_vencimiento
    ? new Date(documento.fecha_vencimiento) < new Date()
    : false

  // Portal positioning para el menú
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{
    top?: number
    bottom?: number
    right: number
    maxHeight: number
  } | null>(null)

  const handleAbrirMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!menuAbierto && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const rightOffset = window.innerWidth - rect.right
      const MARGIN = 8
      if (spaceBelow < 150) {
        setMenuPos({
          bottom: window.innerHeight - rect.top + MARGIN,
          right: rightOffset,
          maxHeight: rect.top - MARGIN,
        })
      } else {
        setMenuPos({
          top: rect.bottom + MARGIN,
          right: rightOffset,
          maxHeight: spaceBelow - MARGIN,
        })
      }
    }
    toggleMenu()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      onClick={() => onView(documento)}
      className='group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl border border-gray-200/80 bg-white py-3 pl-5 pr-4 shadow-sm transition-all duration-150 hover:border-gray-300 hover:shadow-md dark:border-gray-700/80 dark:bg-gray-800 dark:hover:border-gray-600'
    >
      {/* Barra de color lateral + hover tint */}
      {categoria ? (
        <>
          {/* barra sólida 4px */}
          <div
            className='absolute left-0 top-0 h-full w-1 transition-all duration-150 group-hover:w-[5px]'
            style={{ backgroundColor: categoria.color }}
          />
          {/* tinte de fondo al hover con el color de la categoría */}
          <div
            className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100'
            style={{
              background: `linear-gradient(to right, ${categoria.color}18, transparent 40%)`,
            }}
          />
        </>
      ) : (
        <div
          className='absolute left-0 top-0 h-full w-1'
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, #94a3b8 0, #94a3b8 4px, transparent 4px, transparent 9px)',
          }}
        />
      )}

      {/* ICONO / THUMBNAIL — preview para imágenes, icono para el resto */}
      <div className='relative flex-shrink-0'>
        {esImagen && thumbnailUrl ? (
          <div className='h-10 w-10 overflow-hidden rounded-lg shadow-sm'>
            <img
              src={thumbnailUrl}
              alt={documento.titulo}
              loading='lazy'
              className='h-full w-full object-cover'
            />
          </div>
        ) : categoria ? (
          <div
            className='flex h-10 w-10 items-center justify-center rounded-lg'
            style={{
              background: `linear-gradient(135deg, ${categoria.color}25, ${categoria.color}45)`,
            }}
          >
            <span style={{ color: categoria.color }}>
              <FileText size={20} />
            </span>
          </div>
        ) : (
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700'>
            <FileText size={20} className='text-gray-400' />
          </div>
        )}
        {/* Extensión superpuesta en la esquina */}
        <span
          className='absolute -bottom-1 -right-1 rounded px-1 py-px font-mono text-[9px] font-bold uppercase leading-none tracking-wide text-white shadow-sm'
          style={{ backgroundColor: categoria?.color ?? '#94a3b8' }}
        >
          {getFileExtension(documento.nombre_archivo)}
        </span>
        {documento.es_importante && (
          <div className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 shadow'>
            <Pin size={8} className='fill-white text-white' />
          </div>
        )}
      </div>

      {/* NOMBRE + METADATA — columna principal, crece */}
      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='flex items-center gap-2'>
          <span
            className='text-sm font-semibold text-gray-900 dark:text-white'
            title={documento.descripcion || undefined}
          >
            {documento.titulo}
          </span>
          {documento.es_importante && (
            <span className='flex flex-shrink-0 items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300'>
              <Pin size={9} className='fill-cyan-600 dark:fill-cyan-400' />
              Anclado
            </span>
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(documento as any).es_documento_identidad && (
            <span className='flex flex-shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm'>
              <Lock size={9} />
              Documento de Identidad
            </span>
          )}
          {estaProtegido && (
            <span title='Documento protegido' className='flex-shrink-0'>
              <Lock
                size={13}
                className='text-emerald-500 dark:text-emerald-400'
              />
            </span>
          )}
          {documento.version > 1 && (
            <span className='flex-shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'>
              v{documento.version}
            </span>
          )}
          {estaVencido && (
            <span className='flex flex-shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300'>
              <AlertCircle size={9} />
              Vencido
            </span>
          )}
          {!estaVencido && estaProximoAVencer && (
            <span className='flex flex-shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'>
              <AlertCircle size={9} />
              Por vencer
            </span>
          )}
        </div>
        <div className='mt-1 flex flex-col gap-0.5'>
          {/* Fila 1: Categoría */}
          <div className='flex items-center gap-1 text-xs'>
            <span className='flex-shrink-0 text-gray-400 dark:text-gray-500'>
              Categoría del documento:
            </span>
            {categoria ? (
              <span
                className='truncate font-medium'
                style={{ color: categoria.color }}
              >
                {categoria.nombre}
              </span>
            ) : (
              <span className='italic text-gray-400 dark:text-gray-500'>
                Sin categoría
              </span>
            )}
          </div>
          {/* Fila 2: Subido por */}
          <div className='flex items-center gap-1 text-xs'>
            <span className='flex-shrink-0 text-gray-400 dark:text-gray-500'>
              Subido por:
            </span>
            <span className='truncate font-medium text-gray-600 dark:text-gray-300'>
              {documento.usuario
                ? `${documento.usuario.nombres} ${documento.usuario.apellidos}`
                : 'Desconocido'}
            </span>
          </div>
        </div>
        {estadoProceso.esDeProceso && estadoProceso.estadoPaso && (
          <div className='mt-1'>
            <BadgeEstadoProceso estadoPaso={estadoProceso.estadoPaso} />
          </div>
        )}
      </div>

      {/* FECHA — columna fija (incluye tamaño) */}
      <div className='hidden w-32 flex-shrink-0 flex-col items-end lg:flex'>
        <span className='text-[10px] text-gray-400 dark:text-gray-500'>
          Fecha doc.
        </span>
        <span className='mt-0.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
          {documento.fecha_documento
            ? formatDateCompact(documento.fecha_documento)
            : '—'}
        </span>
        <span className='mt-1.5 text-[10px] text-gray-400 dark:text-gray-500'>
          Subida
        </span>
        <span className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
          {formatDateCompact(documento.fecha_creacion)}
        </span>
        <span className='mt-1.5 text-[10px] text-gray-400 dark:text-gray-500'>
          Tamaño
        </span>
        <span className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
          {formatFileSize(documento.tamano_bytes)}
        </span>
        {documento.fecha_vencimiento && (
          <>
            <span className='mt-1.5 text-[10px] text-gray-400 dark:text-gray-500'>
              Vencimiento
            </span>
            <span
              className={`mt-0.5 text-[11px] font-medium ${estaVencido ? 'text-red-500' : estaProximoAVencer ? 'text-orange-500' : 'text-gray-400'}`}
            >
              {formatDateCompact(documento.fecha_vencimiento)}
            </span>
          </>
        )}
      </div>

      {/* ACCIONES — aparecen en hover, siempre accesibles con teclado */}
      <div
        className='flex flex-shrink-0 items-center gap-1'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center gap-1 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100'>
          <button
            onClick={() => onDownload(documento)}
            className='flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            title='Descargar'
            aria-label='Descargar documento'
          >
            <Download size={16} />
          </button>

          {onAsignarCategoria && (
            <button
              onClick={() => onAsignarCategoria(documento)}
              className='flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
              title={categoria ? `Cambiar categoría` : 'Asignar categoría'}
              aria-label='Asignar categoría'
            >
              <FolderPlus size={16} />
            </button>
          )}

          {/* Menú de opciones con portal */}
          <button
            ref={triggerRef}
            type='button'
            onClick={handleAbrirMenu}
            className='flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            title='Más opciones'
            aria-label='Más opciones'
          >
            <MoreVertical size={16} />
          </button>

          {menuAbierto &&
            menuPos &&
            createPortal(
              <div
                ref={menuRef}
                style={{
                  position: 'fixed',
                  top: menuPos.top,
                  bottom: menuPos.bottom,
                  right: menuPos.right,
                  maxHeight: menuPos.maxHeight,
                  overflowY: 'auto',
                  zIndex: 9999,
                }}
                className='min-w-[200px] rounded-xl border border-gray-200 bg-white py-1 shadow-2xl dark:border-gray-700 dark:bg-gray-800'
              >
                <button
                  type='button'
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    onToggleImportante(documento)
                    cerrarMenu()
                  }}
                  className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  <Pin
                    size={15}
                    className={
                      documento.es_importante
                        ? 'fill-cyan-500 text-cyan-500'
                        : ''
                    }
                  />
                  {documento.es_importante
                    ? 'Quitar anclado'
                    : 'Anclar documento'}
                </button>

                {onRename && (
                  <button
                    type='button'
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      onRename(documento)
                      cerrarMenu()
                    }}
                    className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  >
                    <Edit3 size={15} />
                    Renombrar
                  </button>
                )}

                <div className='my-1 border-t border-gray-100 dark:border-gray-700' />

                <button
                  type='button'
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    abrirModalEditar()
                  }}
                  className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  <Edit size={15} />
                  Editar Documento
                </button>

                {tieneVersiones && (
                  <>
                    <div className='my-1 border-t border-gray-100 dark:border-gray-700' />
                    <button
                      type='button'
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        abrirModalVersiones()
                      }}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    >
                      <History size={15} />
                      Ver Historial (v{documento.version})
                    </button>
                  </>
                )}

                {esDocumentoDeProceso && (
                  <>
                    <div className='my-1 border-t border-gray-100 dark:border-gray-700' />
                    <button
                      type='button'
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        abrirModalNuevaVersion()
                      }}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    >
                      <FileUp size={15} />
                      Nueva Versión
                    </button>
                  </>
                )}

                {esAdmin && (
                  <>
                    <div className='my-1 border-t border-gray-100 dark:border-gray-700' />
                    <button
                      type='button'
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        abrirModalReemplazar()
                      }}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-600 transition-colors hover:bg-gray-100 dark:text-amber-400 dark:hover:bg-gray-700'
                    >
                      <RefreshCw size={15} />
                      <span>Reemplazar Archivo</span>
                      <Crown
                        size={12}
                        className='ml-auto text-amber-500 dark:text-amber-400'
                      />
                    </button>
                  </>
                )}

                <div className='my-1 border-t border-gray-100 dark:border-gray-700' />

                <button
                  type='button'
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    onArchive(documento)
                    cerrarMenu()
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    esArchivado
                      ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {esArchivado ? (
                    <RefreshCw size={15} />
                  ) : (
                    <Archive size={15} />
                  )}
                  {esArchivado ? 'Restaurar' : 'Archivar'}
                </button>

                {!estaProtegido && puedeEliminar && (
                  <>
                    <div className='my-1 border-t border-gray-100 dark:border-gray-700' />
                    <button
                      type='button'
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        cerrarMenu()
                        abrirConfirmacionEliminar(documento, tipoEntidad)
                      }}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                    >
                      <Trash2 size={15} />
                      Eliminar
                    </button>
                  </>
                )}

                {estaProtegido && (
                  <div className='px-3 py-2.5'>
                    <div className='flex items-start gap-2'>
                      <Lock
                        size={13}
                        className='mt-0.5 flex-shrink-0 text-emerald-600'
                      />
                      <div>
                        <p className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                          Documento protegido
                        </p>
                        <p className='mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
                          Pertenece a un proceso completado.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>,
              document.body
            )}
        </div>
        {/* fin hover-actions */}
      </div>
      {/* fin acciones */}

      {/* Modales */}
      <DocumentoVersionesModal
        isOpen={modalVersionesAbierto}
        documentoId={documento.id}
        onClose={cerrarModalVersiones}
        onVersionRestaurada={async () => {
          cerrarModalVersiones()
          await onRefresh?.()
        }}
      />

      <DocumentoNuevaVersionModal
        isOpen={modalNuevaVersionAbierto}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        documento={documento as any}
        tipoEntidad={tipoEntidad}
        onClose={cerrarModalNuevaVersion}
        onSuccess={async () => {
          cerrarModalNuevaVersion()
          await onRefresh?.()
        }}
      />

      <DocumentoEditarMetadatosModal
        isOpen={modalEditarAbierto}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        documento={documento as any}
        categorias={categorias}
        tipoEntidad={tipoEntidad}
        onClose={cerrarModalEditar}
        onEditado={async () => {
          cerrarModalEditar()
          await onRefresh?.()
        }}
      />

      <DocumentoReemplazarArchivoModal
        isOpen={modalReemplazarAbierto}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        documento={documento as any}
        tipoEntidad={tipoEntidad}
        moduleName={moduleName}
        onClose={cerrarModalReemplazar}
        onReemplazado={async () => {
          cerrarModalReemplazar()
          await onRefresh?.()
        }}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmacionModal
        isOpen={confirmacionEliminar.isOpen}
        onClose={cerrarConfirmacionEliminar}
        onConfirm={async () => {
          await ejecutarEliminacion(tipoEntidad, async () => {
            await onRefresh?.()
          })
        }}
        variant={confirmacionEliminar.esDocumentoCritico ? 'warning' : 'danger'}
        title={
          confirmacionEliminar.esDocumentoCritico
            ? '¿Eliminar documento crítico?'
            : '¿Eliminar documento?'
        }
        message={
          confirmacionEliminar.detectando
            ? 'Verificando el tipo de documento…'
            : confirmacionEliminar.esDocumentoCritico
              ? `Este documento es un requisito obligatorio para el desembolso${
                  confirmacionEliminar.entidadAfectada
                    ? ` (${confirmacionEliminar.entidadAfectada})`
                    : ''
                }. Al eliminarlo quedará registrado como pendiente nuevamente.\n\nSe moverán a la papelera ${
                  confirmacionEliminar.totalVersiones > 1
                    ? `las ${confirmacionEliminar.totalVersiones} versiones`
                    : 'el documento'
                }. Puede recuperarlos desde administración.`
              : `Esta acción moverá el documento${
                  confirmacionEliminar.totalVersiones > 1
                    ? ` y sus ${confirmacionEliminar.totalVersiones} versiones`
                    : ''
                } a la papelera. Puede recuperarlo desde el panel de administración.`
        }
        confirmText={
          confirmacionEliminar.esDocumentoCritico
            ? 'Entiendo, eliminar de todas formas'
            : 'Sí, eliminar'
        }
        isLoading={confirmacionEliminar.detectando || eliminando}
        loadingText={
          confirmacionEliminar.detectando ? 'Verificando…' : 'Eliminando…'
        }
      />
    </motion.div>
  )
}
