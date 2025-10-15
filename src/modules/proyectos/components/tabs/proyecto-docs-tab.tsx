'use client'

import { FileText, Upload, FolderCog } from 'lucide-react'
import { DocumentosLista } from '../../../../modules/documentos/components/lista/documentos-lista'
import { useDocumentosStore } from '../../../../modules/documentos/store/documentos.store'

interface ProyectoDocsTabProps {
    proyectoId: string
}

/**
 * Tab de documentos del proyecto
 * Componente de presentación con acciones
 */
export function ProyectoDocsTab({ proyectoId }: ProyectoDocsTabProps) {
    const { abrirModalSubir, abrirModalCategorias } = useDocumentosStore()

    return (
        <div className="space-y-6">
            {/* Header con acciones */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Documentos del Proyecto
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Gestiona los archivos y documentación
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={abrirModalCategorias}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <FolderCog className="w-4 h-4" />
                            <span>Categorías</span>
                        </button>
                        <button
                            onClick={abrirModalSubir}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Subir Documento</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de documentos */}
            <DocumentosLista proyectoId={proyectoId} />
        </div>
    )
}
