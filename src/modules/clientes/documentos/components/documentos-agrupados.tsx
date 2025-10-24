'use client'

import { DocumentoCardHorizontal } from '@/modules/documentos/components/lista/documento-card-horizontal'
import { CategoriaIcon } from '@/modules/documentos/components/shared/categoria-icon'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface DocumentosAgrupadosProps {
  documentos: any[]
  categorias: any[]
  onView: (doc: any) => void
  onDownload: (doc: any) => void
  onToggleImportante: (doc: any) => void
  onArchive: (doc: any) => void
  onDelete: (doc: any) => void
  onRename: (doc: any) => void
  onAsignarCategoria: (doc: any) => void
}

export function DocumentosAgrupados({
  documentos,
  categorias,
  onView,
  onDownload,
  onToggleImportante,
  onArchive,
  onDelete,
  onRename,
  onAsignarCategoria,
}: DocumentosAgrupadosProps) {
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<string>>(
    new Set(categorias.map(c => c.id))
  )

  const toggleCategoria = (categoriaId: string) => {
    setCategoriasExpandidas(prev => {
      const nuevo = new Set(prev)
      if (nuevo.has(categoriaId)) {
        nuevo.delete(categoriaId)
      } else {
        nuevo.add(categoriaId)
      }
      return nuevo
    })
  }

  // Agrupar documentos por categoría
  const documentosPorCategoria = categorias.map(categoria => ({
    categoria,
    documentos: documentos.filter(doc => doc.categoria_id === categoria.id)
  }))

  // Documentos sin categoría
  const docsSinCategoria = documentos.filter(doc => !doc.categoria_id)

  return (
    <div className='space-y-4'>
      {/* Categorías con documentos */}
      {documentosPorCategoria.map(({ categoria, documentos: docs }) => {
        if (docs.length === 0) return null

        const estaExpandida = categoriasExpandidas.has(categoria.id)

        return (
          <div key={categoria.id} className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'>
            {/* Header de categoría */}
            <button
              onClick={() => toggleCategoria(categoria.id)}
              className='flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50'
            >
              <div className='flex items-center gap-3'>
                {/* Ícono de categoría */}
                <div
                  className='flex h-10 w-10 items-center justify-center rounded-lg'
                  style={{
                    background: `linear-gradient(135deg, ${categoria.color}22, ${categoria.color}44)`
                  }}
                >
                  <CategoriaIcon
                    icono={categoria.icono}
                    color={categoria.color}
                    size={20}
                  />
                </div>

                {/* Nombre y contador */}
                <div className='text-left'>
                  <h3 className='font-semibold text-gray-900 dark:text-white'>
                    {categoria.nombre}
                  </h3>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
                  </p>
                </div>
              </div>

              {/* Ícono expandir/contraer */}
              <div className='text-gray-400'>
                {estaExpandida ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
            </button>

            {/* Lista de documentos */}
            <AnimatePresence>
              {estaExpandida && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className='border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20'
                >
                  <div className='space-y-2 p-4'>
                    {docs.map(documento => (
                      <DocumentoCardHorizontal
                        key={documento.id}
                        documento={documento}
                        categoria={categoria}
                        onView={onView}
                        onDownload={onDownload}
                        onToggleImportante={onToggleImportante}
                        onArchive={onArchive}
                        onDelete={onDelete}
                        onRename={onRename}
                        onAsignarCategoria={onAsignarCategoria}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Documentos sin categoría */}
      {docsSinCategoria.length > 0 && (
        <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'>
          <button
            onClick={() => toggleCategoria('sin-categoria')}
            className='flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700'>
                <span className='text-xl'>📁</span>
              </div>

              <div className='text-left'>
                <h3 className='font-semibold text-gray-900 dark:text-white'>
                  Sin Categoría
                </h3>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {docsSinCategoria.length} {docsSinCategoria.length === 1 ? 'documento' : 'documentos'}
                </p>
              </div>
            </div>

            <div className='text-gray-400'>
              {categoriasExpandidas.has('sin-categoria') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </button>

          <AnimatePresence>
            {categoriasExpandidas.has('sin-categoria') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20'
              >
                <div className='space-y-2 p-4'>
                  {docsSinCategoria.map(documento => (
                    <DocumentoCardHorizontal
                      key={documento.id}
                      documento={documento}
                      onView={onView}
                      onDownload={onDownload}
                      onToggleImportante={onToggleImportante}
                      onArchive={onArchive}
                      onDelete={onDelete}
                      onRename={onRename}
                      onAsignarCategoria={onAsignarCategoria}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
