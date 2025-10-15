'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileX, Loader2 } from 'lucide-react'
import { DocumentoCard } from './documento-card'
import { DocumentosFiltros } from './documentos-filtros'
import {
    useDocumentosStore,
    selectDocumentosFiltrados
} from '../../store/documentos.store'
import { EmptyState } from '../../../../shared/components/ui/EmptyState'
import { LoadingSpinner } from '../../../../shared/components/ui/Loading'
import { DocumentoProyecto } from '../../../../types/documento.types'
import { DocumentosService } from '../../../../services/documentos.service'
import { useAuth } from '../../../../contexts/auth-context'

interface DocumentosListaProps {
    proyectoId: string
    onViewDocumento?: (documento: DocumentoProyecto) => void
    onUploadClick?: () => void
}

export function DocumentosLista({
    proyectoId,
    onViewDocumento,
    onUploadClick
}: DocumentosListaProps) {
    const [vista, setVista] = useState<'grid' | 'lista'>('grid')
    const { user } = useAuth()

    const {
        categorias,
        cargandoDocumentos,
        cargarDocumentos,
        cargarCategorias,
        toggleImportante,
        eliminarDocumento,
        abrirModalViewer,
        seleccionarDocumento
    } = useDocumentosStore()

    const documentosFiltrados = useDocumentosStore(selectDocumentosFiltrados)

    useEffect(() => {
        cargarDocumentos(proyectoId)
        if (user?.id) {
            cargarCategorias(user.id)
        }
    }, [proyectoId, user?.id, cargarDocumentos, cargarCategorias])

    const handleView = (documento: DocumentoProyecto) => {
        seleccionarDocumento(documento)
        abrirModalViewer(documento)
        onViewDocumento?.(documento)
    }

    const handleDownload = async (documento: DocumentoProyecto) => {
        try {
            const url = await DocumentosService.obtenerUrlDescarga(documento.url_storage)
            window.open(url, '_blank')
        } catch (error) {
            console.error('Error al descargar documento:', error)
        }
    }

    const handleToggleImportante = async (documento: DocumentoProyecto) => {
        try {
            await toggleImportante(documento.id)
        } catch (error) {
            console.error('Error al actualizar documento:', error)
        }
    }

    const handleArchive = async (documento: DocumentoProyecto) => {
        if (confirm(`¿Archivar el documento "${documento.titulo}"?`)) {
            try {
                await DocumentosService.archivarDocumento(documento.id)
                // Recargar documentos después de archivar
                await cargarDocumentos(proyectoId)
            } catch (error) {
                console.error('Error al archivar documento:', error)
            }
        }
    }

    const handleDelete = async (documento: DocumentoProyecto) => {
        if (confirm(`¿Eliminar permanentemente el documento "${documento.titulo}"? Esta acción no se puede deshacer.`)) {
            try {
                await eliminarDocumento(documento.id)
            } catch (error) {
                console.error('Error al eliminar documento:', error)
            }
        }
    }

    if (cargandoDocumentos) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <DocumentosFiltros onChangeVista={setVista} />

            {/* Lista de documentos */}
            {documentosFiltrados.length === 0 ? (
                <EmptyState
                    icon={FileX}
                    title="No se encontraron documentos"
                    description={
                        useDocumentosStore.getState().documentos.length === 0
                            ? 'Aún no has subido ningún documento a este proyecto'
                            : 'No hay documentos que coincidan con los filtros aplicados'
                    }
                    action={
                        useDocumentosStore.getState().documentos.length === 0 && onUploadClick
                            ? {
                                label: 'Subir primer documento',
                                onClick: onUploadClick
                            }
                            : undefined
                    }
                />
            ) : (
                <AnimatePresence mode="popLayout">
                    {vista === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {documentosFiltrados.map((documento, index) => {
                                const categoria = categorias.find(
                                    (c) => c.id === documento.categoria_id
                                )
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
                                            onView={handleView}
                                            onDownload={handleDownload}
                                            onToggleImportante={handleToggleImportante}
                                            onArchive={handleArchive}
                                            onDelete={handleDelete}
                                        />
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="lista"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            {documentosFiltrados.map((documento, index) => {
                                const categoria = categorias.find(
                                    (c) => c.id === documento.categoria_id
                                )
                                return (
                                    <motion.div
                                        key={documento.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <DocumentoCard
                                            documento={documento}
                                            categoria={categoria}
                                            onView={handleView}
                                            onDownload={handleDownload}
                                            onToggleImportante={handleToggleImportante}
                                            onArchive={handleArchive}
                                            onDelete={handleDelete}
                                        />
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    )
}
