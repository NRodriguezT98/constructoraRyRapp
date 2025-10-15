'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, GripVertical, X } from 'lucide-react'
import { useDocumentosStore } from '../../store/documentos.store'
import { CategoriaIcon } from '../shared/categoria-icon'
import { CategoriaForm } from './categoria-form'
import { Modal } from '../../../../shared/components/ui/Modal'
import { LoadingSpinner } from '../../../../shared/components/ui/Loading'
import { EmptyState } from '../../../../shared/components/ui/EmptyState'
import type { CategoriaFormData } from '../../schemas/documento.schema'

interface CategoriasManagerProps {
    userId: string
    onClose: () => void
}

export function CategoriasManager({ userId, onClose }: CategoriasManagerProps) {
    const {
        categorias,
        cargandoCategorias,
        cargarCategorias,
        crearCategoria,
        actualizarCategoria,
        eliminarCategoria,
        inicializarCategoriasDefault,
    } = useDocumentosStore()

    const [modo, setModo] = useState<'lista' | 'crear' | 'editar'>('lista')
    const [categoriaEditando, setCategoriaEditando] = useState<any>(null)
    const [eliminando, setEliminando] = useState<string | null>(null)

    useEffect(() => {
        cargarCategorias(userId)
    }, [userId])

    const handleCrear = async (data: CategoriaFormData) => {
        await crearCategoria(userId, {
            ...data,
            orden: categorias.length + 1,
        })
        setModo('lista')
    }

    const handleActualizar = async (data: CategoriaFormData) => {
        if (!categoriaEditando) return
        await actualizarCategoria(categoriaEditando.id, data)
        setModo('lista')
        setCategoriaEditando(null)
    }

    const handleEliminar = async (categoriaId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
        setEliminando(categoriaId)
        try {
            await eliminarCategoria(categoriaId)
        } finally {
            setEliminando(null)
        }
    }

    const handleInicializarDefault = async () => {
        await inicializarCategoriasDefault(userId)
    }

    if (cargandoCategorias) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (modo === 'crear') {
        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Nueva Categoría
                    </h3>
                    <button
                        onClick={() => setModo('lista')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <CategoriaForm
                    onSubmit={handleCrear}
                    onCancel={() => setModo('lista')}
                />
            </div>
        )
    }

    if (modo === 'editar' && categoriaEditando) {
        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Editar Categoría
                    </h3>
                    <button
                        onClick={() => {
                            setModo('lista')
                            setCategoriaEditando(null)
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <CategoriaForm
                    categoria={categoriaEditando}
                    onSubmit={handleActualizar}
                    onCancel={() => {
                        setModo('lista')
                        setCategoriaEditando(null)
                    }}
                />
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Mis Categorías
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Organiza tus documentos con categorías personalizadas
                    </p>
                </div>
                <button
                    onClick={() => setModo('crear')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 font-medium"
                >
                    <Plus size={20} />
                    Nueva
                </button>
            </div>

            {categorias.length === 0 ? (
                <div className="space-y-4">
                    <EmptyState
                        icon={Plus}
                        title="Sin categorías"
                        description="Crea tu primera categoría o usa las sugeridas"
                        action={{
                            label: 'Crear categoría',
                            onClick: () => setModo('crear'),
                        }}
                    />
                    <div className="text-center">
                        <button
                            onClick={handleInicializarDefault}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            O usa las categorías sugeridas
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {categorias.map((categoria, index) => (
                            <motion.div
                                key={categoria.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative group"
                            >
                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all">
                                    {/* Drag handle */}
                                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <GripVertical size={20} />
                                    </div>

                                    {/* Ícono */}
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <CategoriaIcon
                                            icono={categoria.icono}
                                            color={categoria.color}
                                            size={24}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {categoria.nombre}
                                        </h4>
                                        {categoria.descripcion && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {categoria.descripcion}
                                            </p>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setCategoriaEditando(categoria)
                                                setModo('editar')
                                            }}
                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(categoria.id)}
                                            disabled={eliminando === categoria.id}
                                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                            title="Eliminar"
                                        >
                                            {eliminando === categoria.id ? (
                                                <LoadingSpinner size="sm" />
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
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={onClose}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                    Cerrar
                </button>
            </div>
        </div>
    )
}
