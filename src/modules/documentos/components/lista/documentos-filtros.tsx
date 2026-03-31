'use client'

import { useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
    Calendar,
    Filter,
    Grid3x3,
    List as ListIcon,
    Pin,
    Search,
    SlidersHorizontal,
    X
} from 'lucide-react'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

import { useDocumentosStore } from '../../store/documentos.store'
import type { CategoriaDocumento, DocumentoProyecto } from '../../types'

type VistaDocumentos = 'grid' | 'lista'

interface DocumentosFiltrosProps {
  documentos: DocumentoProyecto[]
  categorias: CategoriaDocumento[]
  onChangeVista?: (vista: VistaDocumentos) => void
  moduleName?: ModuleName // 🎨 Tema del módulo
  initialVista?: VistaDocumentos
  currentVista?: VistaDocumentos // ← Controlado desde fuera (tiene precedencia)
}

export function DocumentosFiltros({
  documentos = [],
  categorias = [],
  onChangeVista,
  moduleName = 'proyectos', // 🎨 Default a proyectos
  initialVista = 'grid',
  currentVista,
}: DocumentosFiltrosProps) {
  // 🎨 Obtener tema dinámico
  const theme = moduleThemes[moduleName]
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)
  const [vistaInterna, setVistaInterna] = useState<VistaDocumentos>(initialVista)

  // Si el padre pasa currentVista, úsalo (componente controlado); si no, usa estado interno
  const vista = currentVista ?? vistaInterna

  const {
    categoriaFiltro,
    busqueda,
    soloImportantes,
    setFiltroCategoria,
    setBusqueda,
    toggleSoloImportantes,
    limpiarFiltros,
  } = useDocumentosStore()

  // Calcular documentos filtrados localmente para evitar loops
  const documentosFiltrados = useMemo(() => {
    return documentos.filter(doc => {
      // ✅ NO filtrar por estado aquí (se filtra en documentos-lista.tsx)
      if (categoriaFiltro && doc.categoria_id !== categoriaFiltro) return false
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
  }, [documentos, categoriaFiltro, busqueda, soloImportantes])

  // Calcular estadísticas localmente
  const estadisticas = useMemo(() => {
    // ✅ Contar TODOS (activos + archivados) para el total
    const importantes = documentos.filter(d => d.es_importante).length
    const porVencer = documentos.filter(d => {
      if (!d.fecha_vencimiento) return false
      const diasParaVencer = Math.ceil(
        (new Date(d.fecha_vencimiento).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
      return diasParaVencer <= 30 && diasParaVencer >= 0
    }).length
    return {
      total: documentos.length, // ✅ Total incluye activos + archivados
      importantes,
      porVencer,
    }
  }, [documentos])

  const handleChangeVista = (nuevaVista: VistaDocumentos) => {
    setVistaInterna(nuevaVista)
    onChangeVista?.(nuevaVista)
  }

  const hayFiltrosActivos =
    categoriaFiltro || busqueda || soloImportantes

  return (
    <div className='space-y-3'>
      {/* Barra principal de búsqueda y controles - COMPACTA */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        {/* Búsqueda */}
        <div className='relative flex-1'>
          <Search
            size={16}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
          />
          <input
            type='text'
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder='Buscar documentos por título, nombre o descripción...'
            className={`w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm transition-all ${theme.classes.focus.ring} dark:border-gray-700 dark:bg-gray-800`}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Toggle de importantes */}
        <button
          onClick={toggleSoloImportantes}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${
            soloImportantes
              ? 'bg-cyan-500 text-white shadow-lg'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <Pin size={16} className={soloImportantes ? 'fill-white' : ''} />
          <span className='hidden sm:inline'>Anclados</span>
        </button>

        {/* Toggle filtros avanzados */}
        <button
          onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${
            mostrarFiltrosAvanzados
              ? `bg-gradient-to-r ${theme.classes.gradient.primary} text-white shadow-lg`
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span className='hidden sm:inline'>Filtros</span>
        </button>

        {/* Selector de vista */}
        <div className='flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800'>
          <button
            onClick={() => handleChangeVista('grid')}
            className={`rounded-md p-1.5 transition-all ${
              vista === 'grid'
                ? `bg-gradient-to-r ${theme.classes.gradient.primary} text-white shadow-sm`
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Grid3x3 size={16} />
          </button>
          <button
            onClick={() => handleChangeVista('lista')}
            className={`rounded-md p-1.5 transition-all ${
              vista === 'lista'
                ? `bg-gradient-to-r ${theme.classes.gradient.primary} text-white shadow-sm`
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <ListIcon size={16} />
          </button>
        </div>
      </div>

      {/* Filtros avanzados - COMPACTOS */}
      <AnimatePresence>
        {mostrarFiltrosAvanzados && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='overflow-hidden'
          >
            <div className={`rounded-lg border ${theme.classes.border.light} bg-gradient-to-br ${theme.classes.gradient.background} dark:${theme.classes.gradient.backgroundDark} p-4`}>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Filtro por categoría */}
                <div>
                  <label className='mb-1.5 flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
                    <Filter size={14} />
                    Categoría
                  </label>
                  <select
                    value={categoriaFiltro || ''}
                    onChange={e => setFiltroCategoria(e.target.value || null)}
                    className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all ${theme.classes.focus.ring} dark:border-gray-700 dark:bg-gray-800`}
                  >
                    <option value=''>Todas las categorías</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
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
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm bg-gradient-to-br ${theme.classes.gradient.background} ${theme.classes.text.primary} border ${theme.classes.border.light}`}>
                {categorias.find(c => c.id === categoriaFiltro)?.nombre}
                <button
                  onClick={() => setFiltroCategoria(null)}
                  className={`rounded p-0.5 transition-colors hover:bg-white/20 dark:hover:bg-black/20`}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {soloImportantes && (
              <span className='inline-flex items-center gap-1.5 rounded-lg bg-cyan-100 px-3 py-1 text-sm text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'>
                <Pin
                  size={12}
                  className='fill-cyan-700 dark:fill-cyan-300'
                />
                Anclados
                <button
                  onClick={toggleSoloImportantes}
                  className='rounded p-0.5 hover:bg-cyan-200 dark:hover:bg-cyan-800'
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {busqueda && (
              <span className='inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
                Búsqueda: &quot;{busqueda}&quot;
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
              <Pin size={14} className='fill-cyan-500 text-cyan-500' />
              <span>{estadisticas.importantes} anclados</span>
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
