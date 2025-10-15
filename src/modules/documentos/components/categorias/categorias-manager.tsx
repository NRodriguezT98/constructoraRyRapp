'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Edit2, GripVertical, Plus, Trash2, X } from 'lucide-react'
import { EmptyState } from '../../../../shared/components/ui/EmptyState'
import { LoadingSpinner } from '../../../../shared/components/ui/Loading'
import { useCategoriasManager } from '../../hooks'
import { CategoriaIcon } from '../shared/categoria-icon'
import { CategoriaForm } from './categoria-form'

interface CategoriasManagerProps {
  userId: string
  onClose: () => void
}

export function CategoriasManager({ userId, onClose }: CategoriasManagerProps) {
  const {
    modo,
    categoriaEditando,
    eliminando,
    categorias,
    estaCargando,
    tieneCategorias,
    handleIrACrear,
    handleIrAEditar,
    handleVolverALista,
    handleCrear,
    handleActualizar,
    handleEliminar,
    handleInicializarDefault,
  } = useCategoriasManager({ userId })

  if (estaCargando) {
    return (
      <div className='flex items-center justify-center py-12'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  if (modo === 'crear') {
    return (
      <div>
        <div className='mb-6 flex items-center justify-between'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
            Nueva Categoría
          </h3>
          <button
            onClick={handleVolverALista}
            className='rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <X size={20} />
          </button>
        </div>
        <CategoriaForm onSubmit={handleCrear} onCancel={handleVolverALista} />
      </div>
    )
  }

  if (modo === 'editar' && categoriaEditando) {
    return (
      <div>
        <div className='mb-6 flex items-center justify-between'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
            Editar Categoría
          </h3>
          <button
            onClick={handleVolverALista}
            className='rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <X size={20} />
          </button>
        </div>
        <CategoriaForm
          categoria={categoriaEditando}
          onSubmit={handleActualizar}
          onCancel={handleVolverALista}
        />
      </div>
    )
  }

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
            Mis Categorías
          </h3>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Organiza tus documentos con categorías personalizadas
          </p>
        </div>
        <button
          onClick={handleIrACrear}
          className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-purple-700'
        >
          <Plus size={20} />
          Nueva
        </button>
      </div>

      {!tieneCategorias ? (
        <div className='space-y-4'>
          <EmptyState
            icon={Plus}
            title='Sin categorías'
            description='Crea tu primera categoría o usa las sugeridas'
            action={{
              label: 'Crear categoría',
              onClick: handleIrACrear,
            }}
          />
          <div className='text-center'>
            <button
              onClick={handleInicializarDefault}
              className='text-sm text-blue-600 hover:underline dark:text-blue-400'
            >
              O usa las categorías sugeridas
            </button>
          </div>
        </div>
      ) : (
        <div className='space-y-3'>
          <AnimatePresence mode='popLayout'>
            {categorias.map((categoria, index) => (
              <motion.div
                key={categoria.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className='group relative'
              >
                <div className='flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'>
                  {/* Drag handle */}
                  <div className='cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:hover:text-gray-300'>
                    <GripVertical size={20} />
                  </div>

                  {/* Ícono */}
                  <div className='rounded-lg bg-gray-50 p-3 dark:bg-gray-900'>
                    <CategoriaIcon
                      icono={categoria.icono}
                      color={categoria.color}
                      size={24}
                    />
                  </div>

                  {/* Info */}
                  <div className='min-w-0 flex-1'>
                    <h4 className='font-semibold text-gray-900 dark:text-white'>
                      {categoria.nombre}
                    </h4>
                    {categoria.descripcion && (
                      <p className='truncate text-sm text-gray-500 dark:text-gray-400'>
                        {categoria.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className='flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                    <button
                      onClick={() => handleIrAEditar(categoria)}
                      className='rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                      title='Editar'
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleEliminar(categoria.id)}
                      disabled={eliminando === categoria.id}
                      className='rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20'
                      title='Eliminar'
                    >
                      {eliminando === categoria.id ? (
                        <LoadingSpinner size='sm' />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Botón cerrar */}
      <div className='mt-6 border-t border-gray-200 pt-6 dark:border-gray-700'>
        <button
          onClick={onClose}
          className='w-full rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
