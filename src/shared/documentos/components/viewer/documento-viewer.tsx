'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  CalendarClock,
  CalendarPlus,
  Download,
  Edit,
  FileText,
  HardDrive,
  Layers,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { SectionLoadingSpinner } from '@/shared/components/ui'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

import {
  DocumentoProyecto,
  formatFileSize,
  getFileIcon,
} from '../../types/documento.types'
import {
  formatearValorMetadata,
  humanizarCampoMetadata,
} from '../../utils/documento-viewer.utils'
import { CategoriaIcon } from '../shared/categoria-icon'

interface DocumentoViewerProps {
  documento: DocumentoProyecto | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (documento: DocumentoProyecto) => void | Promise<void>
  onDelete?: (documento: DocumentoProyecto) => void | Promise<void>
  onEdit?: (documento: DocumentoProyecto) => void
  urlPreview?: string
  moduleName?: ModuleName // 🎨 Tema del módulo
}

export function DocumentoViewer({
  documento,
  isOpen,
  onClose,
  onDownload,
  onDelete,
  onEdit,
  urlPreview,
  moduleName = 'proyectos', // 🎨 Default a proyectos
}: DocumentoViewerProps) {
  // 🎨 Obtener tema dinámico
  const theme = moduleThemes[moduleName]
  if (!documento) return null

  const isPDF = documento.tipo_mime?.includes('pdf')
  const isImage = documento.tipo_mime?.startsWith('image/')
  const canPreview = isPDF || isImage

  const FileIcon = getFileIcon(documento.tipo_mime || '')

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[10000]'
          >
            <div className='absolute inset-0 flex flex-col overflow-hidden bg-white shadow-2xl dark:bg-gray-900'>
              {/* Header */}
              <div
                className={`flex items-center justify-between border-b border-gray-200 bg-gradient-to-r ${theme.classes.gradient.background} dark:${theme.classes.gradient.backgroundDark} p-6 dark:border-gray-700`}
              >
                <div className='flex min-w-0 flex-1 items-center gap-4'>
                  <div className='rounded-xl bg-white/90 p-3 shadow-sm backdrop-blur-sm dark:bg-gray-800/90'>
                    <FileIcon
                      size={28}
                      className='text-gray-700 dark:text-gray-300'
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h2 className='flex items-center gap-2 truncate text-2xl font-bold text-white drop-shadow-sm'>
                      {documento.titulo}
                      {documento.es_importante && (
                        <Star
                          size={20}
                          className='flex-shrink-0 fill-yellow-300 text-yellow-300'
                        />
                      )}
                    </h2>
                    <p className='truncate text-sm text-white/90 drop-shadow-sm'>
                      {formatFileSize(documento.tamano_bytes)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className='ml-4 flex flex-shrink-0 items-center gap-2'>
                  {onDownload && (
                    <button
                      onClick={() => onDownload(documento)}
                      className='rounded-xl border border-white/30 bg-white/20 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-white/30'
                      title='Descargar'
                    >
                      <Download size={20} />
                    </button>
                  )}

                  {onEdit && (
                    <button
                      onClick={() => onEdit(documento)}
                      className='rounded-xl border border-white/30 bg-white/20 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-white/30'
                      title='Editar'
                    >
                      <Edit size={20} />
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={() => onDelete(documento)}
                      className='rounded-xl border border-red-400/30 bg-red-500/80 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-red-600/80'
                      title='Eliminar'
                    >
                      <Trash2 size={20} />
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className='rounded-xl border border-white/30 bg-white/20 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-white/30'
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className='flex flex-1 overflow-hidden'>
                {/* Preview Area */}
                <div className='flex-1 overflow-auto bg-gray-50 p-6 dark:bg-gray-800'>
                  {canPreview ? (
                    urlPreview ? (
                      <div className='flex h-full items-center justify-center'>
                        {isPDF && (
                          <iframe
                            src={urlPreview}
                            className='h-full w-full rounded-xl border-2 border-gray-300 shadow-lg dark:border-gray-600'
                            title={documento.titulo}
                          />
                        )}
                        {isImage && (
                          // eslint-disable-next-line @next/next/no-img-element -- Visor de documentos con signed URL de Supabase Storage; next/image no es apto para object-contain con dimensiones desconocidas
                          <img
                            src={urlPreview}
                            alt={documento.titulo}
                            className='max-h-full max-w-full rounded-xl object-contain shadow-lg'
                          />
                        )}
                      </div>
                    ) : (
                      // Estado de carga mientras se genera la signed URL
                      <SectionLoadingSpinner
                        label='Generando URL segura del documento...'
                        moduleName='documentos'
                        icon={FileText}
                        className='flex h-full flex-col items-center justify-center gap-6'
                      />
                    )
                  ) : (
                    <div className='flex h-full items-center justify-center'>
                      <div className='text-center'>
                        <div className='mb-4 inline-flex rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-700'>
                          <FileIcon size={64} className='text-gray-400' />
                        </div>
                        <h3 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
                          Vista previa no disponible
                        </h3>
                        <p className='mb-4 text-gray-600 dark:text-gray-400'>
                          Este tipo de archivo no se puede previsualizar en el
                          navegador
                        </p>
                        {onDownload && (
                          <button
                            onClick={() => onDownload(documento)}
                            className='inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600'
                          >
                            <Download size={20} />
                            Descargar archivo
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar - Metadata */}
                <div className='flex w-80 flex-shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-gray-50/50 dark:border-gray-700/60 dark:bg-gray-900'>
                  {/* ── Descripción ─────────────────────────── */}
                  {documento.descripcion && (
                    <div className='border-b border-gray-200/80 px-5 py-4 dark:border-gray-700/60'>
                      <p className='mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
                        Descripción
                      </p>
                      <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
                        {documento.descripcion}
                      </p>
                    </div>
                  )}

                  {/* ── Categoría ───────────────────────────── */}
                  {documento.categoria && (
                    <div className='border-b border-gray-200/80 px-5 py-4 dark:border-gray-700/60'>
                      <p className='mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
                        Categoría
                      </p>
                      <span
                        className='inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold'
                        style={{
                          backgroundColor: `${documento.categoria.color}18`,
                          color: documento.categoria.color,
                          border: `1px solid ${documento.categoria.color}30`,
                        }}
                      >
                        <CategoriaIcon
                          icono={documento.categoria.icono}
                          size={12}
                        />
                        {documento.categoria.nombre}
                      </span>
                    </div>
                  )}

                  {/* ── Fechas ──────────────────────────────── */}
                  <div className='border-b border-gray-200/80 px-5 py-4 dark:border-gray-700/60'>
                    <p className='mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
                      Fechas
                    </p>
                    <div className='space-y-3'>
                      {/* Fecha de emisión */}
                      <div className='flex items-start gap-3'>
                        <div className='mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20'>
                          <Calendar
                            size={13}
                            className='text-blue-500 dark:text-blue-400'
                          />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='text-xs text-gray-400 dark:text-gray-500'>
                            Emisión del documento
                          </p>
                          <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                            {documento.fecha_documento &&
                            !isNaN(
                              new Date(documento.fecha_documento).getTime()
                            ) ? (
                              formatDateCompact(documento.fecha_documento)
                            ) : (
                              <span className='text-gray-400 dark:text-gray-500'>
                                Sin registrar
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Fecha de expiración */}
                      <div className='flex items-start gap-3'>
                        <div className='mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20'>
                          <CalendarClock
                            size={13}
                            className='text-orange-500 dark:text-orange-400'
                          />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='text-xs text-gray-400 dark:text-gray-500'>
                            Vencimiento
                          </p>
                          <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                            {documento.fecha_vencimiento &&
                            !isNaN(
                              new Date(documento.fecha_vencimiento).getTime()
                            ) ? (
                              formatDateCompact(documento.fecha_vencimiento)
                            ) : (
                              <span className='text-gray-400 dark:text-gray-500'>
                                Sin registrar
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Fecha de carga */}
                      {documento.fecha_creacion &&
                        !isNaN(
                          new Date(documento.fecha_creacion).getTime()
                        ) && (
                          <div className='flex items-start gap-3'>
                            <div className='mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20'>
                              <CalendarPlus
                                size={13}
                                className='text-emerald-500 dark:text-emerald-400'
                              />
                            </div>
                            <div className='min-w-0 flex-1'>
                              <p className='text-xs text-gray-400 dark:text-gray-500'>
                                Subido al sistema
                              </p>
                              <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                                {new Date(
                                  documento.fecha_creacion
                                ).toLocaleString('es-CO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Subido por */}
                      <div className='flex items-start gap-3'>
                        <div className='mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20'>
                          <Upload
                            size={13}
                            className='text-violet-500 dark:text-violet-400'
                          />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='text-xs text-gray-400 dark:text-gray-500'>
                            Subido por
                          </p>
                          <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                            {documento.usuario
                              ? `${documento.usuario.nombres} ${documento.usuario.apellidos}`
                              : 'Desconocido'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Información adicional (metadata) ────── */}
                  {documento.metadata &&
                    Object.keys(documento.metadata).length > 0 &&
                    (() => {
                      const camposOcultos = [
                        'fuente_pago_id',
                        'reemplazo',
                        'version_anterior',
                        'archivo_anterior',
                        'justificacion_reemplazo',
                        'requisito_config_id',
                        'tipo_documento_sistema',
                        'auto_check_identidad',
                        'alcance',
                        'tipo_fuente',
                        'entidad',
                        'entidad_fuente',
                        'nivel_validacion',
                        'fuentes_aplicables',
                      ]
                      const entradas = Object.entries(
                        documento.metadata
                      ).filter(
                        ([key, value]) =>
                          !camposOcultos.includes(key) &&
                          value !== null &&
                          value !== undefined
                      )
                      if (entradas.length === 0) return null
                      return (
                        <div className='border-b border-gray-200/80 px-5 py-4 dark:border-gray-700/60'>
                          <p className='mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
                            Información adicional
                          </p>
                          <div className='space-y-3'>
                            {entradas.map(([key, value]) => (
                              <div key={key} className='flex items-start gap-3'>
                                <div className='mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800'>
                                  <FileText
                                    size={13}
                                    className='text-gray-400 dark:text-gray-500'
                                  />
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <p className='text-xs text-gray-400 dark:text-gray-500'>
                                    {humanizarCampoMetadata(key)}
                                  </p>
                                  <p className='break-words text-sm font-medium text-gray-800 dark:text-gray-200'>
                                    {formatearValorMetadata(
                                      key,
                                      value,
                                      documento.metadata
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}

                  {/* ── Detalles técnicos ────────────────────── */}
                  <div className='px-5 py-4'>
                    <p className='mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
                      Detalles técnicos
                    </p>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800'>
                          <FileText
                            size={13}
                            className='text-gray-400 dark:text-gray-500'
                          />
                        </div>
                        <div className='flex flex-1 items-center justify-between'>
                          <p className='text-xs text-gray-400 dark:text-gray-500'>
                            Tipo
                          </p>
                          <span className='rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
                            {documento.nombre_archivo
                              ?.split('.')
                              .pop()
                              ?.toUpperCase() || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800'>
                          <HardDrive
                            size={13}
                            className='text-gray-400 dark:text-gray-500'
                          />
                        </div>
                        <div className='flex flex-1 items-center justify-between'>
                          <p className='text-xs text-gray-400 dark:text-gray-500'>
                            Tamaño
                          </p>
                          <span className='text-xs font-semibold text-gray-600 dark:text-gray-300'>
                            {formatFileSize(documento.tamano_bytes)}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800'>
                          <Layers
                            size={13}
                            className='text-gray-400 dark:text-gray-500'
                          />
                        </div>
                        <div className='flex flex-1 items-center justify-between'>
                          <p className='text-xs text-gray-400 dark:text-gray-500'>
                            Versión
                          </p>
                          <span className='rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200'>
                            v{documento.version}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
