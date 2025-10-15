'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    FileText,
    Info,
    Settings,
    Loader2,
    Upload,
    FolderCog,
    Building2
} from 'lucide-react'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { Modal } from '../../../shared/components/ui/Modal'
import { Proyecto } from '../../../modules/proyectos/types'
import { DocumentosLista } from '../../../modules/documentos/components/lista/documentos-lista'
import { DocumentoUpload } from '../../../modules/documentos/components/upload/documento-upload'
import { CategoriasManager } from '../../../modules/documentos/components/categorias/categorias-manager'
import { DocumentoViewer } from '../../../modules/documentos/components/viewer/documento-viewer'
import { useDocumentosStore } from '../../../modules/documentos/store/documentos.store'
import { useAuth } from '../../../contexts/auth-context'
import { DocumentosService } from '../../../services/documentos.service'

interface ProyectoDetalleClientProps {
    proyectoId: string
}

type Tab = 'informacion' | 'documentos' | 'configuracion'

export default function ProyectoDetalleClient({ proyectoId }: ProyectoDetalleClientProps) {
    const router = useRouter()
    const { user } = useAuth() // Obtener usuario autenticado
    const [tabActiva, setTabActiva] = useState<Tab>('informacion')
    const [proyecto, setProyecto] = useState<Proyecto | null>(null)
    const [cargando, setCargando] = useState(true)
    const [urlPreview, setUrlPreview] = useState<string | null>(null)

    const {
        modalSubirAbierto,
        modalCategoriasAbierto,
        modalViewerAbierto,
        documentoSeleccionado,
        abrirModalSubir,
        cerrarModalSubir,
        abrirModalCategorias,
        cerrarModalCategorias,
        cerrarModalViewer,
        eliminarDocumento
    } = useDocumentosStore()

    useEffect(() => {
        // TODO: Cargar proyecto desde Supabase
        // Por ahora simulamos la carga
        const cargarProyecto = async () => {
            setCargando(true)
            try {
                // Aquí iría la llamada a Supabase
                // const { data } = await supabase.from('proyectos').select('*').eq('id', proyectoId).single()
                // setProyecto(data)

                // Simulación temporal
                await new Promise(resolve => setTimeout(resolve, 500))
                setProyecto({
                    id: proyectoId,
                    nombre: 'Proyecto Ejemplo',
                    descripcion: 'Descripción del proyecto',
                    ubicacion: 'Ubicación ejemplo',
                    estado: 'en_construccion',
                    fechaInicio: new Date().toISOString(),
                    fechaFinEstimada: new Date().toISOString(),
                    presupuesto: 1000000,
                    manzanas: [],
                    responsable: 'Responsable',
                    telefono: '123456789',
                    email: 'test@test.com',
                    fechaCreacion: new Date().toISOString(),
                    fechaActualizacion: new Date().toISOString()
                })
            } catch (error) {
                console.error('Error al cargar proyecto:', error)
            } finally {
                setCargando(false)
            }
        }

        cargarProyecto()
    }, [proyectoId])

    // Cargar URL de preview cuando se abre el viewer
    useEffect(() => {
        if (modalViewerAbierto && documentoSeleccionado) {
            const cargarPreview = async () => {
                try {
                    const url = await DocumentosService.obtenerUrlDescarga(
                        documentoSeleccionado.url_storage,
                        3600
                    )
                    setUrlPreview(url)
                } catch (error) {
                    console.error('Error cargando preview:', error)
                }
            }
            cargarPreview()
        } else {
            setUrlPreview(null)
        }
    }, [modalViewerAbierto, documentoSeleccionado])

    const handleDownloadDocumento = async () => {
        if (!documentoSeleccionado) return
        try {
            const blob = await DocumentosService.descargarArchivo(
                documentoSeleccionado.url_storage
            )
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = documentoSeleccionado.nombre_original
            a.click()
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error descargando:', error)
        }
    }

    const handleDeleteDocumento = async () => {
        if (!documentoSeleccionado) return
        if (confirm('¿Estás seguro de eliminar este documento?')) {
            await eliminarDocumento(documentoSeleccionado.id)
            cerrarModalViewer()
        }
    }

    const tabs = [
        { id: 'informacion' as Tab, label: 'Información', icon: Info },
        { id: 'documentos' as Tab, label: 'Documentos', icon: FileText },
        { id: 'configuracion' as Tab, label: 'Configuración', icon: Settings }
    ]

    if (cargando) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando proyecto...</p>
                </div>
            </div>
        )
    }

    if (!proyecto) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Proyecto no encontrado</p>
                    <button
                        onClick={() => router.push('/proyectos')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Volver a proyectos
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Botón volver */}
                <button
                    onClick={() => router.push('/proyectos')}
                    className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Volver a proyectos</span>
                </button>

                {/* Header */}
                <PageHeader
                    title={proyecto.nombre}
                    description={proyecto.descripcion || 'Sin descripción'}
                    icon={Building2}
                />

                {/* Tabs */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Tab headers */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex -mb-px">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = tabActiva === tab.id

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setTabActiva(tab.id)}
                                        className={`
                      relative flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all
                      ${isActive
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }
                    `}
                                    >
                                        <Icon size={18} />
                                        {tab.label}

                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
                                            />
                                        )}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Tab content */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {tabActiva === 'informacion' && (
                                <motion.div
                                    key="informacion"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Información del Proyecto
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Nombre
                                            </label>
                                            <p className="mt-1 text-gray-900 dark:text-white">{proyecto.nombre}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Estado
                                            </label>
                                            <p className="mt-1 text-gray-900 dark:text-white">{proyecto.estado}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Ubicación
                                            </label>
                                            <p className="mt-1 text-gray-900 dark:text-white">{proyecto.ubicacion}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Presupuesto Total
                                            </label>
                                            <p className="mt-1 text-gray-900 dark:text-white">
                                                ${proyecto.presupuesto?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {tabActiva === 'documentos' && (
                                <motion.div
                                    key="documentos"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Header de documentos con acciones */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Documentos del Proyecto
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Gestiona todos los documentos, licencias y permisos
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => abrirModalCategorias()}
                                                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all flex items-center gap-2"
                                            >
                                                <FolderCog size={18} />
                                                <span className="hidden sm:inline">Categorías</span>
                                            </button>

                                            <button
                                                onClick={() => abrirModalSubir()}
                                                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg"
                                            >
                                                <Upload size={18} />
                                                <span className="hidden sm:inline">Subir documento</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Lista de documentos */}
                                    <DocumentosLista
                                        proyectoId={proyectoId}
                                        onUploadClick={() => abrirModalSubir()}
                                    />

                                    {/* Modal de subir documento */}
                                    <Modal
                                        isOpen={modalSubirAbierto}
                                        onClose={cerrarModalSubir}
                                        title="Subir Documento"
                                    >
                                        <DocumentoUpload
                                            proyectoId={proyectoId}
                                            onSuccess={() => {
                                                cerrarModalSubir()
                                                // La lista se actualizará automáticamente gracias al store
                                            }}
                                            onCancel={cerrarModalSubir}
                                        />
                                    </Modal>

                                    {/* Modal de gestión de categorías */}
                                    <Modal
                                        isOpen={modalCategoriasAbierto}
                                        onClose={cerrarModalCategorias}
                                        title="Gestionar Categorías"
                                    >
                                        <CategoriasManager
                                            userId={user?.id || '00000000-0000-0000-0000-000000000000'}
                                            onClose={cerrarModalCategorias}
                                        />
                                    </Modal>

                                    {/* Visor de documentos */}
                                    <DocumentoViewer
                                        documento={documentoSeleccionado}
                                        isOpen={modalViewerAbierto}
                                        onClose={cerrarModalViewer}
                                        onDownload={handleDownloadDocumento}
                                        onDelete={handleDeleteDocumento}
                                        urlPreview={urlPreview || undefined}
                                    />
                                </motion.div>
                            )}

                            {tabActiva === 'configuracion' && (
                                <motion.div
                                    key="configuracion"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div className="text-center py-12">
                                        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Configuración
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Próximamente: Configuración del proyecto
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
