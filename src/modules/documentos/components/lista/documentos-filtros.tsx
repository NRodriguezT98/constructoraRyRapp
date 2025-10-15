'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import {
    Search,
    Filter,
    X,
    Star,
    Calendar,
    Tag as TagIcon,
    SlidersHorizontal,
    Grid3x3,
    List as ListIcon
} from 'lucide-react'
import { useDocumentosStore } from '../../store/documentos.store'

type VistaDocumentos = 'grid' | 'lista'

interface DocumentosFiltrosProps {
    onChangeVista?: (vista: VistaDocumentos) => void
}

export function DocumentosFiltros({ onChangeVista }: DocumentosFiltrosProps) {
    const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)
    const [vista, setVista] = useState<VistaDocumentos>('grid')

    const {
        categorias,
        categoriaFiltro,
        etiquetasFiltro,
        busqueda,
        soloImportantes,
        documentos,
        setFiltroCategoria,
        setFiltroEtiquetas,
        setBusqueda,
        toggleSoloImportantes,
        limpiarFiltros
    } = useDocumentosStore()

    // Calcular documentos filtrados localmente para evitar loops
    const documentosFiltrados = useMemo(() => {
        return documentos.filter((doc) => {
            if (doc.estado === 'archivado') return false
            if (categoriaFiltro && doc.categoria_id !== categoriaFiltro) return false
            if (etiquetasFiltro.length > 0) {
                const docEtiquetas = doc.etiquetas || []
                if (!etiquetasFiltro.some((tag) => docEtiquetas.includes(tag))) return false
            }
            if (busqueda) {
                const searchLower = busqueda.toLowerCase()
                const tituloMatch = doc.titulo.toLowerCase().includes(searchLower)
                const descripcionMatch = doc.descripcion?.toLowerCase().includes(searchLower)
                if (!tituloMatch && !descripcionMatch) return false
            }
            if (soloImportantes && !doc.es_importante) return false
            return true
        })
    }, [documentos, categoriaFiltro, etiquetasFiltro, busqueda, soloImportantes])

    // Calcular estadísticas localmente
    const estadisticas = useMemo(() => {
        const activos = documentos.filter((d) => d.estado !== 'archivado')
        const importantes = activos.filter((d) => d.es_importante).length
        const porVencer = activos.filter((d) => {
            if (!d.fecha_vencimiento) return false
            const diasParaVencer = Math.ceil(
                (new Date(d.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
            return diasParaVencer <= 30 && diasParaVencer >= 0
        }).length
        return {
            total: activos.length,
            importantes,
            porVencer
        }
    }, [documentos])

    const etiquetasUnicas = useMemo(() => {
        return Array.from(
            new Set(
                documentos.flatMap((doc) => doc.etiquetas || [])
            )
        )
    }, [documentos])

    const handleChangeVista = (nuevaVista: VistaDocumentos) => {
        setVista(nuevaVista)
        onChangeVista?.(nuevaVista)
    }

    const hayFiltrosActivos =
        categoriaFiltro || etiquetasFiltro.length > 0 || busqueda || soloImportantes

    return (
        <div className="space-y-4">
            {/* Barra principal de búsqueda y controles */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Búsqueda */}
                <div className="flex-1 relative">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar documentos por título, nombre o descripción..."
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                    />
                    {busqueda && (
                        <button
                            onClick={() => setBusqueda('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Toggle de importantes */}
                <button
                    onClick={toggleSoloImportantes}
                    className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${soloImportantes
                            ? 'bg-yellow-500 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <Star size={18} className={soloImportantes ? 'fill-white' : ''} />
                    <span className="hidden sm:inline">Importantes</span>
                </button>

                {/* Toggle filtros avanzados */}
                <button
                    onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${mostrarFiltrosAvanzados
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <SlidersHorizontal size={18} />
                    <span className="hidden sm:inline">Filtros</span>
                </button>

                {/* Selector de vista */}
                <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                    <button
                        onClick={() => handleChangeVista('grid')}
                        className={`p-2 rounded-lg transition-all ${vista === 'grid'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Grid3x3 size={18} />
                    </button>
                    <button
                        onClick={() => handleChangeVista('lista')}
                        className={`p-2 rounded-lg transition-all ${vista === 'lista'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <ListIcon size={18} />
                    </button>
                </div>
            </div>

            {/* Filtros avanzados */}
            <AnimatePresence>
                {mostrarFiltrosAvanzados && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Filtro por categoría */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <Filter size={16} />
                                        Categoría
                                    </label>
                                    <select
                                        value={categoriaFiltro || ''}
                                        onChange={(e) => setFiltroCategoria(e.target.value || null)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categorias.map((categoria) => (
                                            <option key={categoria.id} value={categoria.id}>
                                                {categoria.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por etiquetas */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <TagIcon size={16} />
                                        Etiquetas
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {etiquetasUnicas.length > 0 ? (
                                            etiquetasUnicas.map((etiqueta) => {
                                                const estaSeleccionada = etiquetasFiltro.includes(etiqueta)
                                                return (
                                                    <button
                                                        key={etiqueta}
                                                        onClick={() => {
                                                            if (estaSeleccionada) {
                                                                setFiltroEtiquetas(
                                                                    etiquetasFiltro.filter((e) => e !== etiqueta)
                                                                )
                                                            } else {
                                                                setFiltroEtiquetas([...etiquetasFiltro, etiqueta])
                                                            }
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${estaSeleccionada
                                                                ? 'bg-blue-500 text-white shadow-lg'
                                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        {etiqueta}
                                                    </button>
                                                )
                                            })
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No hay etiquetas disponibles
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Indicadores de filtros activos y estadísticas */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Filtros activos */}
                {hayFiltrosActivos && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Filtros activos:
                        </span>

                        {categoriaFiltro && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                                {categorias.find((c) => c.id === categoriaFiltro)?.nombre}
                                <button
                                    onClick={() => setFiltroCategoria(null)}
                                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {etiquetasFiltro.map((etiqueta) => (
                            <span
                                key={etiqueta}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm"
                            >
                                {etiqueta}
                                <button
                                    onClick={() =>
                                        setFiltroEtiquetas(etiquetasFiltro.filter((e) => e !== etiqueta))
                                    }
                                    className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}

                        {soloImportantes && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm">
                                <Star size={12} className="fill-yellow-700 dark:fill-yellow-300" />
                                Importantes
                                <button
                                    onClick={toggleSoloImportantes}
                                    className="hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {busqueda && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                                Búsqueda: "{busqueda}"
                                <button
                                    onClick={() => setBusqueda('')}
                                    className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        <button
                            onClick={limpiarFiltros}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                            Limpiar todos
                        </button>
                    </div>
                )}

                {/* Estadísticas */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 ml-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>
                            {documentosFiltrados.length} de {estadisticas.total} documentos
                        </span>
                    </div>
                    {estadisticas.importantes > 0 && (
                        <div className="flex items-center gap-2">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span>{estadisticas.importantes} importantes</span>
                        </div>
                    )}
                    {estadisticas.porVencer > 0 && (
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-orange-500" />
                            <span>{estadisticas.porVencer} por vencer</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
