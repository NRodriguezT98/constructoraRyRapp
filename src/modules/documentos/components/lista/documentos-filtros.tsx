'use client'

import { useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
    Calendar,
    Filter,
    Grid3x3,
    List as ListIcon,
    Search,
    SlidersHorizontal,
    Star,
    Tag as TagIcon,
    X,
} from 'lucide-react'

import { useDocumentosStore } from '../../store/documentos.store'
import type { CategoriaDocumento, DocumentoProyecto } from '../../types'

type VistaDocumentos = 'grid' | 'lista'

interface DocumentosFiltrosProps {
  documentos: DocumentoProyecto[]
  categorias: CategoriaDocumento[]
  onChangeVista?: (vista: VistaDocumentos) => void
}

export function DocumentosFiltros({
  documentos = [],
  categorias = [],
  onChangeVista
}: DocumentosFiltrosProps) {
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)
  const [vista, setVista] = useState<VistaDocumentos>('grid')

  const {
    categoriaFiltro,
    etiquetasFiltro,
    busqueda,
    soloImportantes,
    setFiltroCategoria,
    setFiltroEtiquetas,
    setBusqueda,
    toggleSoloImportantes,
    limpiarFiltros,
  } = useDocumentosStore()

  // Calcular documentos filtrados localmente para evitar loops
  const documentosFiltrados = useMemo(() => {
    return documentos.filter(doc => {
      if (doc.estado === 'archivado') return false
      if (categoriaFiltro && doc.categoria_id !== categoriaFiltro) return false
      if (etiquetasFiltro.length > 0) {
        const docEtiquetas = doc.etiquetas || []
        if (!etiquetasFiltro.some(tag => docEtiquetas.includes(tag)))
          return false
      }
      if (busqueda) {
        const searchLower = busqueda.toLowerCase()
        const tituloMatch = doc.titulo.toLowerCase().includes(searchLower)
        const descripcionMatch = doc.descripcion
          ?.toLowerCase()
          .includes(searchLower)
        if (!tituloMatch && !descripcionMatch) return false
      }
      if (soloImportantes && !doc.es_importante) return false
      return true
    })
  }, [documentos, categoriaFiltro, etiquetasFiltro, busqueda, soloImportantes])

  // Calcular estadísticas localmente
  const estadisticas = useMemo(() => {
    const activos = documentos.filter(d => d.estado !== 'archivado')
    const importantes = activos.filter(d => d.es_importante).length
    const porVencer = activos.filter(d => {
      if (!d.fecha_vencimiento) return false
      const diasParaVencer = Math.ceil(
        (new Date(d.fecha_vencimiento).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
      return diasParaVencer <= 30 && diasParaVencer >= 0
    }).length
    return {
      total: activos.length,
      importantes,
      porVencer,
    }
  }, [documentos])

  const etiquetasUnicas = useMemo(() => {
    return Array.from(new Set(documentos.flatMap(doc => doc.etiquetas || [])))
  }, [documentos])

  const handleChangeVista = (nuevaVista: VistaDocumentos) => {
    setVista(nuevaVista)
    onChangeVista?.(nuevaVista)
  }

  const hayFiltrosActivos =
    categoriaFiltro || etiquetasFiltro.length > 0 || busqueda || soloImportantes

  return (
    <div className='space-y-4'>
      {/* Barra principal de búsqueda y controles */}
      <div className='flex flex-col gap-3 sm:flex-row'>
        {/* Búsqueda */}
        <div className='relative flex-1'>
          <Search
            size={18}
            className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
          />
          <input
            type='text'
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder='Buscar documentos por título, nombre o descripción...'
            className='w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-400'
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Toggle de importantes */}
        <button
          onClick={toggleSoloImportantes}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${
            soloImportantes
              ? 'bg-yellow-500 text-white shadow-lg'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <Star size={18} className={soloImportantes ? 'fill-white' : ''} />
          <span className='hidden sm:inline'>Importantes</span>
        </button>

        {/* Toggle filtros avanzados */}
        <button
          onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${
            mostrarFiltrosAvanzados
              ? 'bg-blue-500 text-white shadow-lg'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <SlidersHorizontal size={18} />
          <span className='hidden sm:inline'>Filtros</span>
        </button>

        {/* Selector de vista */}
        <div className='flex rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800'>
          <button
            onClick={() => handleChangeVista('grid')}
            className={`rounded-lg p-2 transition-all ${
              vista === 'grid'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => handleChangeVista('lista')}
            className={`rounded-lg p-2 transition-all ${
              vista === 'lista'
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
            className='overflow-hidden'
          >
            <div className='rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-purple-900/20'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Filtro por categoría */}
                <div>
                  <label className='mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                    <Filter size={16} />
                    Categoría
                  </label>
                  <select
                    value={categoriaFiltro || ''}
                    onChange={e => setFiltroCategoria(e.target.value || null)}
                    className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-400'
                  >
                    <option value=''>Todas las categorías</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por etiquetas */}
                <div>
                  <label className='mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                    <TagIcon size={16} />
                    Etiquetas
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {etiquetasUnicas.length > 0 ? (
                      etiquetasUnicas.map(etiqueta => {
                        const estaSeleccionada =
                          etiquetasFiltro.includes(etiqueta)
                        return (
                          <button
                            key={etiqueta}
                            onClick={() => {
                              if (estaSeleccionada) {
                                setFiltroEtiquetas(
                                  etiquetasFiltro.filter(e => e !== etiqueta)
                                )
                              } else {
                                setFiltroEtiquetas([
                                  ...etiquetasFiltro,
                                  etiqueta,
                                ])
                              }
                            }}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                              estaSeleccionada
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            {etiqueta}
                          </button>
                        )
                      })
                    ) : (
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
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
      <div className='flex flex-wrap items-center justify-between gap-4'>
        {/* Filtros activos */}
        {hayFiltrosActivos && (
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              Filtros activos:
            </span>

            {categoriaFiltro && (
              <span className='inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                {categorias.find(c => c.id === categoriaFiltro)?.nombre}
                <button
                  onClick={() => setFiltroCategoria(null)}
                  className='rounded p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800'
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {etiquetasFiltro.map(etiqueta => (
              <span
                key={etiqueta}
                className='inline-flex items-center gap-1.5 rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
              >
                {etiqueta}
                <button
                  onClick={() =>
                    setFiltroEtiquetas(
                      etiquetasFiltro.filter(e => e !== etiqueta)
                    )
                  }
                  className='rounded p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800'
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {soloImportantes && (
              <span className='inline-flex items-center gap-1.5 rounded-lg bg-yellow-100 px-3 py-1 text-sm text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'>
                <Star
                  size={12}
                  className='fill-yellow-700 dark:fill-yellow-300'
                />
                Importantes
                <button
                  onClick={toggleSoloImportantes}
                  className='rounded p-0.5 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {busqueda && (
              <span className='inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
                Búsqueda: "{busqueda}"
                <button
                  onClick={() => setBusqueda('')}
                  className='rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600'
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              onClick={limpiarFiltros}
              className='text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
            >
              Limpiar todos
            </button>
          </div>
        )}

        {/* Estadísticas */}
        <div className='ml-auto flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400'>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-blue-500' />
            <span>
              {documentosFiltrados.length} de {estadisticas.total} documentos
            </span>
          </div>
          {estadisticas.importantes > 0 && (
            <div className='flex items-center gap-2'>
              <Star size={14} className='fill-yellow-500 text-yellow-500' />
              <span>{estadisticas.importantes} importantes</span>
            </div>
          )}
          {estadisticas.porVencer > 0 && (
            <div className='flex items-center gap-2'>
              <Calendar size={14} className='text-orange-500' />
              <span>{estadisticas.porVencer} por vencer</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
