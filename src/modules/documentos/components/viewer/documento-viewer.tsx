'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Download,
    Star,
    Calendar,
    User,
    FileText,
    Tag as TagIcon,
    Clock,
    FolderOpen,
    ExternalLink,
    Trash2,
    Edit
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DocumentoProyecto } from '../../../../types/documento.types'
import { formatFileSize, getFileIcon } from '../../../../types/documento.types'
import { CategoriaIcon } from '../shared/categoria-icon'

interface DocumentoViewerProps {
    documento: DocumentoProyecto | null
    isOpen: boolean
    onClose: () => void
    onDownload?: (documento: DocumentoProyecto) => void
    onDelete?: (documento: DocumentoProyecto) => void
    onEdit?: (documento: DocumentoProyecto) => void
    urlPreview?: string
}

export function DocumentoViewer({
    documento,
    isOpen,
    onClose,
    onDownload,
    onDelete,
    onEdit,
    urlPreview
}: DocumentoViewerProps) {
    if (!documento) return null

    const isPDF = documento.tipo_mime?.includes('pdf')
    const isImage = documento.tipo_mime?.startsWith('image/')
    const canPreview = isPDF || isImage

    const FileIcon = getFileIcon(documento.tipo_mime || '')

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full h-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">

                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                        <FileIcon size={28} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                                            {documento.titulo}
                                            {documento.es_importante && (
                                                <Star size={20} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                            )}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {documento.nombre_original} • {formatFileSize(documento.tamano_bytes)}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                    {onDownload && (
                                        <button
                                            onClick={() => onDownload(documento)}
                                            className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                                            title="Descargar"
                                        >
                                            <Download size={20} />
                                        </button>
                                    )}

                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(documento)}
                                            className="p-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={20} />
                                        </button>
                                    )}

                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(documento)}
                                            className="p-2.5 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}

                                    <button
                                        onClick={onClose}
                                        className="p-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden flex">

                                {/* Preview Area */}
                                <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800 p-6">
                                    {canPreview && urlPreview ? (
                                        <div className="h-full flex items-center justify-center">
                                            {isPDF && (
                                                <iframe
                                                    src={urlPreview}
                                                    className="w-full h-full rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-lg"
                                                    title={documento.titulo}
                                                />
                                            )}
                                            {isImage && (
                                                <img
                                                    src={urlPreview}
                                                    alt={documento.titulo}
                                                    className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="inline-flex p-6 bg-white dark:bg-gray-700 rounded-2xl shadow-lg mb-4">
                                                    <FileIcon size={64} className="text-gray-400" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                    Vista previa no disponible
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                    Este tipo de archivo no se puede previsualizar en el navegador
                                                </p>
                                                {onDownload && (
                                                    <button
                                                        onClick={() => onDownload(documento)}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
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
                                <div className="w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900 p-6 space-y-6">

                                    {/* Descripción */}
                                    {documento.descripcion && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <FileText size={16} />
                                                Descripción
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {documento.descripcion}
                                            </p>
                                        </div>
                                    )}

                                    {/* Categoría */}
                                    {documento.categoria && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <FolderOpen size={16} />
                                                Categoría
                                            </h3>
                                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                                                style={{
                                                    backgroundColor: `${documento.categoria.color}20`,
                                                    color: documento.categoria.color
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

                                    {/* Etiquetas */}
                                    {documento.etiquetas && documento.etiquetas.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <TagIcon size={16} />
                                                Etiquetas
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {documento.etiquetas.map((etiqueta) => (
                                                    <span
                                                        key={etiqueta}
                                                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm"
                                                    >
                                                        {etiqueta}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Fechas */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <Calendar size={16} />
                                            Fechas
                                        </h3>

                                        {documento.fecha_documento && !isNaN(new Date(documento.fecha_documento).getTime()) && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">Fecha del documento</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {format(new Date(documento.fecha_documento), 'PPP', { locale: es })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {documento.fecha_vencimiento && !isNaN(new Date(documento.fecha_vencimiento).getTime()) && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <Calendar size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">Vencimiento</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {format(new Date(documento.fecha_vencimiento), 'PPP', { locale: es })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {documento.fecha_subida && !isNaN(new Date(documento.fecha_subida).getTime()) && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">Subido</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {format(new Date(documento.fecha_subida), 'PPP', { locale: es })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Metadata personalizada */}
                                    {documento.metadata && Object.keys(documento.metadata).length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <FileText size={16} />
                                                Información adicional
                                            </h3>
                                            <div className="space-y-2">
                                                {Object.entries(documento.metadata).map(([key, value]) => (
                                                    <div key={key} className="text-sm">
                                                        <p className="text-gray-600 dark:text-gray-400 capitalize">
                                                            {key.replace(/_/g, ' ')}
                                                        </p>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {String(value)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Información del archivo */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Detalles técnicos
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Tipo</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {documento.extension?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Tamaño</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {formatFileSize(documento.tamano_bytes)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Versión</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
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
        </AnimatePresence>
    )
}
