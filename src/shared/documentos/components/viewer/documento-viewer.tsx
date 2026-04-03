'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Download,
  Edit,
  FileText,
  FolderOpen,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

import {
  DocumentoProyecto,
  formatFileSize,
  getFileIcon,
} from '../../types/documento.types'
import { formatearEntidad } from '../../utils/formatear-entidad'
import { CategoriaIcon } from '../shared/categoria-icon'

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Humanizar nombres de campos del metadata
 */
function humanizarCampoMetadata(key: string): string {
  const mapeo: Record<string, string> = {
    tipo_fuente: 'Tipo de Fuente',
    entidad: 'Entidad Financiera',
    monto_aprobado: 'Monto Aprobado',
    vivienda: 'Vivienda',
    subido_desde: 'Origen',
    numero_resolucion: 'Número de Resolución',
    fecha_resolucion: 'Fecha de Resolución',
    reemplazo: 'Archivo Reemplazado',
    version_anterior: 'Versión Anterior',
    archivo_anterior: 'Archivo Anterior',
    justificacion_reemplazo: 'Justificación',
  }
  return (
    mapeo[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  )
}

/**
 * Formatear valor del metadata
 */
function formatearValorMetadata(
  key: string,
  value: unknown,
  metadata?: Record<string, unknown>
): string {
  // ✅ Caso especial: Entidad vacía - inferir del tipo de fuente
  if (
    key === 'entidad' &&
    (value === null || value === undefined || value === '')
  ) {
    // Inferir entidad según tipo de fuente
    if (metadata?.tipo_fuente === 'Subsidio Mi Casa Ya') {
      return 'Mi Casa Ya'
    }
    if (metadata?.tipo_fuente === 'Subsidio Caja Compensación') {
      return 'Caja Compensación'
    }
    if (metadata?.tipo_fuente === 'Crédito Hipotecario') {
      return 'Entidad Bancaria'
    }
    return 'No especifica'
  }

  // ✅ Formatear entidad financiera con formato de título
  if (key === 'entidad' && value) {
    return formatearEntidad(String(value))
  }

  if (value === null || value === undefined || value === '') {
    return 'No especifica'
  }

  // Si es un objeto, intentar extraer información útil
  if (typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    // Para el campo reemplazo, mostrar info resumida
    if (key === 'reemplazo') {
      const archivo =
        obj.archivo_anterior || obj.nombreArchivo || 'archivo anterior'
      const version = obj.version_anterior || obj.version || '?'
      return `${archivo} (v${version})`
    }

    // Para otros objetos, intentar JSON.stringify
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return '[Objeto complejo]'
    }
  }

  // Formatear monto en pesos colombianos
  if (key === 'monto_aprobado' && typeof value === 'number') {
    return `$${value.toLocaleString('es-CO')}`
  }

  // Formatear origen
  if (key === 'subido_desde') {
    const origenes: Record<string, string> = {
      asignacion_vivienda: 'Asignación de Vivienda',
      negociacion: 'Negociación',
      documentos: 'Módulo de Documentos',
    }
    return origenes[String(value)] || String(value)
  }

  // Formatear fecha
  if (key === 'fecha_resolucion' && value) {
    try {
      const fecha = new Date(String(value))
      return fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return String(value)
    }
  }

  return String(value)
}

// ============================================
// COMPONENT
// ============================================

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
                      <div className='flex h-full items-center justify-center'>
                        <div className='text-center'>
                          <div className='mb-4 inline-flex rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-700'>
                            <div className='h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 dark:border-gray-600 dark:border-t-blue-400' />
                          </div>
                          <h3 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
                            Cargando vista previa...
                          </h3>
                          <p className='text-gray-600 dark:text-gray-400'>
                            Generando URL segura del documento
                          </p>
                        </div>
                      </div>
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
                <div className='w-80 space-y-6 overflow-y-auto border-l border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900'>
                  {/* Descripción */}
                  {documento.descripcion && (
                    <div>
                      <h3 className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        <FileText size={16} />
                        Descripción
                      </h3>
                      <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                        {documento.descripcion}
                      </p>
                    </div>
                  )}

                  {/* Categoría */}
                  {documento.categoria && (
                    <div>
                      <h3 className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        <FolderOpen size={16} />
                        Categoría
                      </h3>
                      <div
                        className='inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium'
                        style={{
                          backgroundColor: `${documento.categoria.color}20`,
                          color: documento.categoria.color,
                        }}
                      >
                        <CategoriaIcon
                          icono={documento.categoria.icono}
                          size={16}
                        />
                        {documento.categoria.nombre}
                      </div>
                    </div>
                  )}

                  {/* Fechas */}
                  <div className='space-y-3'>
                    <h3 className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      <Calendar size={16} />
                      Fechas
                    </h3>

                    {/* 1. Fecha de emisión/expedición del documento */}
                    <div className='flex items-start gap-2 text-sm'>
                      <Calendar
                        size={16}
                        className='mt-0.5 flex-shrink-0 text-blue-500 dark:text-blue-400'
                      />
                      <div className='flex-1'>
                        <p className='text-gray-600 dark:text-gray-400'>
                          Fecha de emisión del documento
                        </p>
                        {documento.fecha_documento &&
                        !isNaN(
                          new Date(documento.fecha_documento).getTime()
                        ) ? (
                          <p className='font-medium text-gray-900 dark:text-white'>
                            {formatDateCompact(documento.fecha_documento)}
                          </p>
                        ) : (
                          <p className='font-medium text-gray-600 dark:text-gray-400'>
                            Sin fecha de emisión
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 2. Fecha de expiración */}
                    <div className='flex items-start gap-2 text-sm'>
                      <Clock
                        size={16}
                        className='mt-0.5 flex-shrink-0 text-orange-500 dark:text-orange-400'
                      />
                      <div className='flex-1'>
                        <p className='text-gray-600 dark:text-gray-400'>
                          Fecha de expiración
                        </p>
                        {documento.fecha_vencimiento &&
                        !isNaN(
                          new Date(documento.fecha_vencimiento).getTime()
                        ) ? (
                          <p className='font-medium text-gray-900 dark:text-white'>
                            {formatDateCompact(documento.fecha_vencimiento)}
                          </p>
                        ) : (
                          <p className='font-medium text-gray-600 dark:text-gray-400'>
                            Este documento no expira
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 3. Fecha de carga al sistema */}
                    {documento.fecha_creacion &&
                      !isNaN(new Date(documento.fecha_creacion).getTime()) && (
                        <div className='flex items-start gap-2 text-sm'>
                          <Calendar
                            size={16}
                            className='mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400'
                          />
                          <div className='flex-1'>
                            <p className='text-gray-600 dark:text-gray-400'>
                              Fecha de carga al sistema
                            </p>
                            <p className='font-medium text-gray-900 dark:text-white'>
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

                    {/* 4. Subido por */}
                    <div className='flex items-start gap-2 text-sm'>
                      <User
                        size={16}
                        className='mt-0.5 flex-shrink-0 text-purple-500 dark:text-purple-400'
                      />
                      <div className='flex-1'>
                        <p className='text-gray-600 dark:text-gray-400'>
                          Subido por
                        </p>
                        <p className='font-medium text-gray-900 dark:text-white'>
                          {documento.usuario
                            ? `${documento.usuario.nombres} ${documento.usuario.apellidos}`
                            : 'Desconocido'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata personalizada */}
                  {documento.metadata &&
                    Object.keys(documento.metadata).length > 0 && (
                      <div>
                        <h3 className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300'>
                          <FileText size={16} />
                          Información adicional
                        </h3>
                        <div className='space-y-2'>
                          {Object.entries(documento.metadata)
                            .filter(([key, value]) => {
                              // Filtrar campos que no queremos mostrar (técnicos/internos)
                              const camposOcultos = [
                                'fuente_pago_id',
                                'reemplazo', // Info técnica de auditoría
                                'version_anterior', // Ya se muestra en "Versión"
                                'archivo_anterior', // Info técnica
                                'justificacion_reemplazo', // Info de auditoría
                              ]
                              if (camposOcultos.includes(key)) return false
                              return value !== null && value !== undefined
                            })
                            .map(([key, value]) => (
                              <div key={key} className='text-sm'>
                                <p className='text-gray-600 dark:text-gray-400'>
                                  {humanizarCampoMetadata(key)}
                                </p>
                                <p className='font-medium text-gray-900 dark:text-white'>
                                  {formatearValorMetadata(
                                    key,
                                    value,
                                    documento.metadata
                                  )}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Información del archivo */}
                  <div className='border-t border-gray-200 pt-4 dark:border-gray-700'>
                    <h3 className='mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      Detalles técnicos
                    </h3>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600 dark:text-gray-400'>
                          Tipo
                        </span>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          {documento.nombre_archivo
                            ?.split('.')
                            .pop()
                            ?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600 dark:text-gray-400'>
                          Tamaño
                        </span>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          {formatFileSize(documento.tamano_bytes)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600 dark:text-gray-400'>
                          Versión
                        </span>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          v{documento.version}
                        </span>
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
