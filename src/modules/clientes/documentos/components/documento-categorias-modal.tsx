'use client'

import { CategoriaIcon } from '@/modules/documentos/components/shared/categoria-icon'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, FolderPlus, X } from 'lucide-react'
import { useDocumentosClienteStore } from '../store/documentos-cliente.store'

interface DocumentoCategoriasModalProps {
  isOpen: boolean
  categoriaActual?: string | null
  onClose: () => void
  onSeleccionar: (categoriaId: string) => void
}

export function DocumentoCategoriasModal({
  isOpen,
  categoriaActual,
  onClose,
  onSeleccionar
}: DocumentoCategoriasModalProps) {
  const { categorias } = useDocumentosClienteStore()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='absolute inset-0 bg-black/50 backdrop-blur-sm'
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className='relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800'
        >
          {/* Header */}
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                Asignar Categoría
              </h3>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Selecciona una categoría para organizar este documento
              </p>
            </div>
            <button
              onClick={onClose}
              className='rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
            >
              <X size={20} />
            </button>
          </div>

          {/* Lista de categorías */}
          <div className='space-y-2'>
            {categorias.length === 0 ? (
              <div className='rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-700/50'>
                <FolderPlus className='mx-auto mb-2 h-12 w-12 text-gray-400' />
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  No hay categorías disponibles
                </p>
                <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
                  Ve a Administración → Procesos para crear categorías
                </p>
              </div>
            ) : (
              categorias.map((categoria) => {
                const esActual = categoria.id === categoriaActual

                return (
                  <button
                    key={categoria.id}
                    onClick={() => onSeleccionar(categoria.id)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
                      esActual
                        ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      {/* Icono de categoría */}
                      <div
                        className='flex h-12 w-12 items-center justify-center rounded-lg'
                        style={{
                          background: `linear-gradient(135deg, ${categoria.color}22, ${categoria.color}44)`
                        }}
                      >
                        <CategoriaIcon
                          icono={categoria.icono}
                          color={categoria.color}
                          size={24}
                        />
                      </div>

                      {/* Nombre y descripción */}
                      <div className='text-left'>
                        <div className='font-semibold text-gray-900 dark:text-white'>
                          {categoria.nombre}
                        </div>
                        {categoria.descripcion && (
                          <div className='text-xs text-gray-500 dark:text-gray-400'>
                            {categoria.descripcion}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Checkmark si está seleccionada */}
                    {esActual && (
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white'>
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                )
              })
            )}

            {/* Opción "Sin categoría" */}
            <button
              onClick={() => onSeleccionar('')}
              className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
                !categoriaActual
                  ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600'
              }`}
            >
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-600'>
                  <FolderPlus size={24} className='text-gray-400 dark:text-gray-300' />
                </div>
                <div className='text-left'>
                  <div className='font-semibold text-gray-900 dark:text-white'>
                    Sin Categoría
                  </div>
                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    Remover categoría asignada
                  </div>
                </div>
              </div>
              {!categoriaActual && (
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white'>
                  <Check size={14} />
                </div>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className='mt-6 flex justify-end gap-3'>
            <button
              onClick={onClose}
              className='rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
