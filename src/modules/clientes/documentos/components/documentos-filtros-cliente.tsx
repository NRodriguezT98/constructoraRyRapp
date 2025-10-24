'use client'

import { motion } from 'framer-motion'
import {
    Grid3x3,
    List as ListIcon,
    Search,
    SlidersHorizontal,
    Star,
    X,
} from 'lucide-react'
import { useState } from 'react'
import { useDocumentosClienteStore } from '../store/documentos-cliente.store'

type VistaDocumentos = 'grid' | 'lista'

interface DocumentosFiltrosClienteProps {
  onChangeVista?: (vista: VistaDocumentos) => void
}

export function DocumentosFiltrosCliente({ onChangeVista }: DocumentosFiltrosClienteProps) {
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)
  const [vista, setVista] = useState<VistaDocumentos>('lista')

  const {
    categorias,
    categoriaFiltro,
    busqueda,
    soloImportantes,
    setCategoriaFiltro,
    setBusqueda,
    setSoloImportantes,
    limpiarFiltros,
  } = useDocumentosClienteStore()

  const handleChangeVista = (nuevaVista: VistaDocumentos) => {
    setVista(nuevaVista)
    onChangeVista?.(nuevaVista)
  }

  const hayFiltrosActivos = categoriaFiltro || busqueda || soloImportantes

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
            placeholder='Buscar documentos por título o descripción...'
            className='w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-purple-400'
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
          onClick={() => setSoloImportantes(!soloImportantes)}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${
            soloImportantes
              ? 'bg-yellow-500 text-white shadow-lg'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <Star size={18} className={soloImportantes ? 'fill-white' : ''} />
          <span className='hidden sm:inline'>Importantes</span>
        </button>

        {/* Botón de filtros avanzados */}
        <button
          onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${
            mostrarFiltrosAvanzados
              ? 'bg-blue-600 text-white shadow-lg'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <SlidersHorizontal size={18} />
          <span className='hidden sm:inline'>Filtros</span>
        </button>

        {/* Controles de vista */}
        <div className='flex gap-2 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800'>
          <button
            onClick={() => handleChangeVista('grid')}
            className={`rounded-lg p-2 transition-all ${
              vista === 'grid'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
            title='Vista en cuadrícula'
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => handleChangeVista('lista')}
            className={`rounded-lg p-2 transition-all ${
              vista === 'lista'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
            title='Vista en lista'
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {mostrarFiltrosAvanzados && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className='overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50'
        >
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Filtro por categoría */}
            <div>
              <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Categoría
              </label>
              <select
                value={categoriaFiltro || ''}
                onChange={e => setCategoriaFiltro(e.target.value || null)}
                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-purple-400'
              >
                <option value=''>Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Limpiar filtros */}
            {hayFiltrosActivos && (
              <div className='flex items-end'>
                <button
                  onClick={limpiarFiltros}
                  className='w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 font-medium text-red-700 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                >
                  <X size={16} className='mr-2 inline' />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
