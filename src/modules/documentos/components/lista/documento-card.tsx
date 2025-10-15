'use client'

import { motion } from 'framer-motion'
import {
    FileText,
    Calendar,
    Tag,
    Star,
    Download,
    Eye,
    MoreVertical,
    AlertCircle,
    Archive,
    Trash2
} from 'lucide-react'
import { DocumentoProyecto } from '../../../../types/documento.types'
import { formatFileSize, getFileExtension } from '../../../../types/documento.types'
import { CategoriaIcon } from '../shared/categoria-icon'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useRef, useEffect } from 'react'

interface DocumentoCardProps {
    documento: DocumentoProyecto
    categoria?: { nombre: string; color: string; icono: string }
    onView: (documento: DocumentoProyecto) => void
    onDownload: (documento: DocumentoProyecto) => void
    onToggleImportante: (documento: DocumentoProyecto) => void
    onArchive: (documento: DocumentoProyecto) => void
    onDelete: (documento: DocumentoProyecto) => void
}

export function DocumentoCard({
    documento,
    categoria,
    onView,
    onDownload,
    onToggleImportante,
    onArchive,
    onDelete
}: DocumentoCardProps) {
    const [menuAbierto, setMenuAbierto] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const estaProximoAVencer = documento.fecha_vencimiento
        ? new Date(documento.fecha_vencimiento) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : false

    const estaVencido = documento.fecha_vencimiento
        ? new Date(documento.fecha_vencimiento) < new Date()
        : false

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuAbierto(false)
            }
        }

        if (menuAbierto) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [menuAbierto])

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
            {/* Badge de importante */}
            {documento.es_importante && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                        <Star size={12} className="fill-white" />
                        Importante
                    </div>
                </div>
            )}

            {/* Badge de vencimiento */}
            {estaVencido && (
                <div className="absolute top-4 left-4 z-10">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                        <AlertCircle size={12} />
                        Vencido
                    </div>
                </div>
            )}
            {!estaVencido && estaProximoAVencer && (
                <div className="absolute top-4 left-4 z-10">
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                        <AlertCircle size={12} />
                        Por vencer
                    </div>
                </div>
            )}

            <div className="p-6">
                {/* Header con icono y menú */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {categoria ? (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                <CategoriaIcon
                                    icono={categoria.icono}
                                    color={categoria.color}
                                    size={24}
                                />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <FileText size={24} className="text-gray-400" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {categoria && (
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {categoria.nombre}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Menú de acciones */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuAbierto(!menuAbierto)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <MoreVertical size={18} className="text-gray-500" />
                        </button>

                        {menuAbierto && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20"
                            >
                                <button
                                    onClick={() => {
                                        onToggleImportante(documento)
                                        setMenuAbierto(false)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <Star size={16} className={documento.es_importante ? 'fill-yellow-500 text-yellow-500' : ''} />
                                    {documento.es_importante ? 'Quitar importante' : 'Marcar importante'}
                                </button>

                                <button
                                    onClick={() => {
                                        onArchive(documento)
                                        setMenuAbierto(false)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <Archive size={16} />
                                    Archivar
                                </button>

                                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                                <button
                                    onClick={() => {
                                        onDelete(documento)
                                        setMenuAbierto(false)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Eliminar
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Título y descripción */}
                <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {documento.titulo}
                    </h3>
                    {documento.descripcion && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {documento.descripcion}
                        </p>
                    )}
                </div>

                {/* Información del archivo */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="font-medium uppercase">
                        {getFileExtension(documento.nombre_archivo)}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(documento.tamano_bytes)}</span>
                    {documento.version > 1 && (
                        <>
                            <span>•</span>
                            <span>v{documento.version}</span>
                        </>
                    )}
                </div>

                {/* Etiquetas */}
                {documento.etiquetas && documento.etiquetas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {documento.etiquetas.slice(0, 3).map((etiqueta, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs"
                            >
                                <Tag size={10} />
                                {etiqueta}
                            </span>
                        ))}
                        {documento.etiquetas.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                                +{documento.etiquetas.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Fechas */}
                <div className="space-y-2 mb-4 text-xs">
                    {documento.fecha_documento && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar size={14} />
                            <span>
                                {format(new Date(documento.fecha_documento), "d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                        </div>
                    )}
                    {documento.fecha_vencimiento && (
                        <div className={`flex items-center gap-2 ${estaVencido ? 'text-red-600 dark:text-red-400' : estaProximoAVencer ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            <AlertCircle size={14} />
                            <span>
                                Vence: {format(new Date(documento.fecha_vencimiento), "d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Acciones principales */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onView(documento)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <Eye size={16} />
                        Ver
                    </button>
                    <button
                        onClick={() => onDownload(documento)}
                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all"
                    >
                        <Download size={16} />
                    </button>
                </div>
            </div>

            {/* Barra de color de categoría */}
            {categoria && (
                <div
                    className="h-1 w-full"
                    style={{
                        background: `linear-gradient(to right, ${categoria.color}, transparent)`
                    }}
                />
            )}
        </motion.div>
    )
}
